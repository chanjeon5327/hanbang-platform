import { test, expect } from '@playwright/test';

/** ?�수�? /market ??�?카드 ?�릭 ???�세 진입 ??매수 ?�릭 ??비로그인 ??/login ?�는 requireLogin UI (?�드코딩 slug 금�?) */
test.describe('Watchman Detail', () => {
  test('/market �?카드 ???�세 ??매수 ?�릭 ??비로그인 ??/login ?�는 requireLogin UI', async ({ page }) => {
    await page.goto('/market');
    const cards = page.getByTestId('market-card');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
    await cards.first().click();

    await expect(page).toHaveURL(/\/market\/[^/]+$/);
    await expect(page.getByTestId('trade-primary-action')).toBeVisible({ timeout: 10000 });
    await page.getByTestId('trade-primary-action').click();

    const loginPage = page.waitForURL(/\/login/, { timeout: 8000 });
    const requireLoginUI = page.getByTestId('trade-primary-action').filter({ hasText: /로그?? }).waitFor({ state: 'visible', timeout: 8000 });
    await Promise.race([loginPage, requireLoginUI]);

    const onLogin = page.url().includes('/login');
    const showRequireLogin = await page.getByTestId('trade-primary-action').filter({ hasText: '로그????거래' }).isVisible().catch(() => false);
    expect(onLogin || showRequireLogin).toBeTruthy();
  });
});
