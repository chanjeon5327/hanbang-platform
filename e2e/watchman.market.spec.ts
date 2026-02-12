import { test, expect } from '@playwright/test';

/** 파수꾼: /market — 리스트 로드 + 카드 1개 이상 */
test.describe('Watchman Market', () => {
  test('/market 리스트 로드', async ({ page }) => {
    const res = await page.goto('/market');
    expect(res?.status()).toBe(200);
  });

  test('카드 1개 이상 존재 (data-testid)', async ({ page }) => {
    await page.goto('/market');
    await expect(page.getByRole('heading', { name: '수익권 마켓' })).toBeVisible();
    const cards = page.getByTestId('market-card');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
    expect(await cards.count()).toBeGreaterThanOrEqual(1);
  });
});
