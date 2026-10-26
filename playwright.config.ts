// © 2026 aiaiaiai · aiaiaiai.org
// SPDX-License-Identifier: MPL-2.0
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Software WebGL shares the runner CPU; concurrent scenes distort timing.
  workers: 1,
  expect: { timeout: 15_000 },
  timeout: 45_000,
  testDir: './tests',
  testMatch: '*.spec.ts',
  use: {
    baseURL: 'http://127.0.0.1:4321',
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
      args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
    },
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'touch',
      use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' },
    },
  ],
  webServer: {
    command: 'npm run dev -- --port 4321 --ignore-lock',
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: !process.env.CI,
  },
});
