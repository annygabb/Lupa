import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Laboratório 2.0 — sensibilidade e exportação", () => {
  test("projecoes: sensibilidade varia uma premissa e mostra 2031/2036/2041", async ({ page }) => {
    await page.goto("/projecoes");
    const panel = page.getByRole("region", { name: "Análise de sensibilidade", exact: true });
    await panel.scrollIntoViewIfNeeded();
    await expect(panel.getByText("Varia uma premissa por vez; as demais ficam constantes.")).toBeVisible();
    await expect(panel.getByText(/não um efeito clínico/)).toBeVisible();
    await expect(panel.getByRole("table")).toHaveCount(0);

    const chip = panel.getByRole("group", { name: "Premissa para variar" }).getByRole("button", { name: "Continuidade anual", exact: true });
    await expect(async () => {
      if (await chip.getAttribute("aria-pressed") !== "true") await chip.click();
      await expect(chip).toHaveAttribute("aria-pressed", "true", { timeout: 1500 });
    }).toPass();
    const table = panel.getByRole("table");
    await expect(table).toBeVisible();
    for (const year of ["2031", "2036", "2041"])
      await expect(table.getByRole("columnheader", { name: year, exact: true })).toBeVisible();
    await expect(table.getByRole("rowheader", { name: /70% · atual/ })).toBeVisible();
    await expect(table.getByRole("row")).toHaveCount(6);

    await panel.getByLabel("Saída do modelo").selectOption("annualIllustrativeCostBRL");
    await expect(table.getByText("Custo não informado").first()).toBeVisible();
    await expect(table).not.toContainText("R$ 0");
    await expect(page.getByRole("region", { name: "Custo meramente hipotético em 2036" })).toContainText("Custo não informado");
  });

  test("projecoes: sensibilidade aberta continua sem violações axe", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/projecoes");
    const chip = page.getByRole("group", { name: "Premissa para variar" }).getByRole("button", { name: "Continuidade anual", exact: true });
    await expect(async () => {
      if (await chip.getAttribute("aria-pressed") !== "true") await chip.click();
      await expect(chip).toHaveAttribute("aria-pressed", "true", { timeout: 1500 });
    }).toPass();
    await page.getByLabel("Saída do modelo").selectOption("annualIllustrativeCostBRL");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    expect(results.violations.map(v => ({ id: v.id, nodes: v.nodes.slice(0, 3).map(n => n.target) }))).toEqual([]);
  });

  test("projecoes: exportação JSON tem modelVersion, kind e sensibilidade", async ({ page }) => {
    await page.goto("/projecoes");
    const chip = page.getByRole("group", { name: "Premissa para variar" }).getByRole("button", { name: "Início anual", exact: true });
    // Um toque antes da hidratação pode se perder: repete só enquanto o chip não estiver ativo.
    await expect(async () => {
      if (await chip.getAttribute("aria-pressed") !== "true") await chip.click();
      await expect(chip).toHaveAttribute("aria-pressed", "true", { timeout: 1500 });
    }).toPass();
    await expect(page.getByRole("region", { name: "Análise de sensibilidade", exact: true }).getByRole("table")).toBeVisible();
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Exportar JSON" }).click(),
    ]);
    expect(download.suggestedFilename()).toBe("lupa-cenario-2026-2041.json");
    await expect(page.getByText("Arquivo JSON preparado. Confira os downloads do navegador.", { exact: true })).toBeVisible();
    const data = JSON.parse(await readFile((await download.path())!, "utf8"));
    expect(data.modelVersion).toBe("lupa-flow-v2");
    expect(data.kind).toBe("hypothetical_illustration");
    expect(new Date(data.exportedAt).toISOString()).toBe(data.exportedAt);
    expect(data.assumptions.annualRetentionPct).toBe(70);
    expect(data.results.rows).toHaveLength(16);
    expect(data.methodologicalNotice).toMatch(/hipotética/);
    expect(data.sensitivity.field).toBe("annualStartPct");
    expect(data.results.horizons["2036"].annualIllustrativeCostBRL).toBeNull();

    const [csv] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Exportar CSV" }).click(),
    ]);
    expect(csv.suggestedFilename()).toBe("lupa-cenario-2026-2041.csv");
    const text = await readFile((await csv.path())!, "utf8");
    expect(text).toContain("# modelo=lupa-flow-v2");
    expect(text).toContain("# kind=hypothetical_illustration");
    expect(text).toContain("ANALISE DE SENSIBILIDADE");
  });

  test("projecoes: gráficos distinguem observado, hipotético e dados insuficientes", async ({ page }) => {
    await page.goto("/projecoes");
    const legend = page.getByRole("list", { name: "Legenda do gráfico" });
    await expect(legend).toContainText("Hipotético · calculado pelo modelo");
    await expect(legend).toContainText("Observado · nenhum dado observado neste gráfico");
    await expect(legend).toContainText("Dados insuficientes");
    const obs = page.locator(".px-obs .px-trace__legend");
    await expect(obs).toContainText("· observado");
    await expect(obs).toContainText("Dados insuficientes · lacuna: sem valor sustentado, não é zero");
    await page.getByRole("button", { name: "Estados Unidos", exact: true }).click();
    await expect(obs).toContainText("ligação ilustrativa, sem medições intermediárias");
  });

  test("metodologia: seção de bloqueios mostra todos os títulos e o exemplo E12", async ({ page }) => {
    await page.goto("/metodologia");
    const section = page.locator("#bloqueios");
    await expect(section.getByRole("heading", { level: 2 })).toHaveText(/Por que o LUPA\s+se recusa a projetar/);
    for (const title of ["Associação, não causa", "Ligação com UTI não demonstrada", "Sem aprovação para projeção", "OR sem risco basal", "Dados de entrada inválidos", "Fração impossível"])
      await expect(section.getByRole("heading", { name: title, exact: true })).toBeVisible();
    await expect(section.getByRole("listitem").filter({ hasText: "ICU_LINK_UNPROVEN" }).first()).toBeVisible();
    const example = section.getByRole("complementary", { name: "E12 tentando virar projeção de UTI" });
    await expect(example).toContainText("35 estudos · 9.366 participantes");
    await expect(example).toContainText("Exemplo");
    await expect(example).toContainText("ASSOCIATION_NOT_CAUSAL");
    await expect(example).toContainText("OR_WITHOUT_BASELINE_RISK");
    await expect(page.getByRole("heading", { name: "Previsão validada", exact: true })).toBeVisible();
    await expect(page.getByText(/O LUPA ainda não tem nenhuma previsão validada/)).toBeVisible();
  });
});
