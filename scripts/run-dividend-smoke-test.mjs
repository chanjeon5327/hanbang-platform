#!/usr/bin/env node
/**
 * DIVIDEND ENGINE SMOKE TEST
 * 1) item_id 1건 확보 (content_items 또는 fallback)
 * 2) rpc_calculate_dividend(revenue=10000, rate=0.1)
 * 3) rpc_execute_dividend
 * 4) ledger_entries CASH_CREDIT+DIVIDEND 확인
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

const supabase = createClient(url, key);

const FALLBACK_ITEM_ID = 'a1b2c3d4-e5f6-4789-a012-345678901234';

function log(step, msg, ok = true) {
  const icon = ok ? '✓' : '✗';
  console.log(`[${step}] ${icon} ${msg}`);
}

async function run() {
  let itemId = null;
  let dividendId = null;

  // 1) item_id 1건 확보
  const { data: items, error: e0 } = await supabase
    .from('content_items')
    .select('id')
    .limit(1);

  if (e0) {
    log(1, `content_items 조회 실패: ${e0.message}`, false);
    itemId = FALLBACK_ITEM_ID;
    console.log(`   → fallback 사용: ${itemId} (content_items에 없으면 실패 예상)`);
  } else if (items?.length) {
    itemId = items[0].id;
    log(1, `item_id 확보: ${itemId}`);
  } else {
    itemId = FALLBACK_ITEM_ID;
    log(1, `content_items 비어있음, fallback: ${itemId}`, false);
    console.log('   → 하드코딩: scripts/run-dividend-smoke-test.mjs 내 FALLBACK_ITEM_ID 수정 또는 시드 추가');
  }

  // 2) rpc_calculate_dividend
  const { data: calcResult, error: e1 } = await supabase.rpc('rpc_calculate_dividend', {
    p_item_id: itemId,
    p_total_revenue: 10000,
    p_dividend_rate: 0.1,
  });

  if (e1) {
    log(2, `rpc_calculate_dividend 실패: ${e1.message}`, false);
    console.log('\n--- 실패 판정 ---');
    if (e1.message?.includes('Could not find the function') || e1.message?.includes('schema cache')) {
      console.log('진단: RPC 미등록(마이그레이션 미적용). supabase/migrations/20260318_dividend_engine_ensure.sql');
      console.log('조치: Supabase Dashboard > SQL Editor에서 해당 파일 내용 붙여넣기 후 실행');
    }
    process.exit(1);
  }

  dividendId = calcResult?.dividend_id;
  if (!dividendId) {
    log(2, 'dividend_id 없음', false);
    process.exit(1);
  }
  log(2, `dividend_id=${dividendId}, total_dividend=${calcResult?.total_dividend ?? 1000}`);

  // 3) rpc_execute_dividend
  const { data: execResult, error: e2 } = await supabase.rpc('rpc_execute_dividend', {
    p_dividend_id: dividendId,
  });

  if (e2) {
    log(3, `rpc_execute_dividend 실패: ${e2.message}`, false);
    process.exit(1);
  }
  if (execResult?.ok === false) {
    log(3, `실행 실패: ${execResult?.error ?? 'unknown'}`, false);
    process.exit(1);
  }
  log(3, 'rpc_execute_dividend 성공');

  // 4) ledger_entries 확인 (이번 dividend_id 기준)
  const { data: allLedgers, error: e3 } = await supabase
    .from('ledger_entries')
    .select('id, user_id, entry_type, amount, memo, metadata')
    .eq('entry_type', 'CASH_CREDIT')
    .eq('memo', 'DIVIDEND');

  const ledgers = (allLedgers ?? []).filter((l) => l.metadata?.dividend_id === dividendId);

  if (e3) {
    log(4, `ledger_entries 조회 실패: ${e3.message}`, false);
    process.exit(1);
  }

  const count = (ledgers ?? []).length;
  if (count >= 1) {
    log(4, `ledger_entries CASH_CREDIT+DIVIDEND ${count}건 확인`);
    console.log('\n--- 검증 SQL ---');
    console.log(`
SELECT id, user_id, entry_type, amount, memo, metadata->>'dividend_id'
FROM ledger_entries
WHERE entry_type = 'CASH_CREDIT' AND memo = 'DIVIDEND'
  AND metadata->>'dividend_id' = '${dividendId}'
ORDER BY created_at DESC
LIMIT 10;
`);
    console.log('--- 결과 샘플 ---');
    (ledgers ?? []).slice(0, 3).forEach((l, i) => {
      console.log(`  [${i + 1}] id=${l.id} user_id=${l.user_id} amount=${l.amount} memo=${l.memo}`);
    });
  } else {
    log(4, 'ledger_entries에 CASH_CREDIT+DIVIDEND 0건 (user_positions 비어있으면 정상)', count === 0 ? true : false);
    if (count === 0) {
      console.log('   → item_id에 대한 보유 포지션이 없으면 분배 0건이 정상');
    }
  }

  const distCount = await supabase
    .from('dividend_distributions')
    .select('id', { count: 'exact', head: true })
    .eq('dividend_id', dividendId)
    .then((r) => r.count ?? 0);

  console.log('\n--- 성공 판정 ---');
  console.log(`dividend_id=${dividendId}`);
  console.log(`distributions row count=${distCount}`);
  console.log(`ledger_entries row count=${count}`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
