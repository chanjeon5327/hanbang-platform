#!/usr/bin/env node
import 'dotenv/config';

/**
 * E2E 결제 플로우 테스트
 * - dev 서버 실행 중 (localhost:3000)
 * - E2E_TEST_EMAIL, E2E_TEST_PASSWORD 환경변수로 로그인
 * - 또는 로그인된 세션 없이 1~2단계 실패 확인
 */
const BASE = 'http://localhost:3000';

function log(step, msg, ok = true) {
  const icon = ok ? '✓' : '✗';
  console.log(`[${step}] ${icon} ${msg}`);
}

async function main() {
  const steps = [];
  let orderId = null;
  let redirectUrl = null;
  let amount = 0;

  // Step 0: 로그인
  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;

  let cookies = '';
  if (email && password) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !anonKey) {
        log('0', 'NEXT_PUBLIC_SUPABASE_URL/ANON_KEY 없음 - 로그인 스킵', false);
      } else {
        const authUrl = `${supabaseUrl}/auth/v1/token?grant_type=password`;
        console.log('[fetch]', authUrl);
        const authRes = await fetch(authUrl, {
          signal: AbortSignal.timeout(10000),
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: anonKey,
            Authorization: `Bearer ${anonKey}`,
          },
          body: JSON.stringify({ email, password }),
        });
        const authJson = await authRes.json();
        if (authJson.access_token) {
          const accessToken = authJson.access_token;
          const refreshToken = authJson.refresh_token ?? '';
          cookies = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token=${encodeURIComponent(JSON.stringify({ access_token: accessToken, refresh_token: refreshToken }))}; Path=/; HttpOnly; SameSite=Lax`;
          log('0', '로그인 성공');
        } else {
          log('0', `로그인 실패: ${authJson.error_description ?? authJson.msg ?? 'unknown'}`, false);
          console.log('\n실패 단계: 0 - 로그인');
          process.exit(1);
        }
      }
    } catch (e) {
      log('0', `로그인 예외: ${e.message}`, false);
      console.error(e.stack);
      console.log('\n실패 단계: 0 - 로그인');
      process.exit(1);
    }
  } else {
    log('0', 'E2E_TEST_EMAIL/PASSWORD 없음 - 1~2단계는 401 예상');
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(cookies ? { Cookie: cookies } : {}),
  };

  // Step 1: POST /api/orders/place
  const marketId = process.env.E2E_MARKET_ID ?? 'a1b2c3d4-e5f6-4789-a012-345678901234';
  const price = 12300;
  const quantity = 1;

  try {
    const placeUrl = `${BASE}/api/orders/place`;
    console.log('[fetch]', placeUrl);
    const placeRes = await fetch(placeUrl, {
      signal: AbortSignal.timeout(10000),
      method: 'POST',
      headers,
      body: JSON.stringify({ productId: marketId, marketId, side: 'BUY', price, quantity }),
    });
    const placeJson = await placeRes.json();

    if (!placeRes.ok) {
      log('1', `POST /api/orders/place 실패: ${placeRes.status} - ${placeJson.error ?? placeJson.message ?? JSON.stringify(placeJson)}`, false);
      console.log('\n실패 단계: 1 - POST /api/orders/place');
      process.exit(1);
    }

    if (!placeJson.success || !placeJson.data?.id) {
      log('1', `주문 생성 실패: ${placeJson.error ?? 'no order id'}`, false);
      console.log('\n실패 단계: 1 - POST /api/orders/place (응답 형식)');
      process.exit(1);
    }

    orderId = placeJson.data.id;
    log('1', `POST /api/orders/place 성공, order_id=${orderId}`);
  } catch (e) {
    log('1', `POST /api/orders/place 예외: ${e.message}`, false);
    console.error(e.stack);
    console.log('\n실패 단계: 1 - POST /api/orders/place');
    process.exit(1);
  }

  // Step 2: POST /api/payments/request
  try {
    const reqUrl = `${BASE}/api/payments/request`;
    console.log('[fetch]', reqUrl);
    const reqRes = await fetch(reqUrl, {
      signal: AbortSignal.timeout(10000),
      method: 'POST',
      headers,
      body: JSON.stringify({ order_id: orderId }),
    });
    const reqJson = await reqRes.json();

    if (!reqRes.ok) {
      log('2', `POST /api/payments/request 실패: ${reqRes.status} - ${reqJson.error ?? JSON.stringify(reqJson)}`, false);
      console.log('\n실패 단계: 2 - POST /api/payments/request');
      process.exit(1);
    }

    if (!reqJson.ok || !reqJson.redirect_url) {
      log('2', `결제 요청 실패: ${reqJson.error ?? 'no redirect_url'}`, false);
      console.log('\n실패 단계: 2 - POST /api/payments/request (응답 형식)');
      process.exit(1);
    }

    redirectUrl = reqJson.redirect_url;
    amount = reqJson.amount ?? price * quantity;
    log('2', `POST /api/payments/request 성공, redirect_url=${redirectUrl?.slice(0, 60)}...`);
  } catch (e) {
    log('2', `POST /api/payments/request 예외: ${e.message}`, false);
    console.error(e.stack);
    console.log('\n실패 단계: 2 - POST /api/payments/request');
    process.exit(1);
  }

  // Step 3: redirect_url 확인 (테스트 모드면 /order/pay)
  const isTestMode = redirectUrl?.includes('/order/pay');
  if (!isTestMode) {
    log('3', `redirect_url이 테스트 모드가 아님: ${redirectUrl}`, false);
    console.log('\n실패 단계: 3 - redirect_url (KCP_TEST_MODE=true 또는 KCP_SITE_CD 없음 확인)');
    process.exit(1);
  }
  log('3', 'redirect_url 확인 - 테스트 모드 /order/pay');

  // Step 4: POST /api/payments/confirm
  const pgTransactionId = `test-e2e-${Date.now()}`;
  try {
    const confirmUrl = `${BASE}/api/payments/confirm`;
    console.log('[fetch]', confirmUrl);
    const confirmRes = await fetch(confirmUrl, {
      signal: AbortSignal.timeout(10000),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId, pg_transaction_id: pgTransactionId }),
    });
    const confirmJson = await confirmRes.json();

    if (!confirmRes.ok) {
      log('4', `POST /api/payments/confirm 실패: ${confirmRes.status} - ${confirmJson.error ?? JSON.stringify(confirmJson)}`, false);
      console.log('\n실패 단계: 4 - POST /api/payments/confirm');
      process.exit(1);
    }

    if (!confirmJson.ok) {
      log('4', `결제 확정 실패: ${confirmJson.error}`, false);
      console.log('\n실패 단계: 4 - POST /api/payments/confirm (rpc_confirm_payment/rpc_finalize_order)');
      process.exit(1);
    }

    log('4', 'POST /api/payments/confirm 성공 (rpc_confirm_payment → PAID, rpc_finalize_order → COMPLETED)');
  } catch (e) {
    log('4', `POST /api/payments/confirm 예외: ${e.message}`, false);
    console.error(e.stack);
    console.log('\n실패 단계: 4 - POST /api/payments/confirm');
    process.exit(1);
  }

  // Step 5: ledger_entries 2건, orders.ledger_posted_at NOT NULL 확인 (Supabase 직접 조회)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    log('5', 'NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY 없음 - DB 검증 스킵', false);
    console.log('\nE2E_PAYMENT_FLOW_OK (API 단계까지 성공, DB 검증 스킵)');
    process.exit(0);
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: entries, error: leErr } = await admin
      .from('ledger_entries')
      .select('id, entry_type')
      .eq('order_id', orderId);

    if (leErr) {
      log('5', `ledger_entries 조회 실패: ${leErr.message}`, false);
      console.log('\n실패 단계: 5 - ledger_entries 조회');
      process.exit(1);
    }

    const cashDebit = entries?.filter((e) => e.entry_type === 'CASH_DEBIT').length ?? 0;
    const assetCredit = entries?.filter((e) => e.entry_type === 'ASSET_CREDIT').length ?? 0;

    if (cashDebit < 1 || assetCredit < 1) {
      log('5', `ledger_entries 부족: CASH_DEBIT=${cashDebit}, ASSET_CREDIT=${assetCredit} (각 1건 필요)`, false);
      console.log('\n실패 단계: 5 - ledger_entries 2건 (CASH_DEBIT, ASSET_CREDIT)');
      process.exit(1);
    }

    log('5', `ledger_entries 2건 확인 (CASH_DEBIT, ASSET_CREDIT)`);

    const { data: order, error: ordErr } = await admin
      .from('orders')
      .select('id, ledger_posted_at, status')
      .eq('id', orderId)
      .single();

    if (ordErr || !order) {
      log('5', `orders 조회 실패: ${ordErr?.message ?? 'not found'}`, false);
      console.log('\n실패 단계: 5 - orders 조회');
      process.exit(1);
    }

    if (!order.ledger_posted_at) {
      log('5', 'orders.ledger_posted_at IS NULL', false);
      console.log('\n실패 단계: 5 - orders.ledger_posted_at NOT NULL');
      process.exit(1);
    }

    log('5', `orders.ledger_posted_at NOT NULL, status=${order.status}`);
  } catch (e) {
    log('5', `DB 검증 예외: ${e.message}`, false);
    console.log('\n실패 단계: 5 - DB 검증');
    process.exit(1);
  }

  console.log('\nE2E_PAYMENT_FLOW_OK');
  process.exit(0);
}

main().catch((e) => {
  console.error('Unhandled error:', e);
  console.error(e.stack);
  process.exit(1);
});
