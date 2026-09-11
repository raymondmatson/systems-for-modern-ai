import {defineConfig,devices} from '@playwright/test';

const APP_BASE_URL = 'http://127.0.0.1:4173/systems-for-modern-ai/';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: APP_BASE_URL,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1',
    url: APP_BASE_URL,
    reuseExistingServer: false,
    timeout: 120000,
  },
  projects: [
    {name: 'chromium', use: {...devices['Desktop Chrome']}},
    {name: 'firefox', use: {...devices['Desktop Firefox']}},
    {name: 'webkit', use: {...devices['Desktop Safari']}},
  ],
});
