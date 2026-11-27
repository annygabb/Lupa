import { describe, expect, it } from "vitest";
import { getHealthPayload, HEALTH_SCHEMA_VERSION } from "../../lib/health";

describe("contrato de saúde da aplicação", () => {
  it("exibe estado público sem informações sensíveis", () => {
    const payload = getHealthPayload();
    expect(payload).toMatchObject({
      status: "ok", service: "lupa-saude",
      stage: "functional-mvp-v1", schemaVersion: HEALTH_SCHEMA_VERSION,
      liveReadiness: "/api/live/health",
    });
    expect(JSON.stringify(payload)).not.toMatch(/token|secret|password|supabase\.co/i);
  });
  it("reflete a configuração real do Live em vez de um valor fixo", () => {
    // Vitest roda com NODE_ENV=test e sem Supabase: motor local em memória.
    expect(getHealthPayload().dependencies.liveDatabase).toBe("local-demo-memory");
    const saved = { ...process.env };
    try {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://exemplo.supabase.co";
      process.env.SUPABASE_SECRET_KEY = "sb_secret_ficticio";
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ficticio";
      expect(getHealthPayload().dependencies.liveDatabase).toBe("configured");
    } finally {
      process.env = saved;
    }
  });
});
