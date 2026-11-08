import { test, expect } from "@playwright/test";

test("barra de capítulos acompanha a leitura e o movimento pode ser desligado", async ({ page }) => {
  await page.goto("/");
  const narrow = (page.viewportSize()?.width ?? 1280) <= 640;
  let toggle;
  if (narrow) {
    // No celular a barra sai do caminho; o controle de movimento fica no menu Índice.
    await expect(page.getByRole("region", { name: "Progresso da leitura" })).toBeHidden();
    await page.getByRole("button", { name: "Índice" }).click();
    toggle = page.getByRole("dialog", { name: "Índice de pranchas" }).getByRole("button", { name: /Movimento/ });
  } else {
    const bar = page.getByRole("region", { name: "Progresso da leitura" });
    await expect(bar).toBeVisible();
    await expect(bar).toContainText("Canetas para emagrecer");
    await page.locator(".at-chain").scrollIntoViewIfNeeded();
    await expect(bar).toContainText("Onde a conclusão para");
    toggle = bar.getByRole("button", { name: /Movimento/ });
  }
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
  await expect(page.locator(".at-header")).toBeVisible();
});

test("composição corporal preserva o dado acessível e a leitura correta", async ({ page }) => {
  await page.goto("/");
  const scrolly = page.locator(".at-scrolly");
  await scrolly.scrollIntoViewIfNeeded();
  const waffle = scrolly.getByRole("img", { name: /cerca de 75 representam gordura e 25 massa magra/ });
  await expect(waffle).toBeVisible();
  await expect(waffle.locator(".at-waffle__cell")).toHaveCount(100);
  await expect(waffle.locator(".at-waffle__cell.is-lean")).toHaveCount(25);
  const step = scrolly.getByText(/não 25% dos músculos/);
  await step.scrollIntoViewIfNeeded();
  await expect(step).toBeVisible();
  await expect(scrolly).toHaveAttribute("data-step", /[123]/);
  await expect(scrolly.getByRole("link", { name: /ficha E04/ })).toHaveAttribute("href", "/evidencias/E04");
});

test("a lupa abre a leitura completa do estudo", async ({ page }) => {
  await page.goto("/");
  const section = page.locator("#lupa");
  await section.scrollIntoViewIfNeeded();
  await section.getByRole("button", { name: /Perder massa magra com o medicamento piora a UTI/ }).click();
  await expect(section.locator(".at-lens-stage__q")).toContainText("Perder massa magra");
  const open = section.getByRole("button", { name: "Abrir a leitura do estudo" });
  await open.click();
  await expect(section.getByRole("button", { name: "Voltar à manchete" })).toHaveAttribute("aria-pressed", "true");
  await expect(section.getByRole("region", { name: "O que o estudo permite dizer" })).toContainText("ainda não foi demonstrada");
});

test.describe("Preferência de movimento reduzido", () => {
  test.use({ reducedMotion: "reduce" });
  test("mostra o conteúdo final, sem rolagem suave nem faixa animada", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Canetas para emagrecer");
    await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
    await expect(page.locator(".at-marquee__track")).toHaveCSS("animation-name", "none");
    const tag = page.locator(".at-tag").first();
    await expect(tag).toHaveCSS("opacity", "1");
    await page.locator(".at-scrolly").scrollIntoViewIfNeeded();
    await expect(page.getByRole("img", { name: /75 representam gordura/ })).toBeVisible();
  });
});
