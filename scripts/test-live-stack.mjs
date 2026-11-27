// Executa o E2E do LUPA Live contra um "Supabase" SIMULADO sobre Postgres REAL descartável.
// Pré-requisitos: build de produção (`pnpm run build`), Postgres acessível e openssl.
//   LUPA_PG_TEST_URL=postgres://usuario@127.0.0.1:5432/lupa_e2e node scripts/test-live-stack.mjs
// O nome do banco precisa conter "test" ou "e2e"; ele é APAGADO e recriado.
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
if (!process.env.LUPA_PG_TEST_URL) {
  console.error("Defina LUPA_PG_TEST_URL para um banco descartável (nome com 'test' ou 'e2e').");
  process.exit(1);
}
const run = (cmd, args, env = process.env) => {
  const r = spawnSync(cmd, args, { stdio: "inherit", env, cwd: root });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

run(process.execPath, ["tests/support/prepare-db.mjs"]);

// Certificado autoassinado só para o simulador (o LUPA exige https para o Auth).
const dir = join(root, ".live-e2e");
mkdirSync(dir, { recursive: true });
const cert = join(dir, "cert.pem"), key = join(dir, "key.pem");
if (!existsSync(cert)) {
  run("openssl", ["req", "-x509", "-newkey", "rsa:2048", "-nodes", "-days", "2", "-subj", "/CN=127.0.0.1",
    "-addext", "subjectAltName=IP:127.0.0.1", "-keyout", key, "-out", cert]);
}
const bundle = join(dir, "ca-bundle.pem");
const extra = process.env.NODE_EXTRA_CA_CERTS && existsSync(process.env.NODE_EXTRA_CA_CERTS)
  ? readFileSync(process.env.NODE_EXTRA_CA_CERTS, "utf8") + "\n" : "";
writeFileSync(bundle, extra + readFileSync(cert, "utf8"));

run("npx", ["playwright", "test", "-c", "playwright.live.config.ts", ...process.argv.slice(2)], {
  ...process.env,
  LIVE_E2E_CERT: cert,
  LIVE_E2E_KEY: key,
  LIVE_E2E_CA_BUNDLE: bundle,
  LIVE_E2E_SIGNING_SECRET: randomBytes(32).toString("hex"),
});
