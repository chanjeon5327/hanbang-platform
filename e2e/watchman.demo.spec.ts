import { test, expect } from '@playwright/test';

/** ?�수�? /demo ??비로그인 공개 ?�근 + CTA ?�인 */
test.describe('Watchman Demo', () => {
  test('/demo 로드 200', async ({ page }) => {
    const res = await page.goto('/demo');
    expect(res?.status()).toBe(200);
  });

  test('?�심 CTA ???�러보기·로그??존재 (data-testid)', async ({ page }) => {
    await page.goto('/demo');
    await page.getByTestId('demo-cta-area').waitFor({ state: 'visible', timeout: 15000 });
    await expect(page.getByTestId('cta-explore')).toBeVisible();
    await expect(page.getByTestId('cta-login')).toBeVisible();
  });
});
