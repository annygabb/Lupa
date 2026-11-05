import { describe, expect, it } from "vitest";
import { getHealthPayload, HEALTH_SCHEMA_VERSION } from "../../lib/health";
describe("contrato de saude da aplicacao", () => {
  it("exibe estado publico sem informacoes sensiveis", () => {
    expect(getHealthPayload()).toEqual({
      status: "ok", service: "lupa-saude",
      stage: "functional-mvp-v1", schemaVersion: HEALTH_SCHEMA_VERSION,
      dependencies: { database: "not-configured", externalApis: "not-configured" },
    });
  });
  it("nao informa banco conectado", () => {
    const payload = getHealthPayload();
    expect(payload.dependencies.database).toBe("not-configured");
    expect(JSON.stringify(payload)).not.toMatch(/token|secret|password/i);
  });
});
