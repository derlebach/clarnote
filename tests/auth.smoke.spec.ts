import { test, expect } from '@playwright/test';

const domains = [
  process.env.AUTH_TEST_URL ?? 'http://localhost:3000',
];

for (const base of domains) {
  test.describe(`Auth smoke: ${base}`, () => {
    test('health endpoint ok', async ({ request }) => {
      const r = await request.get(`${base}/api/health/auth`);
      const j = await r.json();
      expect(r.ok()).toBeTruthy();
      expect(j.ok).toBe(true);
    });

    test('google button redirects with correct callback', async ({ page }) => {
      await page.goto(`${base}/auth/signin?callbackUrl=${encodeURIComponent(`${base}/dashboard`)}`);
      
      // Wait for page to load and find the Google button
      await page.waitForLoadState('networkidle');
      const btn = page.locator('button:has-text("Continue with Google")');
      await expect(btn).toBeVisible();

      // Click the button and wait for navigation to Google
      await btn.click();
      
      // Wait for navigation to Google OAuth
      await page.waitForURL('**/accounts.google.com/**', { timeout: 10000 });
      
      // Make sure it's Google OAuth
      const url = page.url();
      expect(url).toContain('accounts.google.com');

      // Extract redirect_uri param and ensure it matches current domain
      const u = new URL(url);
      const redirectUri = u.searchParams.get('redirect_uri');
      expect(redirectUri).toBe(`${base}/api/auth/callback/google`);
    });
  });
} 