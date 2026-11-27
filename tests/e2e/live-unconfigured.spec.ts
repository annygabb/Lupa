import { expect, test } from "@playwright/test";

/**
 * Cenário do site publicado hoje: build de produção SEM banco do Live.
 * Antes da correção, o telão exibia "Votação Aberta" e "Gerando QR Code..." para sempre,
 * e o celular exibia "Ao Vivo" com "Sessão não encontrada".
 */
const CODE = "CAFE2026BEEF";

test("telão sem banco não finge votação aberta nem QR em geração", async ({ page }) => {
  await page.goto("/live/apresentacao/" + CODE);
  await expect(page.getByTestId("live-badge")).toHaveText(/Live não configurado/);
  await expect(page.getByText("Votação Aberta")).toHaveCount(0);
  await expect(page.getByText(/Gerando QR Code/)).toHaveCount(0);
  await expect(page.getByText(/QR indisponível/)).toBeVisible();
  await expect(page.getByRole("alert").filter({ hasText: "não está configurado" })).toBeVisible();
  await expect(page.getByRole("link", { name: /demonstração simulada/ })).toBeVisible();
});

test("participante sem banco vê o motivo real e o caminho para a demonstração", async ({ page }) => {
  await page.goto("/live/" + CODE);
  await expect(page.getByText("Sem sessão ativa")).toBeVisible();
  await expect(page.getByText("Ao Vivo", { exact: true })).toHaveCount(0);
  await expect(page.locator(".lx-warning[role=alert]")).toContainText("não está configurado");
  await expect(page.getByRole("link", { name: "Ver demonstração simulada" })).toBeVisible();
});

test("organizador, login e entrada por código informam a indisponibilidade", async ({ page }) => {
  await page.goto("/live/organizador");
  await expect(page.getByTestId("live-service-notice")).toContainText("LUPA Live indisponível neste ambiente");
  await expect(page.getByRole("button", { name: "Criar Nova Sessão Live" })).toBeDisabled();
  await page.goto("/login");
  await expect(page.getByTestId("live-service-notice")).toBeVisible();
  await expect(page.getByRole("button", { name: "Entrar no painel" })).toBeDisabled();
  await page.goto("/live");
  await expect(page.getByTestId("live-service-notice")).toBeVisible();
});

test("API do Live sem banco responde 503 explícito, sem simular persistência", async ({ request }) => {
  expect((await request.get("/api/live/health")).status()).toBe(503);
  const res = await request.get("/api/live/" + CODE);
  expect(res.status()).toBe(503);
  expect(await res.json()).toEqual({ error: "LIVE_UNCONFIGURED" });
});

test("sandbox deixa explícito que os votos são fictícios e não fabrica ganho de aprendizagem", async ({ page }) => {
  await page.goto("/live/demo");
  await expect(page.getByTestId("sandbox-disclaimer")).toContainText("dados fictícios");
  await expect(page.getByText(/Delta de Aprendizado/i)).toHaveCount(0);
  // Sem cliques, não há votos: nada de resultado pré-fabricado.
  await page.getByRole("button", { name: /Encerrar Pré e Revelar/ }).click();
  await page.getByRole("button", { name: /Abrir 2ª Rodada/ }).click();
  await page.getByRole("button", { name: /Encerrar simulação/ }).click();
  await expect(page.getByTestId("sandbox-result-disclaimer")).toContainText("(0 no pré, 0 no pós)");
});
