export const HEALTH_SCHEMA_VERSION = "1.0.0" as const;
export const APPLICATION_STAGE = "foundation" as const;
export function getHealthPayload() {
  return {
    status: "ok" as const,
    service: "lupa-saude" as const,
    stage: APPLICATION_STAGE,
    schemaVersion: HEALTH_SCHEMA_VERSION,
    dependencies: {
      database: "not-configured" as const,
      externalApis: "not-configured" as const,
    },
  };
}
