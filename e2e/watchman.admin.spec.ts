import { test, expect } from '@playwright/test';

/** 파수꾼: /admin — 비로그인/권한 없을 시 /login 또는 /admin/login 리다이렉트 */
test.describe('Watchman Admin', () => {
  test('/admin 비로그인 시 리다이렉트', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/(login|admin\/login)/, { timeout: 8000 });
  });

  test('/admin 진입 후 권한 차단 또는 로그인 유도', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/(login|admin\/login)/, { timeout: 8000 });
    const onLogin = page.url().includes('/login');
    const onAdminLogin = page.url().includes('/admin/login');
    const showForbidden = await page.getByTestId('admin-forbidden').isVisible().catch(() => false);
    expect(onLogin || onAdminLogin || showForbidden).toBeTruthy();
  });
});
