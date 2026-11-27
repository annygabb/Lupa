import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST as loginPOST } from "@/app/api/auth/session/route";
import { POST as recoverPOST } from "@/app/api/auth/recover/route";
import { resetLocalLiveStore } from "@/lib/live/db";

const ORIGIN = "https://lupaa.vercel.app";
const req = (path: string, body: unknown, ip = "198.51.100.20", origin: string | null = ORIGIN) =>
  new NextRequest(ORIGIN + path, {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip, ...(origin ? { origin } : {}) },
    body: JSON.stringify(body),
  });

describe("login institucional — limite de tentativas no servidor", () => {
  const saved = { ...process.env };
  beforeEach(() => {
    resetLocalLiveStore();
    // Auth "configurado" com valores fictícios; a chamada ao provedor é simulada abaixo.
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://auth-ficticio.example";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ficticio";
    process.env.LUPA_APP_BASE_URL = ORIGIN;
    process.env.LUPA_AUTH_MAX_LOGIN_PER_EMAIL_15MIN = "3";
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ error: "invalid_grant" }), { status: 400 })));
  });
  afterEach(() => { process.env = { ...saved }; vi.unstubAllGlobals(); });

  it("recusa login sem Origin", async () => {
    const res = await loginPOST(req("/api/auth/session", { email: "a@b.co", password: "senha-ficticia" }, undefined, null));
    expect(res.status).toBe(403);
  });

  it("senha errada → 401 genérico; após o limite por e-mail → 429 sem consultar o provedor", async () => {
    const body = { email: "Pessoa@Exemplo.org", password: "senha-errada-123" };
    const statuses = [];
    for (let i = 0; i < 5; i++) statuses.push((await loginPOST(req("/api/auth/session", body, "198.51.100." + (30 + i)))).status);
    expect(statuses).toEqual([401, 401, 401, 429, 429]);
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(3);
    const blocked = await loginPOST(req("/api/auth/session", { ...body, email: "pessoa@exemplo.org" }, "198.51.100.99"));
    expect(blocked.status).toBe(429); // mesmo e-mail com outra capitalização e outra rede
    expect(blocked.headers.get("retry-after")).toBeTruthy();
  });

  it("recuperação de acesso não revela limite nem existência do e-mail", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 200 })));
    const bodies = [];
    for (let i = 0; i < 5; i++) bodies.push(await (await recoverPOST(req("/api/auth/recover", { email: "x@exemplo.org" }))).json());
    expect(new Set(bodies.map(b => b.message)).size).toBe(1);
    expect(vi.mocked(fetch).mock.calls.length).toBeLessThanOrEqual(3);
  });
});
