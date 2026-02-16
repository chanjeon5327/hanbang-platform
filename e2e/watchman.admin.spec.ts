import { test, expect } from '@playwright/test';

/** ?�수�? /admin ??비로그인/권한 ?�을 ??/login ?�는 /admin/login 리다?�렉??*/
test.describe('Watchman Admin', () => {
  test('/admin 비로그인 ??리다?�렉??, async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/(login|admin\/login)/, { timeout: 8000 });
  });

  test('/admin 진입 ??권한 차단 ?�는 로그???�도', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/(login|admin\/login)/, { timeout: 8000 });
    const onLogin = page.url().includes('/login');
    const onAdminLogin = page.url().includes('/admin/login');
    const showForbidden = await page.getByTestId('admin-forbidden').isVisible().catch(() => false);
    expect(onLogin || onAdminLogin || showForbidden).toBeTruthy();
  });
});
