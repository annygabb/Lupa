import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    fileParallelism: false,
    // Segredo FICTÍCIO apenas para testes (32+ caracteres); nunca usado fora do Vitest.
    env: {
      LUPA_LIVE_SIGNING_SECRET: "vitest-only-signing-secret-0123456789abcdef",
      LUPA_LOG_SILENT: "1",
    },
  },
});
