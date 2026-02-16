import { test, expect } from '@playwright/test';

/** ?�수�? /mypage ??비로그인 ??/login 리다?�렉??*/
test.describe('Watchman Mypage', () => {
  test('/mypage 비로그인 ??/login 리다?�렉??, async ({ page }) => {
    await page.goto('/mypage');
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
  });

  test('리다?�렉????로그???�이지 ?�시', async ({ page }) => {
    await page.goto('/mypage');
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
    await expect(page.getByTestId('login-page')).toBeVisible({ timeout: 5000 });
  });
});
