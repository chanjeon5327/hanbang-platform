#!/usr/bin/env node
/**
 * DAY4~5: 빠른 체결 테스트 모드
 * - 같은 content_id에 bid/ask 100쌍 생성
 * - 동시에 rpc_match_orders 호출
 * - ledger 합계 불일치 발생 시 exit(1)
 *
 * 환경변수: SMOKE_ITEM_ID, SMOKE_USER_1, SMOKE_USER_2
 * 사전: 두 유저에 sim deposit/reset 필요
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

const ITEM_ID = process.env.SMOKE_ITEM_ID || '00000000-0000-0000-0000-000000000001';
const USER_1 = process.env.SMOKE_USER_1 || '00000000-0000-0000-0000-000000000002';
const USER_2 = process.env.SMOKE_USER_2 || '00000000-0000-0000-0000-000000000003';
const PAIR_COUNT = 100;
const BASE_PRICE = 10;

async function ledgerBalances() {
  const { data } = await admin.from('ledger_entries').select('entry_type, amount, quantity');
  let cashBal = 0;
  let assetBal = 0;
  (data ?? []).forEach((r) => {
    if (r.entry_type === 'CASH_CREDIT') cashBal += Number(r.amount ?? 0);
    if (r.entry_type === 'CASH_DEBIT') cashBal -= Math.abs(Number(r.amount ?? 0));
    if (r.entry_type === 'ASSET_CREDIT') assetBal += Number(r.quantity ?? 0);
    if (r.entry_type === 'ASSET_DEBIT') assetBal -= Number(r.quantity ?? 0);
  });
  return { cashBal, assetBal };
}

async function main() {
  console.log('=== Sim Match Burst ===');
  console.log('item_id:', ITEM_ID, 'pairs:', PAIR_COUNT);

  await admin.rpc('rpc_sim_reset', { p_user_id: USER_1, p_amount_krw: 50_000_000 });
  await admin.rpc('rpc_sim_reset', { p_user_id: USER_2, p_amount_krw: 50_000_000 });
  console.log('sim reset 50M each for USER_1, USER_2');

  const before = await ledgerBalances();
  const initialCashBal = before.cashBal;
  const initialAssetBal = before.assetBal;
  console.log('ledger before: cash=', initialCashBal, 'asset=', initialAssetBal);

  const { data: ordersBefore } = await admin.from('orderbook_orders').select('id').eq('content_id', ITEM_ID);
  const { count: tradesBefore } = await admin.from('trades').select('*', { count: 'exact', head: true }).eq('content_id', ITEM_ID);
  console.log('orderbook_orders before:', ordersBefore?.length ?? 0, 'trades before:', tradesBefore ?? 0);

  const orders = [];
  for (let i = 0; i < PAIR_COUNT; i++) {
    const price = BASE_PRICE + (i % 10) * 0.01;
    orders.push({ side: 'bid', userId: USER_1, price, qty: 1 });
    orders.push({ side: 'ask', userId: USER_2, price, qty: 1 });
  }

  const placeRpc = 'rpc_sim_place_orderbook_order';
  const placePromises = orders.map((o) =>
    admin.rpc(placeRpc, {
      p_user_id: o.userId,
      p_item_id: ITEM_ID,
      p_side: o.side,
      p_price_usd: o.price,
      p_quantity: o.qty,
    })
  );

  const results = await Promise.allSettled(placePromises);
  const ok = results.filter((r) => r.status === 'fulfilled').length;
  const fail = results.filter((r) => r.status === 'rejected').length;
  console.log('place results: ok=', ok, 'fail=', fail);
  if (fail > 0) {
    results.filter((r) => r.status === 'rejected').slice(0, 3).forEach((r) => {
      console.error('  reject:', (r.reason as Error)?.message);
    });
  }

  const matchPromises = Array(20).fill(null).map(() => admin.rpc('rpc_match_orders', { p_item_id: ITEM_ID }));
  const matchResults = await Promise.all(matchPromises);
  const totalMatched = matchResults.reduce((a, m) => a + (m?.matched_count ?? 0), 0);
  console.log('match burst: total_matched=', totalMatched);

  const { count: tradesAfter } = await admin.from('trades').select('*', { count: 'exact', head: true }).eq('content_id', ITEM_ID);
  const after = await ledgerBalances();
  const cashBal = after.cashBal;
  const assetBal = after.assetBal;
  console.log('trades after:', tradesAfter ?? 0, 'ledger after: cash=', cashBal, 'asset=', assetBal);

  if (cashBal !== initialCashBal) {
    console.error('FAIL: cash balance changed', initialCashBal, '->', cashBal);
    process.exit(1);
  }
  if (assetBal !== initialAssetBal) {
    console.error('FAIL: asset balance changed', initialAssetBal, '->', assetBal);
    process.exit(1);
  }

  const since = new Date(Date.now() - 60_000).toISOString();
  const { count: auditCount } = await admin
    .from('financial_audit_logs')
    .select('*', { count: 'exact', head: true })
    .eq('action', 'ORDERBOOK_WRITE')
    .gte('created_at', since);
  if (auditCount === 0) {
    console.error('FAIL: no ORDERBOOK_WRITE audit in last minute');
    process.exit(1);
  }
  console.log('ORDERBOOK_WRITE audit count:', auditCount);

  const { data: tradeRows } = await admin.from('trades').select('id').eq('content_id', ITEM_ID);
  const ids = new Set((tradeRows ?? []).map((t) => t.id));
  if (ids.size !== (tradeRows ?? []).length) {
    console.error('FAIL: duplicate trades detected');
    process.exit(1);
  }

  console.log('PASS: entry_type balance match, no duplicate trades, ORDERBOOK_WRITE audit present');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
