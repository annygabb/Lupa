import { defineConfig } from "@playwright/test";

/**
 * E2E do LUPA Live com banco: Next.js (build de produção) → Supabase SIMULADO → Postgres real.
 * Use `node scripts/test-live-stack.mjs` (prepara banco, certificado e variáveis).
 */
const PORT = 3103;
const FAKE = "https://127.0.0.1:54443";
const env = (extra: Record<string, string>) => ({ ...process.env, ...extra }) as Record<string, string>;

export default defineConfig({
  testDir: "./tests/e2e-live",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  timeout: 90_000,
  expect: { timeout: 20_000 },
  use: {
    baseURL: "http://localhost:" + PORT,
    trace: "off",
    actionTimeout: 15_000,
    ...(process.env.PW_CHROMIUM_PATH ? { launchOptions: { executablePath: process.env.PW_CHROMIUM_PATH } } : {}),
  },
  projects: [{ name: "live-stack-chromium", use: { browserName: "chromium", viewport: { width: 1280, height: 900 } } }],
  webServer: [
    {
      command: "node tests/support/fake-supabase.mjs",
      url: FAKE + "/health",
      ignoreHTTPSErrors: true,
      reuseExistingServer: false,
      timeout: 20_000,
      env: env({
        FAKE_SUPABASE_PORT: "54443",
        FAKE_SUPABASE_TLS_CERT: process.env.LIVE_E2E_CERT ?? "",
        FAKE_SUPABASE_TLS_KEY: process.env.LIVE_E2E_KEY ?? "",
      }),
    },
    {
      command: "pnpm exec next start -p " + PORT,
      url: "http://localhost:" + PORT + "/api/health",
      reuseExistingServer: false,
      timeout: 60_000,
      env: env({
        NODE_EXTRA_CA_CERTS: process.env.LIVE_E2E_CA_BUNDLE ?? "",
        NEXT_PUBLIC_SUPABASE_URL: FAKE,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_fake_for_tests_only",
        SUPABASE_SECRET_KEY: "sb_secret_fake_for_tests_only",
        LUPA_LIVE_SIGNING_SECRET: process.env.LIVE_E2E_SIGNING_SECRET ?? "",
        LUPA_APP_BASE_URL: "http://localhost:" + PORT,
      }),
    },
  ],
});
