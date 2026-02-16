import { test, expect } from '@playwright/test';

/** ?�수�? /login ??로그???�이지 로드 + ??존재 */
test.describe('Watchman Login', () => {
  test('/login 로드 200', async ({ page }) => {
    const res = await page.goto('/login');
    expect(res?.status()).toBe(200);
  });

  test('로그???�이지 ?�심 ?�소 (data-testid)', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByTestId('login-page')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('login-submit')).toBeVisible();
  });
});
