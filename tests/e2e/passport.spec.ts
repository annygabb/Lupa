import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const wcag = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

// Fluxos de dados e exportação; o movimento tem testes próprios. Sem Lenis, a rolagem do
// Playwright até um link não é desfeita pela rolagem de reinício da página.
test.use({ reducedMotion: "reduce" });

test.describe("Passaporte da Evidência", () => {
  test("passaporte E04 mostra status pendente, exporta JSON e abre o comparador pré-selecionado", async ({ page }) => {
    await page.goto("/evidencias/E04");
    const passport = page.locator("#passaporte");
    await expect(passport.getByRole("heading", { name: "Passaporte da Evidência" })).toBeVisible();
    await expect(passport.getByText(/revisão clínica independente pendente/i).first()).toBeVisible();
    await expect(passport.getByRole("heading", { name: "O que o estudo observou" })).toBeVisible();
    await expect(passport.getByRole("heading", { name: /O que o estudo não prova/i })).toBeVisible();
    await expect(passport.getByText("passport-v1")).toBeVisible();

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      passport.getByRole("button", { name: "Exportar JSON" }).click(),
    ]);
    expect(download.suggestedFilename()).toBe("lupa-passaporte-E04.json");
    const file = await download.path();
    const json = JSON.parse(await readFile(file, "utf-8"));
    expect(json).toMatchObject({
      schemaVersion: "passport-v1",
      lupaId: "E04",
      reviewStatus: { independentClinicalReview: { done: false, label: "pendente" } },
      projectionApproved: false,
    });
    await expect(passport.getByRole("status")).toContainText("lupa-passaporte-E04.json");

    const [markdown] = await Promise.all([
      page.waitForEvent("download"),
      passport.getByRole("button", { name: "Exportar Markdown" }).click(),
    ]);
    expect(markdown.suggestedFilename()).toBe("lupa-passaporte-E04.md");

    const source = passport.getByRole("link", { name: /Abrir fonte original/ });
    await expect(source).toHaveAttribute("target", "_blank");
    await expect(source).toHaveAttribute("rel", /noopener/);
    await expect(source).toHaveAttribute("rel", /noreferrer/);

    await passport.getByRole("link", { name: "Comparar com outro estudo" }).click();
    await expect(page).toHaveURL(/\/comparar\?a=E04$/);
    await expect(page.locator("#compare-left")).toHaveValue("E04");
    await expect(page.locator("#compare-right")).toHaveValue("E12");
  });

  test("passaporte aberto por alias mantém o registro canônico e a ficha passa no axe", async ({ page }) => {
    await page.goto("/evidencias/P20");
    const passport = page.locator("#passaporte");
    await expect(passport.getByText("E04", { exact: true }).first()).toBeVisible();
    await expect(passport.getByRole("link", { name: "Comparar com outro estudo" })).toHaveAttribute("href", "/comparar?a=E04");
    const results = await new AxeBuilder({ page }).withTags(wcag).analyze();
    expect(results.violations.map(v => ({ id: v.id, nodes: v.nodes.slice(0, 3).map(n => n.target) }))).toEqual([]);
  });
});

/** A bancada ligada à URL substitui a cópia estática do Suspense; espera restar só ela. */
async function benchReady(page: Page) {
  await expect(page.locator("#compare-left")).toBeVisible();
  await expect(page.locator(".cp-bench")).toHaveCount(1);
}

test.describe("pré-seleção do comparador por URL", () => {
  test("alias na URL resolve para o canônico e trocar estudos atualiza a URL sem recarregar", async ({ page }) => {
    await page.goto("/comparar?a=P20&b=E12");
    await benchReady(page);
    const left = page.locator("#compare-left");
    const right = page.locator("#compare-right");
    await expect(left).toHaveValue("E04");
    await expect(right).toHaveValue("E12");

    await page.evaluate(() => { (window as unknown as { __lupaNoReload: boolean }).__lupaNoReload = true; });
    await right.selectOption("E16");
    await expect(page).toHaveURL(/\/comparar\?a=E04&b=E16$/);
    await page.getByRole("button", { name: "Trocar posições dos estudos" }).click();
    await expect(page).toHaveURL(/\/comparar\?a=E16&b=E04$/);
    await expect(left).toHaveValue("E16");
    expect(await page.evaluate(() => (window as unknown as { __lupaNoReload?: boolean }).__lupaNoReload)).toBe(true);
  });

  test("parâmetros inválidos caem no par padrão e o mesmo estudo continua bloqueado", async ({ page }) => {
    await page.goto("/comparar?a=E99&b=%3Cscript%3E");
    await expect(page.locator("#compare-left")).toHaveValue("E04");
    await expect(page.locator("#compare-right")).toHaveValue("E12");

    await page.goto("/comparar?a=E04&b=P20");
    await expect(page.locator("#compare-left")).toHaveValue("E04");
    await expect(page.locator("#compare-right")).toHaveValue("E04");
    await expect(page.getByRole("heading", { name: "Selecione dois estudos diferentes" })).toBeVisible();
  });

  test("veredito explica por que não somar com os motivos específicos do par", async ({ page }) => {
    await page.goto("/comparar?a=E04&b=E12");
    await benchReady(page);
    const details = page.locator("details.cp-nosum");
    await details.locator("summary").click();
    await expect(details).toHaveAttribute("open", "");
    await expect(details.getByText("Relação sobre músculos e UTI não demonstrada")).toBeVisible();
    await expect(details.getByText("Tratamentos ou contextos diferentes")).toBeVisible();
    await expect(details.getByText("Comparação apenas descritiva.")).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(wcag).analyze();
    expect(results.violations.map(v => ({ id: v.id, nodes: v.nodes.slice(0, 3).map(n => n.target) }))).toEqual([]);
  });

  test("card do explorador leva ao comparador com a referência em A", async ({ page }) => {
    await page.goto("/evidencias");
    const link = page.locator(".ev-grid .ev-spec__cmp").first();
    const href = await link.getAttribute("href");
    expect(href).toMatch(/^\/comparar\?a=[EPR]\d{2}$/);
    const id = href!.split("=")[1];
    await link.click();
    await expect(page).toHaveURL(new RegExp("/comparar\\?a=" + id + "$"));
    await expect(page.locator("#compare-left")).toHaveValue(id);
  });
});
