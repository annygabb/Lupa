import { test, expect } from "@playwright/test";

test.describe("Evidence Lens — da manchete à evidência", () => {
  test("link compartilhável abre a afirmação, mostra limites e leva ao passaporte e ao comparador", async ({ page }) => {
    await page.goto("/?afirmacao=uti-mortalidade-nao-e-efeito-do-medicamento#lupa");
    const section = page.locator("#lupa");
    await section.scrollIntoViewIfNeeded();
    await expect(section.locator(".at-lens-stage__q")).toContainText("massa muscular na UTI");
    await expect(section.getByRole("button", { name: /Estudos de massa muscular na UTI/ })).toHaveAttribute("aria-pressed", "true");
    await section.getByRole("button", { name: "Abrir a leitura do estudo" }).click();
    const region = section.getByRole("region", { name: "O que o estudo permite dizer" });
    await expect(region).toContainText("Estudos não comparáveis para essa conclusão");
    await expect(region).toContainText("revisão clínica independente pendente");
    await expect(region).toContainText("O que não dá para concluir");
    await expect(region).toContainText("233%");
    await expect(region.getByRole("link", { name: "Passaporte E04 →" })).toHaveAttribute("href", "/evidencias/E04");
    await expect(region.getByRole("link", { name: "Ver no comparador →" })).toHaveAttribute("href", "/comparar?a=E04&b=E12");
  });

  test("escolher outra afirmação atualiza a URL e mostra os bloqueios de projeção", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#lupa");
    await section.scrollIntoViewIfNeeded();
    const choice = section.getByRole("button", { name: /cenário de 2036/ });
    // Repete o clique se a página ainda estiver hidratando.
    await expect(async () => {
      await choice.click();
      await expect(choice).toHaveAttribute("aria-pressed", "true", { timeout: 1000 });
    }).toPass();
    await expect(page).toHaveURL(/afirmacao=cenario-2036-nao-e-previsao-sus/);
    await section.getByRole("button", { name: "Abrir a leitura do estudo" }).click();
    const region = section.getByRole("region", { name: "O que o estudo permite dizer" });
    await expect(region).toContainText("Por que o LUPA não projeta isso");
    await expect(region).toContainText("Sem aprovação para projeção");
  });

  test("API determinística responde com fontes e recusa ids desconhecidos", async ({ request }) => {
    const ok = await request.post("/api/interpretar", { data: { claimId: "massa-magra-nao-equivale-a-musculos" } });
    expect(ok.status()).toBe(200);
    const body = await ok.json();
    expect(body.classification).toBe("partially_supported");
    expect(body.clinicalReviewPending).toBe(true);
    const bad = await request.post("/api/interpretar", { data: { claimId: "nao-existe" } });
    expect(bad.status()).toBe(404);
    const list = await request.get("/api/interpretar");
    expect((await list.json()).claims.length).toBeGreaterThanOrEqual(3);
  });
});
