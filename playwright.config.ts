import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 60_000,
  use: { headless: true },
}); 