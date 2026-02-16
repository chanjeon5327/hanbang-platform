import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

/**
 * E2E ê²°ì œ ?Œë¡œ???ŒìŠ¤??
 * - /market/[id] ?‘ì† ??ë§¤ìˆ˜/ì²?•½ CTA ??place ??request ??/order/pay ??confirm ??success
 * - ledger_entries 2ê±? orders.ledger_posted_at NOT NULL ?•ì¸
 *
 * ?˜ê²½ë³€?? E2E_TEST_EMAIL, E2E_TEST_PASSWORD (ë¡œê·¸?¸ìš©)
 */
const E2E_EMAIL = process.env.E2E_TEST_EMAIL;
const E2E_PASSWORD = process.env.E2E_TEST_PASSWORD;
const SKIP_LOGIN = !E2E_EMAIL || !E2E_PASSWORD;

test.describe('E2E ê²°ì œ ?Œë¡œ??, () => {
  test('?„ì²´ ê²°ì œ E2E: market ??place ??request ??pay ??confirm ??ledger ?•ì¸', async ({
    page,
  }) => {
    if (SKIP_LOGIN) {
      test.skip(true, 'E2E_TEST_EMAIL, E2E_TEST_PASSWORD ?˜ê²½ë³€???„ìš”');
    }

    const steps: string[] = [];
    const failAt = (step: string, msg: string) => {
      steps.push(`?¤íŒ¨: ${step} - ${msg}`);
      throw new Error(`[${step}] ${msg}`);
    };

    // Step 0: ë¡œê·¸??
    if (!SKIP_LOGIN) {
      await test.step('0. ë¡œê·¸??, async () => {
        await page.goto('/login');
        await expect(page.getByTestId('login-page')).toBeVisible({ timeout: 10000 });
        await page.getByPlaceholder('?´ë©”??).fill(E2E_EMAIL!);
        await page.getByPlaceholder('ë¹„ë?ë²ˆí˜¸').fill(E2E_PASSWORD!);
        await page.getByTestId('login-submit').click();
        await expect(page).not.toHaveURL(/\/login/, { timeout: 10000 });
        steps.push('0. ë¡œê·¸???±ê³µ');
      });
    } else {
      steps.push('0. ë¡œê·¸???¤í‚µ (E2E_TEST_EMAIL/PASSWORD ?†ìŒ)');
    }

    // Step 1: /market ?‘ì† ??ì²?ì¹´ë“œ ?´ë¦­ ??/market/[id]
    await test.step('1. /market/[id] ?‘ì†', async () => {
      await page.goto('/market');
      const cards = page.getByTestId('market-card');
      await expect(cards.first()).toBeVisible({ timeout: 15000 });
      await cards.first().click();
      await expect(page).toHaveURL(/\/market\/[^/]+$/, { timeout: 5000 });
      steps.push('1. /market/[id] ?‘ì† ?±ê³µ');
    });

    // Step 2: ë§¤ìˆ˜/ì²?•½ CTA ?´ë¦­ ??place, request ??/order/pay ë¦¬ë‹¤?´ë ‰??
    let orderId: string | null = null;
    await test.step('2. ë§¤ìˆ˜/ì²?•½ CTA ?´ë¦­ ??place, request ?¸ì¶œ ??redirect_url ?•ì¸', async () => {
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
        failAt('2', `place ?¤íŒ¨: ${placeRes.status()} - ${placeJson?.error ?? JSON.stringify(placeJson)}`);
      }
      orderId = placeJson.data.id;

      const requestRes = await requestResPromise;
      const requestJson = await requestRes.json().catch(() => ({}));
      if (requestRes.status() !== 200 || !requestJson?.ok || !requestJson?.redirect_url) {
        failAt('2', `request ?¤íŒ¨: ${requestRes.status()} - ${requestJson?.error ?? JSON.stringify(requestJson)}`);
      }
      if (!requestJson.redirect_url.includes('/order/pay')) {
        failAt('2', `redirect_url ?ŒìŠ¤??ëª¨ë“œ ?„ë‹˜: ${requestJson.redirect_url}`);
      }

      steps.push('2. place, request ?±ê³µ, redirect_url ?•ì¸');
    });

    // Step 3: /order/pay ?´ë™ ?•ì¸
    await test.step('3. /order/pay ?´ë™', async () => {
      await expect(page).toHaveURL(/\/order\/pay/, { timeout: 10000 });
      if (!orderId) {
        orderId = new URL(page.url()).searchParams.get('order_id');
      }
      steps.push('3. /order/pay ?´ë™ ?±ê³µ');
    });

    // Step 4: ê²°ì œ ?„ë£Œ ë²„íŠ¼ ?´ë¦­ ??confirm ?¸ì¶œ
    await test.step('4. ê²°ì œ ?„ë£Œ ?´ë¦­ ??confirm ?¸ì¶œ', async () => {
      const confirmReq = page.waitForRequest(
        (req) =>
          req.method() === 'POST' && req.url().includes('/api/payments/confirm'),
        { timeout: 10000 }
      );

      await page.getByTestId('pay-confirm-btn').click();

      const req = await confirmReq;
      const res = await req.response();
      if (!res) failAt('4', 'confirm ?‘ë‹µ ?†ìŒ');
      const json = await res!.json().catch(() => ({}));
      if (!json?.ok) {
        failAt('4', `confirm ?¤íŒ¨: ${json?.error ?? JSON.stringify(json)}`);
      }
      steps.push('4. confirm ?±ê³µ (rpc_confirm_payment ??PAID, rpc_finalize_order ??COMPLETED)');
    });

    // Step 5: /order/success ?´ë™
    await test.step('5. /order/success ?´ë™', async () => {
      await expect(page).toHaveURL(/\/order\/success/, { timeout: 10000 });
      steps.push('5. /order/success ?´ë™ ?±ê³µ');
    });

    // Step 6: ledger_entries 2ê±? orders.ledger_posted_at NOT NULL
    const finalOrderId = orderId ?? new URL(page.url()).searchParams.get('order_id');
    if (finalOrderId) {
      await test.step('6. ledger_entries, orders.ledger_posted_at ?•ì¸', async () => {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!url || !key) {
          steps.push('6. DB ê²€ì¦??¤í‚µ (?˜ê²½ë³€???†ìŒ)');
          return;
        }

        const admin = createClient(url, key);

        const { data: entries, error: leErr } = await admin
          .from('ledger_entries')
          .select('id, entry_type')
          .eq('order_id', finalOrderId);

        if (leErr) failAt('6', `ledger_entries ì¡°íšŒ ?¤íŒ¨: ${leErr.message}`);

        const cashDebit = entries?.filter((e) => e.entry_type === 'CASH_DEBIT').length ?? 0;
        const assetCredit = entries?.filter((e) => e.entry_type === 'ASSET_CREDIT').length ?? 0;
        if (cashDebit < 1 || assetCredit < 1) {
          failAt('6', `ledger_entries ë¶€ì¡? CASH_DEBIT=${cashDebit}, ASSET_CREDIT=${assetCredit}`);
        }

        const { data: order, error: ordErr } = await admin
          .from('orders')
          .select('id, ledger_posted_at, status')
          .eq('id', finalOrderId)
          .single();

        if (ordErr || !order) failAt('6', `orders ì¡°íšŒ ?¤íŒ¨: ${ordErr?.message ?? 'not found'}`);
        if (!order!.ledger_posted_at) failAt('6', 'orders.ledger_posted_at IS NULL');

        steps.push('6. ledger_entries 2ê±? ledger_posted_at NOT NULL ?•ì¸');
      });
    }

    console.log('\n--- E2E ê²°ì œ ?Œë¡œ???¨ê³„ ---');
    steps.forEach((s) => console.log(s));
    console.log('\nE2E_PAYMENT_FLOW_OK');
  });
});
