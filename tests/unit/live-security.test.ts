import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import {
  clientHash, issueSessionToken, normalizeCode, readSessionToken, sameSiteWrite, trustedOrigins,
} from "@/lib/live/security";

const CODE = "CAFE2026BEEF";

describe("sessão assinada do participante", () => {
  it("aceita o token emitido pelo servidor para o mesmo evento", () => {
    const { token, sid } = issueSessionToken(CODE);
    expect(readSessionToken(token, CODE)?.sid).toBe(sid);
  });
  it("recusa token de outro evento, adulterado, expirado ou inventado", () => {
    const { token } = issueSessionToken(CODE);
    expect(readSessionToken(token, "ABCDEF123456")).toBeNull();
    const tampered = token.slice(0, -1) + (token.endsWith("0") ? "1" : "0");
    expect(readSessionToken(tampered, CODE)).toBeNull();
    const old = issueSessionToken(CODE, Date.now() - 5 * 3600 * 1000).token;
    expect(readSessionToken(old, CODE)).toBeNull();
    expect(readSessionToken("a".repeat(48), CODE)).toBeNull(); // formato antigo, sem assinatura
    expect(readSessionToken(undefined, CODE)).toBeNull();
  });
});

describe("normalização do código do evento", () => {
  it("aceita minúsculas e espaços e devolve a forma canônica", () => {
    expect(normalizeCode(" cafe2026beef ")).toBe(CODE);
  });
  it("recusa formatos inválidos", () => {
    for (const bad of ["", "../../etc", "CAFE2026BEE", "CAFE2026BEEFF", "GGGGGGGGGGGG", null, undefined])
      expect(normalizeCode(bad as string)).toBeNull();
  });
});

describe("origem confiável para escrita", () => {
  const req = (headers: Record<string, string>) =>
    new NextRequest("https://lupaa.vercel.app/api/live/" + CODE + "/vote", { method: "POST", headers });
  it("recusa requisição SEM Origin (scripts)", () => {
    expect(sameSiteWrite(req({}))).toBe(false);
  });
  it("recusa origem de terceiro e fetch cross-site", () => {
    expect(sameSiteWrite(req({ origin: "https://evil.example" }))).toBe(false);
    expect(sameSiteWrite(req({ origin: "https://lupaa.vercel.app", "sec-fetch-site": "cross-site" }))).toBe(false);
  });
  it("aceita a própria origem e a origem derivada do Host (ex.: 127.0.0.1 em dev)", () => {
    expect(sameSiteWrite(req({ origin: "https://lupaa.vercel.app", "sec-fetch-site": "same-origin" }))).toBe(true);
    const local = new NextRequest("http://localhost:3000/api/live", {
      method: "POST", headers: { host: "127.0.0.1:3000", origin: "http://127.0.0.1:3000" },
    });
    expect(sameSiteWrite(local)).toBe(true);
  });
  it("aceita domínios alternativos declarados em LUPA_ALLOWED_ORIGINS", () => {
    process.env.LUPA_ALLOWED_ORIGINS = "https://lupa.exemplo.edu.br";
    try {
      expect(trustedOrigins(req({})).has("https://lupa.exemplo.edu.br")).toBe(true);
      expect(sameSiteWrite(req({ origin: "https://lupa.exemplo.edu.br" }))).toBe(true);
    } finally { delete process.env.LUPA_ALLOWED_ORIGINS; }
  });
});

describe("pseudonimização do cliente", () => {
  it("não expõe o IP e é estável para o mesmo endereço", () => {
    const a = clientHash(new Request("https://x/", { headers: { "x-forwarded-for": "203.0.113.7, 10.0.0.1" } }));
    const b = clientHash(new Request("https://x/", { headers: { "x-forwarded-for": "203.0.113.7" } }));
    expect(a).toBe(b);
    expect(a).toMatch(/^[a-f0-9]{64}$/);
    expect(a).not.toContain("203");
  });
});
