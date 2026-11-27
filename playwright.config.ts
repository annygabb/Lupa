import { defineConfig } from "@playwright/test";

const port = 3101;
const url = process.env.LUPA_QA_URL ?? "http://127.0.0.1:"+port;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["list"],["html",{open:"never"}]] : "list",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: url,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    actionTimeout: 10_000,
  },
  projects: [
    { name: "desktop-wide-chromium", use: {browserName:"chromium",viewport:{width:1440,height:900},deviceScaleFactor:1}},
    { name: "desktop-chromium", use: {
      browserName: "chromium",viewport:{width:1280,height:800},
      deviceScaleFactor:1,
    }},
    { name: "mobile-small-chromium", use: {
      browserName:"chromium",viewport:{width:360,height:780},
      deviceScaleFactor:2,isMobile:true,hasTouch:true,
    }},
    { name: "mobile-chromium", use: {
      browserName:"chromium",viewport:{width:390,height:844},
      deviceScaleFactor:2,isMobile:true,hasTouch:true,
    }},
    { name: "tablet-chromium", use: {
      browserName:"chromium",viewport:{width:768,height:1024},
      deviceScaleFactor:1,hasTouch:true,
    }},
  ],
  webServer:process.env.LUPA_QA_URL?undefined:{
    command:"pnpm exec next start -p "+port,
    url,
    reuseExistingServer:!process.env.CI,
    timeout:60_000,
    stdout:"ignore",
    stderr:"pipe",
  },
});
