import { expect, test, request as playwrightRequest, type APIRequestContext, type Browser, type Page } from "@playwright/test";

/**
 * Fluxo real do LUPA Live, ponta a ponta:
 * navegador → Next.js (build de produção) → Supabase SIMULADO (PostgREST/GoTrue) → Postgres com as migrações.
 * Contas e organizações são FICTÍCIAS, criadas no banco descartável de teste.
 */
const FAKE = "https://127.0.0.1:54443";
const ADMIN = { "x-test-admin": "sb_secret_fake_for_tests_only" };
const PASSWORD = "senha-de-teste-123";
const accounts = {
  orgA: { email: "organizadora.a@teste.invalid" },
  orgB: { email: "organizador.b@teste.invalid" },
  viewerA: { email: "observador.a@teste.invalid" },
};
let fake: APIRequestContext;
let eventCode = "";

async function login(page: Page, email: string, password = PASSWORD) {
  await page.goto("/login");
  await page.getByLabel("E-mail institucional").fill(email);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: "Entrar no painel" }).click();
}

async function newParticipant(browser: Browser) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  return ctx.newPage();
}

async function vote(page: Page, option: number) {
  await page.locator('[aria-label="Alternativas da questão"] button').nth(option).click();
  await page.getByRole("button", { name: /Confirmar e Enviar Resposta/ }).click();
  await expect(page.getByText("Resposta confirmada pelo servidor")).toBeVisible();
}

/** Capturas opcionais para revisão visual: LIVE_E2E_SHOTS=<pasta>. */
async function shot(page: Page, name: string) {
  if (process.env.LIVE_E2E_SHOTS) await page.screenshot({ path: process.env.LIVE_E2E_SHOTS + "/" + name + ".png" });
}

async function count(table: string) {
  const res = await fake.post(FAKE + "/__test/sql-count", { headers: ADMIN, data: { table } });
  return (await res.json()).count as number;
}

test.beforeAll(async () => {
  fake = await playwrightRequest.newContext({ ignoreHTTPSErrors: true });
  const ids: Record<string, string> = {};
  for (const [name, account] of Object.entries(accounts)) {
    const res = await fake.post(FAKE + "/__test/user", { headers: ADMIN, data: { email: account.email, password: PASSWORD } });
    ids[name] = (await res.json()).id;
  }
  await fake.post(FAKE + "/__test/organization", { headers: ADMIN, data: {
    name: "Instituição A (teste)", slug: "instituicao-a-teste",
    members: [{ userId: ids.orgA, role: "owner" }, { userId: ids.viewerA, role: "viewer" }],
  } });
  await fake.post(FAKE + "/__test/organization", { headers: ADMIN, data: {
    name: "Instituição B (teste)", slug: "instituicao-b-teste", members: [{ userId: ids.orgB, role: "organizer" }],
  } });
});

test.afterAll(async () => { await fake?.dispose(); });

test.describe.serial("LUPA Live com banco", () => {
  test("health informa prontidão real do banco", async ({ request }) => {
    const res = await request.get("/api/live/health");
    expect(res.status()).toBe(200);
    expect(await res.json()).toMatchObject({ status: "ready", database: "connected" });
  });

  test("senha errada mostra erro e não abre sessão", async ({ page }) => {
    await login(page, accounts.orgA.email, "senha-incorreta-999");
    await expect(page.locator("p.lx-warning[role=alert]")).toContainText("Credenciais inválidas");
    expect((await page.request.get("/api/me")).status()).toBe(401);
  });

  test("fluxo completo: login → criar → telão/QR → votos → fases → feedback → exportar → excluir", async ({ page, browser }) => {
    await login(page, accounts.orgA.email);
    await expect(page).toHaveURL(/\/live\/organizador$/);
    await expect(page.getByText("Conectado ao painel autorizado.")).toBeVisible();
    await page.getByLabel("Organização autorizada").selectOption({ label: "Instituição A (teste) (owner)" });
    await page.getByRole("button", { name: "Criar Nova Sessão Live" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Sessão criada com sucesso" })).toBeVisible();
    eventCode = (await page.locator("span.font-mono.font-bold.text-lg").first().innerText()).trim();
    expect(eventCode).toMatch(/^[A-F0-9]{12}$/);
    expect(await count("events")).toBe(1);
    expect(await count("audit")).toBeGreaterThanOrEqual(1);

    // Telão: selo coerente com a fase e QR gerado pela API (evento existe e está ativo).
    const screen = await page.context().newPage();
    await screen.goto("/live/apresentacao/" + eventCode);
    await expect(screen.getByTestId("live-badge")).toHaveText(/Votação Aberta/);
    await expect(screen.locator("svg").filter({ has: screen.locator("path") }).first()).toBeVisible();
    await expect(screen.getByText("Ocultas durante a votação")).toBeVisible();
    await shot(screen, "01-telao-votacao-aberta");

    // Dois participantes no celular.
    const p1 = await newParticipant(browser);
    const p2 = await newParticipant(browser);
    await p1.goto("/live/" + eventCode.toLowerCase()); // código digitado em minúsculas
    await vote(p1, 0);
    await p2.goto("/live/" + eventCode);
    await vote(p2, 1);
    await p1.reload();
    await expect(p1.getByRole("button", { name: /Resposta Registrada nesta Rodada/ })).toBeDisabled();
    await shot(p1, "02-celular-voto-restaurado-apos-recarregar");
    expect(await count("votes")).toBe(2);

    // Organizador vê os votos (painel autorizado) e avança: revelação.
    await page.reload();
    await expect(page.getByText("1ª Rodada: 2")).toBeVisible();
    await page.getByRole("button", { name: /Avançar: Revelar Evidência/ }).click();
    await expect(page.getByText(/Fase Atual: Revelação Científica/)).toBeVisible();
    await screen.reload();
    await expect(screen.getByTestId("live-badge")).toHaveText(/Discussão Científica/);
    await expect(screen.getByText("Interpretação correta:")).toBeVisible();
    await expect(screen.getByText("50%").first()).toBeVisible();
    await shot(screen, "03-telao-revelacao");

    // Pós-teste.
    await page.getByRole("button", { name: /Avançar: Abrir 2ª Rodada/ }).click();
    await expect(page.getByText(/Fase Atual: 2ª Rodada/)).toBeVisible();
    await p1.reload();
    await vote(p1, 2);
    expect(await count("votes")).toBe(3);

    // Encerramento + feedback.
    await page.getByRole("button", { name: /Avançar: Encerrar Sessão/ }).click();
    await expect(page.getByText(/Fase Atual: Sessão Encerrada/)).toBeVisible();
    await p1.reload();
    await p1.getByLabel(/Concordo em enviar notas/).check();
    await p1.getByRole("radiogroup", { name: "Clareza da explicação" }).getByRole("radio", { name: "4 de 5" }).click();
    await p1.getByRole("radiogroup", { name: "Utilidade do aprendizado" }).getByRole("radio", { name: "3 de 5" }).click();
    await p1.getByRole("button", { name: "Enviar avaliação" }).click();
    await expect(p1.getByText(/Avaliação registrada/)).toBeVisible();
    expect(await count("feedback")).toBe(1);
    await p1.reload();
    await expect(p1.getByText(/Avaliação registrada/)).toBeVisible(); // estado restaurado pelo servidor
    await page.reload();
    await expect(page.getByText(/1 avaliação\(ões\)\. Médias ocultadas/)).toBeVisible();
    await shot(page, "04-organizador-encerrado");

    // Exportação CSV com os números reais.
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Baixar CSV (.csv)" }).click(),
    ]);
    const csv = await (await download.createReadStream()).toArray().then(chunks => Buffer.concat(chunks).toString("utf8"));
    expect(csv).toContain('"pre"');
    expect(csv).toMatch(/"pre";[^\n]*;"0";[^\n]*;"1";"50\.0%"/);

    // Exclusão com confirmação; participante deixa de ver a sessão.
    page.once("dialog", dialog => dialog.accept());
    await page.getByRole("button", { name: "Excluir Sessão & Votos" }).click();
    await expect(page.getByText("Sessão e votos excluídos com sucesso.")).toBeVisible();
    expect(await count("votes")).toBe(0);
    expect(await count("feedback")).toBe(0);
    await p2.reload();
    await expect(p2.getByText("Não encontramos uma sessão com este código.").first()).toBeVisible();
    await screen.reload();
    await expect(screen.getByTestId("live-badge")).toHaveText(/Sem sessão ativa/);
  });

  test("isolamento: outra organização e papel 'viewer' não administram o evento", async ({ page, browser }) => {
    // Organizadora A cria um evento novo.
    await login(page, accounts.orgA.email);
    await page.getByRole("button", { name: "Criar Nova Sessão Live" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Sessão criada com sucesso" })).toBeVisible();
    const codeA = (await page.locator("span.font-mono.font-bold.text-lg").first().innerText()).trim();

    // Organizador B, autenticado, tenta ler/alterar/excluir o evento de A pela API.
    const bCtx = await browser.newContext();
    const b = await bCtx.newPage();
    await login(b, accounts.orgB.email);
    await expect(b).toHaveURL(/\/live\/organizador$/);
    const origin = { origin: "http://localhost:3103" };
    expect((await b.request.get("/api/live/" + codeA + "/admin")).status()).toBe(403);
    expect((await b.request.get("/api/live/" + codeA + "/feedback-summary")).status()).toBe(403);
    expect((await b.request.patch("/api/live/" + codeA, { headers: origin, data: { phase: "reveal" } })).status()).toBe(403);
    expect((await b.request.delete("/api/live/" + codeA, { headers: origin })).status()).toBe(403);
    const list = await (await b.request.get("/api/live")).json();
    expect(list.events.map((e: { code: string }) => e.code)).not.toContain(codeA);
    const me = await (await b.request.get("/api/me")).json();
    expect(me.organizations.map((o: { name: string }) => o.name)).toEqual(["Instituição B (teste)"]);

    // Papel viewer da organização A: entra, mas não cria nem administra.
    const vCtx = await browser.newContext();
    const v = await vCtx.newPage();
    await login(v, accounts.viewerA.email);
    await expect(v.getByText("Conta sem função de organizador")).toBeVisible();
    expect((await v.request.get("/api/live/" + codeA + "/admin")).status()).toBe(403);

    // Sem login, nada administrativo responde.
    const anon = await browser.newContext();
    const a = await anon.newPage();
    expect((await a.request.get("/api/live/" + codeA + "/admin")).status()).toBe(401);
    expect((await a.request.post("/api/live", { headers: origin, data: { claimId: "massa-magra-nao-equivale-a-musculos", organizationId: "00000000-0000-4000-8000-000000000000" } })).status()).toBe(401);

    // Script sem sessão de participante não vota; com sessão, vota uma vez.
    expect((await a.request.post("/api/live/" + codeA + "/vote", { headers: origin, data: { phase: "pre", optionIndex: 0 } })).status()).toBe(403);
    expect((await a.request.get("/api/live/" + codeA)).status()).toBe(200);
    expect((await a.request.post("/api/live/" + codeA + "/vote", { headers: origin, data: { phase: "pre", optionIndex: 0 } })).status()).toBe(201);
    expect((await a.request.post("/api/live/" + codeA + "/vote", { headers: origin, data: { phase: "pre", optionIndex: 0 } })).status()).toBe(409);

    // Logout encerra o acesso.
    await page.getByRole("button", { name: "Sair" }).click();
    await expect(page).toHaveURL(/\/login$/);
    expect((await page.request.get("/api/me")).status()).toBe(401);
    for (const ctx of [bCtx, vCtx, anon]) await ctx.close();
  });
});
