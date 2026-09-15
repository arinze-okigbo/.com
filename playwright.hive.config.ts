import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/hive",
  timeout: 60000,
  expect: { timeout: 10000 },
  workers: process.env.CI ? 2 : 3,
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL: process.env.QA_URL || "http://localhost:3100", trace: "retain-on-failure" },
  webServer: process.env.QA_URL
    ? undefined
    : {
        command: "npx next start -p 3100",
        port: 3100,
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
      },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    { name: "mobile", use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" } },
  ],
});
