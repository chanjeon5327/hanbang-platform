#!/usr/bin/env node
/**
 * STEP2-5 Audit Coverage Smoke Test
 * 1) orderbook 주문 1회 (place)
 * 2) match 1회
 * 3) settlement confirm 1회 (가능하면)
 * 4) dividend status 변경 1회 (가능하면)
 *
 * 각 단계 후 financial_audit_logs에서 기대 action이 최근 1분 내 존재하는지 확인
 * 없으면 exit(1)
 *
 * 환경변수:
 *   SMOKE_USER_EMAIL, SMOKE_USER_PASSWORD - Step 1용 (없으면 skip)
 *   SMOKE_ITEM_ID - Step 1,4용 (없으면 content_items 첫 행 사용)
 */
import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY required');
  process.exit(1);
}

const admin = createClient(url, key);
const ONE_MIN_MS = 60 * 1000;

function since1Min() {
  return new Date(Date.now() - ONE_MIN_MS).toISOString();
}

async function assertAuditExists(expectedActions, stepName) {
  const actions = Array.isArray(expectedActions) ? expectedActions : [expectedActions];
  const { data, error } = await admin
    .from('financial_audit_logs')
    .select('action, created_at')
    .gte('created_at', since1Min())
    .in('action', actions)
    .limit(1);

  if (error) {
    console.error(`[${stepName}] financial_audit_logs 조회 실패:`, error.message);
    process.exit(1);
  }
  if (!data?.length) {
    console.error(`[${stepName}] FAIL: 기대 action ${actions.join('|')} 가 최근 1분 내 없음`);
    process.exit(1);
  }
  console.log(`[${stepName}] ✓ audit 확인: ${data[0].action}`);
}

async function run() {
  let itemId = process.env.SMOKE_ITEM_ID;
  if (!itemId) {
    const { data: items } = await admin.from('content_items').select('id').limit(1);
    itemId = items?.[0]?.id;
  }
  if (!itemId) {
    console.error('SMOKE_ITEM_ID 또는 content_items에 item 없음');
    process.exit(1);
  }
  console.log('item_id:', itemId);

  // --- Step 1: orderbook place ---
  const email = process.env.SMOKE_USER_EMAIL;
  const password = process.env.SMOKE_USER_PASSWORD;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (email && password && anonKey) {
    const userClient = createClient(url, anonKey, { auth: { persistSession: false } });
    const { data: signIn, error: signErr } = await userClient.auth.signInWithPassword({ email, password });
    if (signErr) {
      console.error('[Step1] signIn 실패:', signErr.message);
      process.exit(1);
    }
    const userId = signIn?.user?.id;
    if (!userId) {
      console.error('[Step1] user id 없음');
      process.exit(1);
    }

    const { data: placeResult, error: placeErr } = await userClient.rpc('rpc_place_orderbook_order', {
      p_user_id: userId,
      p_item_id: itemId,
      p_side: 'bid',
      p_price_usd: 10,
      p_quantity: 1,
      p_price_krw: 13500,
    });
    if (placeErr) {
      console.error('[Step1] rpc_place_orderbook_order 실패:', placeErr.message);
      if (placeErr.message?.includes('INSUFFICIENT_FUNDS')) {
        console.log('   → 테스트 유저에 잔액이 없습니다. rpc_invest_and_notify로 입금 후 재시도');
      }
      process.exit(1);
    }
    console.log('[Step1] ✓ orderbook place 성공, order_id:', placeResult?.order_id);
    await assertAuditExists(['ORDERBOOK_WRITE', 'ORDERBOOK_PLACE'], 'Step1');
  } else {
    console.log('[Step1] SKIP (SMOKE_USER_EMAIL, SMOKE_USER_PASSWORD, NEXT_PUBLIC_SUPABASE_ANON_KEY 미설정)');
  }

  // --- Step 2: match ---
  const { data: matchResult, error: matchErr } = await admin.rpc('rpc_match_orders', { p_item_id: itemId });
  if (matchErr) {
    console.error('[Step2] rpc_match_orders 실패:', matchErr.message);
    process.exit(1);
  }
  const matchedCount = matchResult?.matched_count ?? 0;
  console.log('[Step2] ✓ match 완료, matched_count:', matchedCount);
  if (matchedCount > 0) {
    await assertAuditExists(['MATCH_ORDER', 'ORDERBOOK_WRITE', 'LEDGER_WRITE'], 'Step2');
  } else {
    console.log('[Step2] 매칭된 주문 없음, audit 검증 skip');
  }

  // --- Step 3: settlement confirm (가능하면) ---
  const { data: batches } = await admin
    .from('settlement_batches')
    .select('id')
    .is('confirmed_at', null)
    .limit(1);

  if (batches?.length) {
    const batchId = batches[0].id;
    const { error: settleErr } = await admin.rpc('rpc_admin_confirm_settlement', { p_batch_id: batchId });
    if (settleErr) {
      console.error('[Step3] rpc_admin_confirm_settlement 실패:', settleErr.message);
      process.exit(1);
    }
    console.log('[Step3] ✓ settlement confirm 성공, batch_id:', batchId);
    await assertAuditExists(['LEDGER_WRITE', 'SETTLEMENT_WRITE'], 'Step3');
  } else {
    console.log('[Step3] SKIP (confirmed_at null인 settlement_batch 없음)');
  }

  // --- Step 4: dividend status 변경 (가능하면) ---
  const { data: calcResult, error: calcErr } = await admin.rpc('rpc_calculate_dividend', {
    p_item_id: itemId,
    p_total_revenue: 10000,
    p_dividend_rate: 0.1,
  });
  if (calcErr) {
    console.log('[Step4] rpc_calculate_dividend 실패(스킵):', calcErr.message);
  } else {
    const dividendId = calcResult?.dividend_id;
    if (dividendId) {
      await assertAuditExists('DIVIDEND_WRITE', 'Step4-calc');

      const { error: confirmErr } = await admin.rpc('rpc_confirm_dividend', { p_dividend_id: dividendId });
      if (confirmErr) {
        console.log('[Step4] rpc_confirm_dividend 실패(스킵):', confirmErr.message);
      } else {
        console.log('[Step4] ✓ dividend calculate + confirm 성공');
        await assertAuditExists('DIVIDEND_WRITE', 'Step4-confirm');
      }
    }
  }

  console.log('\n--- Audit Coverage Smoke: PASS ---');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
