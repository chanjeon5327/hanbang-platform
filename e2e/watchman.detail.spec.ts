import { test, expect } from '@playwright/test';

/** 파수꾼: /market → 첫 카드 클릭 → 상세 진입 → 매수 클릭 → 비로그인 시 /login 또는 requireLogin UI (하드코딩 slug 금지) */
test.describe('Watchman Detail', () => {
  test('/market 첫 카드 → 상세 → 매수 클릭 → 비로그인 시 /login 또는 requireLogin UI', async ({ page }) => {
    await page.goto('/market');
    const cards = page.getByTestId('market-card');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
    await cards.first().click();

    await expect(page).toHaveURL(/\/market\/[^/]+$/);
    await expect(page.getByTestId('trade-primary-action')).toBeVisible({ timeout: 10000 });
    await page.getByTestId('trade-primary-action').click();

    const loginPage = page.waitForURL(/\/login/, { timeout: 8000 });
    const requireLoginUI = page.getByTestId('trade-primary-action').filter({ hasText: /로그인/ }).waitFor({ state: 'visible', timeout: 8000 });
    await Promise.race([loginPage, requireLoginUI]);

    const onLogin = page.url().includes('/login');
    const showRequireLogin = await page.getByTestId('trade-primary-action').filter({ hasText: '로그인 후 거래' }).isVisible().catch(() => false);
    expect(onLogin || showRequireLogin).toBeTruthy();
  });
});
