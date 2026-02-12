import { test, expect } from '@playwright/test';

/** 파수꾼: /mypage — 비로그인 시 /login 리다이렉트 */
test.describe('Watchman Mypage', () => {
  test('/mypage 비로그인 시 /login 리다이렉트', async ({ page }) => {
    await page.goto('/mypage');
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
  });

  test('리다이렉트 후 로그인 페이지 표시', async ({ page }) => {
    await page.goto('/mypage');
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
    await expect(page.getByTestId('login-page')).toBeVisible({ timeout: 5000 });
  });
});
