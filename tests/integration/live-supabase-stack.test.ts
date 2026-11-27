/**
 * Integração Live com Postgres REAL + migrações do repositório + simulador de PostgREST.
 * Executa somente quando LUPA_PG_TEST_URL aponta para um banco descartável cujo nome contém
 * "test" ou "e2e" (prepare com `node tests/support/prepare-db.mjs`). Sem a variável, é pulado.
 *
 * Caminho exercitado: rota Next.js → lib/live/db.ts → HTTP (PostgREST simulado) →
 * service_role → RPC/tabelas/constraints/triggers do Postgres → resposta da rota.
 */
import { spawn, type ChildProcess } from "node:child_process";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import pg from "pg";

const PG_URL = process.env.LUPA_PG_TEST_URL;
const PORT = 54444;
const BASE = "http://127.0.0.1:" + PORT;
const SERVICE = "sb_secret_fake_for_tests_only";
const ORIGIN = "https://lupaa.vercel.app";

describe.skipIf(!PG_URL)("LUPA Live sobre Postgres real (stack simulado do Supabase)", () => {
  let server: ChildProcess;
  let db: pg.Client;
  let routes: {
    snapshot: typeof import("@/app/api/live/[code]/route");
    vote: typeof import("@/app/api/live/[code]/vote/route");
    feedback: typeof import("@/app/api/live/[code]/feedback/route");
    health: typeof import("@/app/api/live/health/route");
  };
  let live: typeof import("@/lib/live/db");
  const CODE = "AB12CD34EF56";
  const ctx = { params: Promise.resolve({ code: CODE }) };

  const get = (cookie?: string, ip = "198.51.100.1") => routes.snapshot.GET(new NextRequest(ORIGIN + "/api/live/" + CODE, {
    headers: { ...(cookie ? { cookie } : {}), "x-forwarded-for": ip },
  }), ctx);
  const post = (kind: "vote" | "feedback", body: unknown, cookie?: string, ip = "198.51.100.1") =>
    routes[kind].POST(new NextRequest(ORIGIN + "/api/live/" + CODE + "/" + kind, {
      method: "POST",
      headers: { "content-type": "application/json", origin: ORIGIN, "x-forwarded-for": ip, ...(cookie ? { cookie } : {}) },
      body: JSON.stringify(body),
    }), ctx);
  const cookieOf = async (ip?: string) => {
    const res = await get(undefined, ip);
    const m = /lupa_live_sid=([^;]+)/.exec(res.headers.get("set-cookie") ?? "");
    return m ? "lupa_live_sid=" + m[1] : undefined;
  };

  beforeAll(async () => {
    server = spawn(process.execPath, ["tests/support/fake-supabase.mjs"], {
      env: { ...process.env, FAKE_SUPABASE_PORT: String(PORT), LUPA_PG_TEST_URL: PG_URL },
      stdio: ["ignore", "pipe", "inherit"],
    });
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("simulador não iniciou")), 10_000);
      server.stdout!.on("data", chunk => { if (String(chunk).includes("ouvindo")) { clearTimeout(timer); resolve(); } });
    });
    process.env.NEXT_PUBLIC_SUPABASE_URL = BASE;
    process.env.SUPABASE_SECRET_KEY = SERVICE;
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_fake_for_tests_only";
    db = new pg.Client({ connectionString: PG_URL });
    await db.connect();
    await db.query("delete from public.lupa_live_events where code = $1", [CODE]);
    await db.query("delete from public.lupa_rate_limits");
    routes = {
      snapshot: await import("@/app/api/live/[code]/route"),
      vote: await import("@/app/api/live/[code]/vote/route"),
      feedback: await import("@/app/api/live/[code]/feedback/route"),
      health: await import("@/app/api/live/health/route"),
    };
    live = await import("@/lib/live/db");
    const content = await import("@/lib/live/content");
    const q = content.liveQuestion("massa-magra-nao-equivale-a-musculos")!;
    await live.createLiveEvent({
      code: CODE, claimId: q.claimId, title: q.title, question: q.question,
      choices: q.choices, correctIndex: q.correctIndex, postQuestion: q.postQuestion,
    });
  }, 30_000);

  afterAll(async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SECRET_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    await db?.query("delete from public.lupa_live_events where code = $1", [CODE]).catch(() => {});
    await db?.end();
    server?.kill("SIGTERM");
  });

  it("health encontra todas as tabelas (inclusive a da nova migração)", async () => {
    // Auth com URL http (simulador) não é aceita: o health deve dizer "unconfigured", nunca "ready" falso.
    const res = await routes.health.GET();
    expect([200, 503]).toContain(res.status);
    const tables = await db.query(`select to_regclass('public.lupa_rate_limits') is not null as ok`);
    expect(tables.rows[0].ok).toBe(true);
  });

  it("gabarito oculto no banco na fase pré; voto persiste e não duplica", async () => {
    const first = await get();
    const body = await first.json();
    expect(body.correctIndex).toBeUndefined();
    expect(body.counts).toEqual([]);
    const cookie = /lupa_live_sid=([^;]+)/.exec(first.headers.get("set-cookie") ?? "")![0];
    expect((await post("vote", { phase: "pre", optionIndex: 0 }, cookie)).status).toBe(201);
    expect((await post("vote", { phase: "pre", optionIndex: 1 }, cookie)).status).toBe(409);
    const count = await db.query("select count(*)::int as n from public.lupa_live_votes v join public.lupa_live_events e on e.id = v.event_id where e.code = $1", [CODE]);
    expect(count.rows[0].n).toBe(1);
    expect((await (await get(cookie)).json()).viewer).toMatchObject({ votedPre: true, votedPost: false, feedbackSent: false });
  });

  it("script sem sessão é recusado; limite por rede vem do banco (lupa_consume_limit)", async () => {
    expect((await post("vote", { phase: "pre", optionIndex: 2 })).status).toBe(403);
    process.env.LUPA_LIVE_MAX_VOTES_PER_CLIENT_MINUTE = "2";
    try {
      const statuses = [];
      for (let i = 0; i < 4; i++) statuses.push((await post("vote", { phase: "pre", optionIndex: 2 }, await cookieOf("203.0.113.9"), "203.0.113.9")).status);
      expect(statuses).toEqual([201, 201, 429, 429]);
      const stored = await db.query("select key_hash from public.lupa_rate_limits where scope = $1", ["live-vote:" + CODE]);
      expect(stored.rows.length).toBeGreaterThan(0);
      // Só HMAC é armazenado, nunca o IP.
      expect(stored.rows.every((r: { key_hash: string }) => /^[a-f0-9]{64}$/.test(r.key_hash) && !r.key_hash.includes("203"))).toBe(true);
    } finally { delete process.env.LUPA_LIVE_MAX_VOTES_PER_CLIENT_MINUTE; }
  });

  it("transição de fase é atômica (compare-and-set) e gabarito aparece só na revelação", async () => {
    const results = await Promise.all([live.advanceLivePhase(CODE, "reveal"), live.advanceLivePhase(CODE, "reveal")]);
    expect(results.filter(Boolean)).toHaveLength(1);
    const snap = await (await get()).json();
    expect(snap.phase).toBe("reveal");
    expect(snap.correctIndex).toBeTypeOf("number");
    expect(await live.advanceLivePhase(CODE, "closed")).toBe(false); // pular fase é recusado
  });

  it("feedback: só após encerrar, um por sessão, média suprimida abaixo de 5", async () => {
    const cookies = [];
    for (let i = 0; i < 5; i++) cookies.push(await cookieOf("192.0.2." + (10 + i)));
    expect((await post("feedback", { clarity: 5, usefulness: 4, purposeAccepted: true }, cookies[0])).status).toBe(409);
    expect(await live.advanceLivePhase(CODE, "post")).toBe(true);
    expect(await live.advanceLivePhase(CODE, "closed")).toBe(true);
    for (let i = 0; i < 4; i++)
      expect((await post("feedback", { clarity: 5, usefulness: 4, purposeAccepted: true }, cookies[i])).status).toBe(201);
    expect((await post("feedback", { clarity: 1, usefulness: 1, purposeAccepted: true }, cookies[0])).status).toBe(409);
    expect(await live.feedbackSummary(CODE)).toMatchObject({ total: 4, suppressed: true, averageClarity: null });
    expect((await post("feedback", { clarity: 3, usefulness: 4, purposeAccepted: true }, cookies[4])).status).toBe(201);
    expect(await live.feedbackSummary(CODE)).toMatchObject({ total: 5, suppressed: false, averageClarity: 4.6, averageUsefulness: 4 });
  });

  it("anon e authenticated não acessam tabelas nem as funções novas", async () => {
    for (const role of ["anon", "authenticated"]) {
      for (const sql of [
        "select count(*) from public.lupa_rate_limits",
        "select public.lupa_consume_limit('x-y-z', repeat('a',64), 60, 5)",
        "select public.lupa_session_state('AB12CD34EF56', repeat('a',64))",
        "select count(*) from public.lupa_live_votes",
      ]) {
        await db.query("begin");
        await db.query("set local role " + role);
        await expect(db.query(sql)).rejects.toThrow(/permission denied/);
        await db.query("rollback");
      }
    }
  });

  it("limitador valida entrada e a retenção limpa contadores antigos", async () => {
    await expect(db.query("select public.lupa_consume_limit('BAD SCOPE', repeat('a',64), 60, 5)")).rejects.toThrow(/LUPA_LIMIT_INVALID_INPUT/);
    await db.query("insert into public.lupa_rate_limits(scope, key_hash, window_start, hits) values ('old-scope', repeat('b',64), now() - interval '3 days', 1)");
    const out = await db.query("select public.lupa_cleanup_expired_records(30) as r");
    expect(out.rows[0].r.rate_limits_deleted).toBeGreaterThanOrEqual(1);
    await expect(db.query("select public.lupa_cleanup_expired_records(0)")).rejects.toThrow(/RETENTION_DAYS_OUT_OF_RANGE/);
  });

  it("excluir o evento remove votos e feedback em cascata", async () => {
    expect(await live.deleteLiveEvent(CODE)).toBe(true);
    const orphan = await db.query("select (select count(*) from public.lupa_live_votes v where not exists (select 1 from public.lupa_live_events e where e.id = v.event_id))::int as votes, (select count(*) from public.lupa_event_feedback f where not exists (select 1 from public.lupa_live_events e where e.id = f.event_id))::int as feedback");
    expect(orphan.rows[0]).toEqual({ votes: 0, feedback: 0 });
    expect((await get()).status).toBe(404);
  });
});
