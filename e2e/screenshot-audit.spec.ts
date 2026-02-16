/**
 * REAL SCREENSHOT AUDIT v2 - Playwright 스크린샷 수집
 * 실행: npx playwright test screenshot-audit
 * BASE_URL: playwright.config baseURL (localhost:3000)
 */

import { test } from '@playwright/test';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const OUT_DIR = join(process.cwd(), 'docs', 'SCREEN_AUDIT');

const URLS = [
  { path: '/', name: 'home' },
  { path: '/market', name: 'market' },
  { path: '/market/1', name: 'market_detail' },
  { path: '/wallet', name: 'wallet' },
  { path: '/login', name: 'login' },
  { path: '/signup', name: 'signup' },
  { path: '/kyc', name: 'kyc' },
  { path: '/onboarding', name: 'onboarding' },
  { path: '/dashboard', name: 'dashboard' },
  { path: '/notifications', name: 'notifications' },
  { path: '/admin/dashboard', name: 'admin_dashboard' },
  { path: '/admin/kyc', name: 'admin_kyc' },
];

test.beforeAll(async () => {
  await mkdir(OUT_DIR, { recursive: true });
});

for (const u of URLS) {
  const isWallet = u.name === 'wallet';
  test(`pc_${u.name}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(u.path, { waitUntil: 'domcontentloaded', timeout: isWallet ? 45000 : 30000 });
    await page.waitForTimeout(isWallet ? 3500 : 2000);
    await page.screenshot({
      path: join(OUT_DIR, `pc_${u.name}.png`),
      fullPage: true,
    });
  });
  test(`m_${u.name}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(u.path, { waitUntil: 'domcontentloaded', timeout: isWallet ? 45000 : 30000 });
    await page.waitForTimeout(isWallet ? 3500 : 2000);
    await page.screenshot({
      path: join(OUT_DIR, `m_${u.name}.png`),
      fullPage: true,
    });
  });
}
