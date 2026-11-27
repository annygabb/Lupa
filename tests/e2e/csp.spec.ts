import { expect, test } from "@playwright/test";

/**
 * A CSP aplicada não pode quebrar nenhuma página nem gerar violações.
 * Escuta o evento `securitypolicyviolation` do próprio navegador (mais confiável que o console).
 */
const routes = ["/", "/evidencias", "/evidencias/E04", "/comparar", "/musculos-uti", "/projecoes", "/saude-mental",
  "/metodologia", "/experiencias", "/corpo-evidencia", "/relatos", "/desafio", "/impacto", "/dossie",
  "/live", "/live/demo", "/live/organizador", "/live/CAFE2026BEEF", "/live/apresentacao/CAFE2026BEEF",
  "/login", "/recuperar-acesso"];

test("CSP aplicada e sem violações nas rotas públicas", async ({ page }) => {
  await page.addInitScript(() => {
    const store: string[] = [];
    (window as unknown as { __cspViolations: string[] }).__cspViolations = store;
    document.addEventListener("securitypolicyviolation", e => store.push(e.effectiveDirective + " " + e.blockedURI));
  });
  const violations: string[] = [];
  for (const route of routes) {
    const response = await page.goto(route, { waitUntil: "load" });
    expect(response?.status(), route).toBe(200);
    expect(response?.headers()["content-security-policy"], route).toContain("object-src 'none'");
    await expect(page.locator("h1").first()).toBeVisible();
    await page.waitForTimeout(300);
    const found = await page.evaluate(() => (window as unknown as { __cspViolations: string[] }).__cspViolations);
    violations.push(...found.map(v => route + ": " + v));
  }
  expect(violations).toEqual([]);
});
