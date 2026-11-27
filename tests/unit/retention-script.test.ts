import { describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";

const run = (overrides: Record<string, string> = {}) => spawnSync(
  process.execPath,
  ["scripts/retention-cleanup.mjs"],
  {
    cwd: process.cwd(),
    encoding: "utf8",
    env: {
      ...process.env,
      LUPA_SUPABASE_URL: "",
      NEXT_PUBLIC_SUPABASE_URL: "",
      SUPABASE_SECRET_KEY: "",
      LUPA_SUPABASE_SERVICE_ROLE_KEY: "",
      LUPA_RETENTION_DAYS: "30",
      LUPA_RETENTION_DRY_RUN: "",
      ...overrides,
    },
  },
);

describe("Retenção: nunca informar sucesso falso", () => {
  it("falha sem banco quando não é dry-run", () => {
    const result = run();
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("Banco LUPA não configurado");
  });
  it("dry-run só funciona se declarado explicitamente", () => {
    const result = run({ LUPA_RETENTION_DRY_RUN: "true" });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("nenhuma operação destrutiva");
  });
  it("rejeita retenção zero, negativa ou maior que 365", () => {
    for (const days of ["0", "-1", "366", "abc"]) {
      expect(run({ LUPA_RETENTION_DAYS: days }).status).not.toBe(0);
    }
  });
});
