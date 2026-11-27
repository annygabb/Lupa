import { liveMode } from "@/lib/live/db";

export const HEALTH_SCHEMA_VERSION = "1.1.0" as const;
export const APPLICATION_STAGE = "functional-mvp-v1" as const;

/**
 * Estado público do serviço, sem segredos e sem consultar o banco.
 * `liveDatabase` informa a CONFIGURAÇÃO declarada; a prontidão real do banco
 * (conexão + tabelas) é verificada em /api/live/health.
 */
export function getHealthPayload() {
  const mode = liveMode();
  return {
    status: "ok" as const,
    service: "lupa-saude" as const,
    stage: APPLICATION_STAGE,
    schemaVersion: HEALTH_SCHEMA_VERSION,
    dependencies: {
      // O atlas de evidências não depende de banco: catálogo versionado no repositório.
      atlas: "static-catalog" as const,
      liveDatabase: mode === "supabase" ? "configured" as const
        : mode === "local-demo" ? "local-demo-memory" as const : "not-configured" as const,
      externalApis: "none-at-runtime" as const,
    },
    liveReadiness: "/api/live/health",
  };
}
