import { test, expect } from '@playwright/test';

/** 파수꾼: /demo — 비로그인 공개 접근 + CTA 확인 */
test.describe('Watchman Demo', () => {
  test('/demo 로드 200', async ({ page }) => {
    const res = await page.goto('/demo');
    expect(res?.status()).toBe(200);
  });

  test('핵심 CTA — 둘러보기·로그인 존재 (data-testid)', async ({ page }) => {
    await page.goto('/demo');
    await page.getByTestId('demo-cta-area').waitFor({ state: 'visible', timeout: 15000 });
    await expect(page.getByTestId('cta-explore')).toBeVisible();
    await expect(page.getByTestId('cta-login')).toBeVisible();
  });
});
