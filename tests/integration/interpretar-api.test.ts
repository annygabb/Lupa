import { describe, expect, it } from "vitest";
import { GET, POST } from "@/app/api/interpretar/route";

const url = "http://localhost/api/interpretar";
const post = (body: string, headers: Record<string, string> = { "content-type": "application/json" }) =>
  POST(new Request(url, { method: "POST", headers, body }));

describe("POST /api/interpretar", () => {
  it("interpreta uma afirmação conhecida com fontes, limites e revisão pendente", async () => {
    const res = await post(JSON.stringify({ claimId: "uti-mortalidade-nao-e-efeito-do-medicamento" }));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch(/application\/json/);
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
    const body = await res.json();
    expect(body.classification).toBe("not_comparable");
    expect(body.clinicalReviewPending).toBe(true);
    expect(body.method).toBe("deterministic-curated");
    expect(body.evidence.map((e: { id: string }) => e.id)).toEqual(["E04", "E12"]);
    expect(body.projection.allowed).toBe(false);
  });

  it("id desconhecido → 404 sem detalhes internos", async () => {
    const res = await post(JSON.stringify({ claimId: "inventado-pelo-usuario" }));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBe("UNKNOWN_CLAIM");
    expect(JSON.stringify(body)).not.toMatch(/at \w+ \(|node_modules|stack/i);
  });

  it("JSON inválido → 400", async () => {
    const res = await post("{claimId:");
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("INVALID_JSON");
  });

  it("campos extras ou tipos errados → 400", async () => {
    expect((await post(JSON.stringify({ claimId: "massa-magra-nao-equivale-a-musculos", extra: 1 }))).status).toBe(400);
    expect((await post(JSON.stringify({ claimId: 42 }))).status).toBe(400);
    expect((await post(JSON.stringify(["massa-magra-nao-equivale-a-musculos"]))).status).toBe(400);
  });

  it("caracteres especiais e tentativa de injeção não ecoam no corpo", async () => {
    const res = await post(JSON.stringify({ claimId: "<script>alert(1)</script>" }));
    expect([400, 404]).toContain(res.status);
    expect(await res.text()).not.toContain("<script>");
  });

  it("content-type errado → 415", async () => {
    const res = await post(JSON.stringify({ claimId: "massa-magra-nao-equivale-a-musculos" }), { "content-type": "text/plain" });
    expect(res.status).toBe(415);
  });

  it("corpo grande → 413", async () => {
    const res = await post(JSON.stringify({ claimId: "x".repeat(4000) }));
    expect(res.status).toBe(413);
  });

  it("resposta é estável para a mesma entrada", async () => {
    const a = await (await post(JSON.stringify({ claimId: "interromper-tratamento-reganho" }))).json();
    const b = await (await post(JSON.stringify({ claimId: "interromper-tratamento-reganho" }))).json();
    expect(a).toEqual(b);
  });
});

describe("GET /api/interpretar", () => {
  it("lista as afirmações disponíveis (allowlist)", async () => {
    const res = GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.claims.length).toBeGreaterThanOrEqual(3);
    expect(body.claims[0]).toHaveProperty("id");
  });
});
