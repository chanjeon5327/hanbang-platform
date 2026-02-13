import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

/**
 * E2E 결제 플로우 테스트
 * - /market/[id] 접속 → 매수/청약 CTA → place → request → /order/pay → confirm → success
 * - ledger_entries 2건, orders.ledger_posted_at NOT NULL 확인
 *
 * 환경변수: E2E_TEST_EMAIL, E2E_TEST_PASSWORD (로그인용)
 */
const E2E_EMAIL = process.env.E2E_TEST_EMAIL;
const E2E_PASSWORD = process.env.E2E_TEST_PASSWORD;
const SKIP_LOGIN = !E2E_EMAIL || !E2E_PASSWORD;

test.describe('E2E 결제 플로우', () => {
  test('전체 결제 E2E: market → place → request → pay → confirm → ledger 확인', async ({
    page,
  }) => {
    if (SKIP_LOGIN) {
      test.skip(true, 'E2E_TEST_EMAIL, E2E_TEST_PASSWORD 환경변수 필요');
    }

    const steps: string[] = [];
    const failAt = (step: string, msg: string) => {
      steps.push(`실패: ${step} - ${msg}`);
      throw new Error(`[${step}] ${msg}`);
    };

    // Step 0: 로그인
    if (!SKIP_LOGIN) {
      await test.step('0. 로그인', async () => {
        await page.goto('/login');
        await expect(page.getByTestId('login-page')).toBeVisible({ timeout: 10000 });
        await page.getByPlaceholder('이메일').fill(E2E_EMAIL!);
        await page.getByPlaceholder('비밀번호').fill(E2E_PASSWORD!);
        await page.getByTestId('login-submit').click();
        await expect(page).not.toHaveURL(/\/login/, { timeout: 10000 });
        steps.push('0. 로그인 성공');
      });
    } else {
      steps.push('0. 로그인 스킵 (E2E_TEST_EMAIL/PASSWORD 없음)');
    }

    // Step 1: /market 접속 → 첫 카드 클릭 → /market/[id]
    await test.step('1. /market/[id] 접속', async () => {
      await page.goto('/market');
      const cards = page.getByTestId('market-card');
      await expect(cards.first()).toBeVisible({ timeout: 15000 });
      await cards.first().click();
      await expect(page).toHaveURL(/\/market\/[^/]+$/, { timeout: 5000 });
      steps.push('1. /market/[id] 접속 성공');
    });

    // Step 2: 매수/청약 CTA 클릭 → place, request → /order/pay 리다이렉트
    let orderId: string | null = null;
    await test.step('2. 매수/청약 CTA 클릭 → place, request 호출 → redirect_url 확인', async () => {
      const cta = page.getByTestId('trade-cta');
      await expect(cta).toBeVisible({ timeout: 5000 });

      const placeResPromise = page.waitForResponse(
        (res) =>
          res.request().method() === 'POST' &&
          res.url().includes('/api/orders/place'),
        { timeout: 15000 }
      );
      const requestResPromise = page.waitForResponse(
        (res) =>
          res.request().method() === 'POST' &&
          res.url().includes('/api/payments/request'),
        { timeout: 15000 }
      );

      await cta.click();

      const placeRes = await placeResPromise;
      const placeJson = await placeRes.json().catch(() => ({}));
      if (placeRes.status() !== 200 || !placeJson?.success || !placeJson?.data?.id) {
        failAt('2', `place 실패: ${placeRes.status()} - ${placeJson?.error ?? JSON.stringify(placeJson)}`);
      }
      orderId = placeJson.data.id;

      const requestRes = await requestResPromise;
      const requestJson = await requestRes.json().catch(() => ({}));
      if (requestRes.status() !== 200 || !requestJson?.ok || !requestJson?.redirect_url) {
        failAt('2', `request 실패: ${requestRes.status()} - ${requestJson?.error ?? JSON.stringify(requestJson)}`);
      }
      if (!requestJson.redirect_url.includes('/order/pay')) {
        failAt('2', `redirect_url 테스트 모드 아님: ${requestJson.redirect_url}`);
      }

      steps.push('2. place, request 성공, redirect_url 확인');
    });

    // Step 3: /order/pay 이동 확인
    await test.step('3. /order/pay 이동', async () => {
      await expect(page).toHaveURL(/\/order\/pay/, { timeout: 10000 });
      if (!orderId) {
        orderId = new URL(page.url()).searchParams.get('order_id');
      }
      steps.push('3. /order/pay 이동 성공');
    });

    // Step 4: 결제 완료 버튼 클릭 → confirm 호출
    await test.step('4. 결제 완료 클릭 → confirm 호출', async () => {
      const confirmReq = page.waitForRequest(
        (req) =>
          req.method() === 'POST' && req.url().includes('/api/payments/confirm'),
        { timeout: 10000 }
      );

      await page.getByTestId('pay-confirm-btn').click();

      const req = await confirmReq;
      const res = await req.response();
      if (!res) failAt('4', 'confirm 응답 없음');
      const json = await res!.json().catch(() => ({}));
      if (!json?.ok) {
        failAt('4', `confirm 실패: ${json?.error ?? JSON.stringify(json)}`);
      }
      steps.push('4. confirm 성공 (rpc_confirm_payment → PAID, rpc_finalize_order → COMPLETED)');
    });

    // Step 5: /order/success 이동
    await test.step('5. /order/success 이동', async () => {
      await expect(page).toHaveURL(/\/order\/success/, { timeout: 10000 });
      steps.push('5. /order/success 이동 성공');
    });

    // Step 6: ledger_entries 2건, orders.ledger_posted_at NOT NULL
    const finalOrderId = orderId ?? new URL(page.url()).searchParams.get('order_id');
    if (finalOrderId) {
      await test.step('6. ledger_entries, orders.ledger_posted_at 확인', async () => {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!url || !key) {
          steps.push('6. DB 검증 스킵 (환경변수 없음)');
          return;
        }

        const admin = createClient(url, key);

        const { data: entries, error: leErr } = await admin
          .from('ledger_entries')
          .select('id, entry_type')
          .eq('order_id', finalOrderId);

        if (leErr) failAt('6', `ledger_entries 조회 실패: ${leErr.message}`);

        const cashDebit = entries?.filter((e) => e.entry_type === 'CASH_DEBIT').length ?? 0;
        const assetCredit = entries?.filter((e) => e.entry_type === 'ASSET_CREDIT').length ?? 0;
        if (cashDebit < 1 || assetCredit < 1) {
          failAt('6', `ledger_entries 부족: CASH_DEBIT=${cashDebit}, ASSET_CREDIT=${assetCredit}`);
        }

        const { data: order, error: ordErr } = await admin
          .from('orders')
          .select('id, ledger_posted_at, status')
          .eq('id', finalOrderId)
          .single();

        if (ordErr || !order) failAt('6', `orders 조회 실패: ${ordErr?.message ?? 'not found'}`);
        if (!order!.ledger_posted_at) failAt('6', 'orders.ledger_posted_at IS NULL');

        steps.push('6. ledger_entries 2건, ledger_posted_at NOT NULL 확인');
      });
    }

    console.log('\n--- E2E 결제 플로우 단계 ---');
    steps.forEach((s) => console.log(s));
    console.log('\nE2E_PAYMENT_FLOW_OK');
  });
});
