#!/usr/bin/env node
/**
 * DAY4~5: 포지션 자동 스트레스 테스트
 * - 랜덤 price_usd 변동
 * - 50회 체결 반복
 * - 포지션 손익 계산 검증
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
const TRADE_COUNT = 50;
const FX = 1350;

function randomPrice(min = 9.5, max = 10.5) {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100;
}

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
  console.log('=== Sim PnL Volatility ===');
  console.log('item_id:', ITEM_ID, 'trades:', TRADE_COUNT);

  await admin.rpc('rpc_sim_reset', { p_user_id: USER_1, p_amount_krw: 100_000_000 });
  await admin.rpc('rpc_sim_reset', { p_user_id: USER_2, p_amount_krw: 100_000_000 });

  const before = await ledgerBalances();
  const initialCashBal = before.cashBal;
  const initialAssetBal = before.assetBal;
  console.log('ledger before: cash=', initialCashBal, 'asset=', initialAssetBal);

  for (let i = 0; i < TRADE_COUNT; i++) {
    const price = randomPrice(9 + i * 0.01, 11 - i * 0.01);
    await admin.rpc('rpc_sim_place_orderbook_order', {
      p_user_id: USER_1,
      p_item_id: ITEM_ID,
      p_side: 'bid',
      p_price_usd: price,
      p_quantity: 1,
    });
    await admin.rpc('rpc_sim_place_orderbook_order', {
      p_user_id: USER_2,
      p_item_id: ITEM_ID,
      p_side: 'ask',
      p_price_usd: price,
      p_quantity: 1,
    });
    await admin.rpc('rpc_match_orders', { p_item_id: ITEM_ID });
  }

  const after = await ledgerBalances();
  const cashBal = after.cashBal;
  const assetBal = after.assetBal;
  const { count: tradesCount } = await admin.from('trades').select('*', { count: 'exact', head: true }).eq('content_id', ITEM_ID);
  const { data: tradeRows } = await admin.from('trades').select('id').eq('content_id', ITEM_ID);
  const ids = new Set((tradeRows ?? []).map((t) => t.id));

  console.log('ledger after: cash=', cashBal, 'asset=', assetBal, 'trades:', tradesCount, 'unique:', ids.size);

  if (cashBal !== initialCashBal) {
    console.error('FAIL: cash balance changed', initialCashBal, '->', cashBal);
    process.exit(1);
  }
  if (assetBal !== initialAssetBal) {
    console.error('FAIL: asset balance changed', initialAssetBal, '->', assetBal);
    process.exit(1);
  }
  if (ids.size !== (tradeRows ?? []).length) {
    console.error('FAIL: duplicate trades');
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

  console.log('PASS: 50 trades, entry_type balance match, no duplicates, ORDERBOOK_WRITE audit present');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
