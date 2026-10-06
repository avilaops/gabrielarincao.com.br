import { defineConfig, devices } from '@playwright/test';

// No CI o Chromium vem de `npx playwright install`. Em ambientes que já têm um
// Chromium instalado, aponte PLAYWRIGHT_CHROMIUM para ele.
const executablePath = process.env.PLAYWRIGHT_CHROMIUM || undefined;

export default defineConfig({
  testDir: 'e2e',
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4321',
    launchOptions: { executablePath },
  },
  projects: [
    { name: 'celular', use: { ...devices['Pixel 7'], launchOptions: { executablePath } } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'], launchOptions: { executablePath } } },
  ],
  webServer: {
    command: 'npx astro preview --port 4321',
    // O Astro 7 manda o preview para segundo plano quando detecta um agente de IA,
    // e o Playwright entende isso como servidor que caiu. Primeiro plano sempre.
    env: { ASTRO_PREVIEW_BACKGROUND: '0' },
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
  },
});
