import { test, expect } from "@playwright/test";

test("explicações entram e saem com a rolagem sem ocultar a navegação", async ({ page }) => {
  await page.goto("/");
  const section = page.locator(".editorial-purpose");
  await section.scrollIntoViewIfNeeded();
  await expect(section).toHaveAttribute("data-reveal-state", "in");
  await expect(section).toHaveCSS("opacity", "1");
  await page.locator(".lupa-footer").scrollIntoViewIfNeeded();
  await expect(section).toHaveAttribute("data-reveal-state", "out");
  await section.scrollIntoViewIfNeeded();
  await expect(section).toHaveAttribute("data-reveal-state", "in");
  await expect(section).toHaveCSS("opacity", "1");
  await expect(page.locator(".lupa-navigation")).toBeVisible();
});

test("contagem preserva o valor científico acessível e termina corretamente", async ({ page }) => {
  await page.goto("/");
  const composition = page.locator(".composition");
  await composition.scrollIntoViewIfNeeded();
  const number = composition.locator('[data-final-value="75"]');
  await expect(number.locator(".sr-only")).toHaveText("75");
  await expect(number.locator('[aria-hidden="true"]')).toHaveText("75");
  await expect(number.locator('[aria-hidden="true"]')).toHaveAttribute("data-counting", "false");
  await expect(composition.getByText(/não 25% dos músculos/)).toBeVisible();
});

test.describe("Preferência de movimento reduzido", () => {
  test.use({ reducedMotion: "reduce" });
  test("mostra valores finais e explicações sem transições", async ({ page }) => {
    await page.goto("/");
    const section = page.locator(".editorial-purpose");
    await expect(section).toHaveAttribute("data-reveal-state", "in");
    await expect(section).toHaveCSS("opacity", "1");
    await expect(section).toHaveCSS("transform", "none");
    await page.locator(".composition").scrollIntoViewIfNeeded();
    await expect(page.locator('.composition [data-final-value="75"] [aria-hidden=true]')).toHaveText("75");
  });
});
