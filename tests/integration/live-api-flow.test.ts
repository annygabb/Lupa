/**
 * Fluxo completo das rotas do LUPA Live sobre o motor local (NODE_ENV=test):
 * interface → rota → regra de negócio → armazenamento → resposta.
 * O caminho Supabase/Postgres é coberto por tests/integration/live-supabase-stack.test.ts.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { GET as snapshotGET } from "@/app/api/live/[code]/route";
import { POST as votePOST } from "@/app/api/live/[code]/vote/route";
import { POST as feedbackPOST } from "@/app/api/live/[code]/feedback/route";
import { GET as healthGET } from "@/app/api/live/health/route";
import { advanceLivePhase, resetLocalLiveStore, seedLocalDemoEvent } from "@/lib/live/db";

const CODE = "CAFE2026BEEF";
const ORIGIN = "https://lupaa.vercel.app";
const ctx = (code = CODE) => ({ params: Promise.resolve({ code }) });

function getSnapshot(cookie?: string, ip = "198.51.100.10", code = CODE) {
  return snapshotGET(new NextRequest(ORIGIN + "/api/live/" + code, {
    headers: { ...(cookie ? { cookie } : {}), "x-forwarded-for": ip },
  }), ctx(code));
}
function post(path: string, body: unknown, opts: { cookie?: string; origin?: string | null; ip?: string } = {}) {
  const headers: Record<string, string> = { "content-type": "application/json", "x-forwarded-for": opts.ip ?? "198.51.100.10" };
  if (opts.cookie) headers.cookie = opts.cookie;
  if (opts.origin !== null) headers.origin = opts.origin ?? ORIGIN;
  return new NextRequest(ORIGIN + path, { method: "POST", headers, body: JSON.stringify(body) });
}
async function participantCookie(ip?: string) {
  const res = await getSnapshot(undefined, ip);
  const setCookie = res.headers.get("set-cookie") ?? "";
  const match = /lupa_live_sid=([^;]+)/.exec(setCookie);
  return match ? "lupa_live_sid=" + match[1] : undefined;
}

describe("LUPA Live — fluxo de participante pela API", () => {
  beforeEach(() => {
    resetLocalLiveStore();
    seedLocalDemoEvent();
    delete process.env.LUPA_LIVE_MAX_VOTES_PER_CLIENT_MINUTE;
    delete process.env.LUPA_LIVE_MAX_SESSIONS_PER_CLIENT_MINUTE;
  });

  it("health informa modo de demonstração local (nunca 'ready' sem banco)", async () => {
    const res = await healthGET();
    expect(await res.json()).toMatchObject({ status: "local-demo", persistent: false });
  });

  it("GET emite cookie HttpOnly restrito ao evento e oculta contagens na fase pré", async () => {
    const res = await getSnapshot();
    expect(res.status).toBe(200);
    const cookie = res.headers.get("set-cookie") ?? "";
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/Path=\/api\/live\/CAFE2026BEEF/);
    const body = await res.json();
    expect(body.counts).toEqual([]);
    expect(body.correctIndex).toBeUndefined();
    expect(body.viewer).toEqual({ votedPre: false, votedPost: false, feedbackSent: false });
  });

  it("recusa voto sem sessão emitida (enchimento de urna por script) — antes 30/30 eram aceitos", async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 30; i++)
      statuses.push((await votePOST(post("/api/live/" + CODE + "/vote", { phase: "pre", optionIndex: 0 }), ctx())).status);
    expect(new Set(statuses)).toEqual(new Set([403]));
  });

  it("recusa voto sem Origin mesmo com cookie válido", async () => {
    const cookie = await participantCookie();
    const res = await votePOST(post("/api/live/" + CODE + "/vote", { phase: "pre", optionIndex: 1 }, { cookie, origin: null }), ctx());
    expect(res.status).toBe(403);
    expect((await res.json()).error).toBe("INVALID_ORIGIN");
  });

  it("aceita um voto por sessão e rodada, e o estado sobrevive a recarregar a página", async () => {
    const cookie = await participantCookie();
    const first = await votePOST(post("/api/live/" + CODE + "/vote", { phase: "pre", optionIndex: 1 }, { cookie }), ctx());
    expect(first.status).toBe(201);
    const again = await votePOST(post("/api/live/" + CODE + "/vote", { phase: "pre", optionIndex: 0 }, { cookie }), ctx());
    expect(again.status).toBe(409);
    expect((await again.json()).reason).toBe("ALREADY_VOTED");
    const reload = await getSnapshot(cookie);
    expect((await reload.json()).viewer).toMatchObject({ votedPre: true, votedPost: false });
    expect(reload.headers.get("set-cookie")).toBeNull(); // não troca a sessão existente
  });

  it("aceita o código em minúsculas na URL", async () => {
    const res = await getSnapshot(undefined, undefined, "cafe2026beef");
    expect(res.status).toBe(200);
    expect((await res.json()).code).toBe(CODE);
  });

  it("rejeita voto fora da rodada aberta e entradas inválidas", async () => {
    const cookie = await participantCookie();
    expect((await votePOST(post("/api/live/" + CODE + "/vote", { phase: "post", optionIndex: 1 }, { cookie }), ctx())).status).toBe(409);
    expect((await votePOST(post("/api/live/" + CODE + "/vote", { phase: "pre", optionIndex: 3 }, { cookie }), ctx())).status).toBe(400);
    expect((await votePOST(post("/api/live/ABCDEF123456/vote", { phase: "pre", optionIndex: 1 }, { cookie }), ctx("ABCDEF123456"))).status).toBe(403);
  });

  it("limita votos por rede (IP pseudonimizado) por minuto", async () => {
    process.env.LUPA_LIVE_MAX_VOTES_PER_CLIENT_MINUTE = "3";
    const results: number[] = [];
    for (let i = 0; i < 5; i++) {
      const cookie = await participantCookie("203.0.113.50");
      results.push((await votePOST(post("/api/live/" + CODE + "/vote", { phase: "pre", optionIndex: 2 }, { cookie, ip: "203.0.113.50" }), ctx())).status);
    }
    expect(results).toEqual([201, 201, 201, 429, 429]);
    // Outra rede não é afetada.
    const other = await participantCookie("203.0.113.99");
    expect((await votePOST(post("/api/live/" + CODE + "/vote", { phase: "pre", optionIndex: 2 }, { cookie: other, ip: "203.0.113.99" }), ctx())).status).toBe(201);
  });

  it("limita emissão de novas sessões por rede", async () => {
    process.env.LUPA_LIVE_MAX_SESSIONS_PER_CLIENT_MINUTE = "2";
    const cookies = [];
    for (let i = 0; i < 4; i++) cookies.push(await participantCookie("192.0.2.77"));
    expect(cookies.filter(Boolean)).toHaveLength(2);
  });

  it("feedback só após o encerramento, uma vez por sessão", async () => {
    const cookie = await participantCookie();
    const body = { clarity: 4, usefulness: 5, purposeAccepted: true };
    expect((await feedbackPOST(post("/api/live/" + CODE + "/feedback", body, { cookie }), ctx())).status).toBe(409);
    expect(await advanceLivePhase(CODE, "reveal")).toBe(true);
    expect(await advanceLivePhase(CODE, "reveal")).toBe(false); // transição repetida é recusada
    expect(await advanceLivePhase(CODE, "post")).toBe(true);
    expect(await advanceLivePhase(CODE, "closed")).toBe(true);
    expect((await feedbackPOST(post("/api/live/" + CODE + "/feedback", { ...body, purposeAccepted: false }, { cookie }), ctx())).status).toBe(400);
    expect((await feedbackPOST(post("/api/live/" + CODE + "/feedback", body, { cookie }), ctx())).status).toBe(201);
    expect((await feedbackPOST(post("/api/live/" + CODE + "/feedback", body, { cookie }), ctx())).status).toBe(409);
    expect((await feedbackPOST(post("/api/live/" + CODE + "/feedback", body), ctx())).status).toBe(403);
    const closed = await (await getSnapshot(cookie)).json();
    expect(closed.viewer.feedbackSent).toBe(true);
    expect(closed.postQuestion.correctIndex).toBeTypeOf("number"); // gabarito do pós só no encerramento
  });

  it("fase de revelação mostra só a distribuição do pré-teste", async () => {
    const cookie = await participantCookie();
    await votePOST(post("/api/live/" + CODE + "/vote", { phase: "pre", optionIndex: 1 }, { cookie }), ctx());
    await advanceLivePhase(CODE, "reveal");
    await advanceLivePhase(CODE, "post");
    const snap = await (await getSnapshot(cookie)).json();
    expect(snap.counts.every((c: { phase: string }) => c.phase === "pre")).toBe(true);
    expect(snap.postQuestion.correctIndex).toBeUndefined();
    expect(snap.postQuestion.explanation).toBeUndefined();
  });

  it("evento inexistente devolve 404, não 'votação aberta'", async () => {
    expect((await getSnapshot(undefined, undefined, "ABCDEF123456")).status).toBe(404);
  });
});
