// Apenas para ambientes com Chromium pré-instalado em caminho fixo (ex.: contêiner de auditoria).
// Uso: PW_CHROMIUM_PATH=/caminho/chrome npx playwright test -c playwright.local-chromium.config.ts
import base from "./playwright.config";

const config = {
  ...base,
  use: { ...base.use, trace: "off" as const, launchOptions: { executablePath: process.env.PW_CHROMIUM_PATH } },
};
export default config;
