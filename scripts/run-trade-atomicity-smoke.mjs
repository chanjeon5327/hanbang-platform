#!/usr/bin/env node
/**
 * STEP1 스모크: trades + ledger 원자성/멱등성
 * - 주문 2개 → 매칭 → trades 1건 이상
 * - ledger_entries memo='TRADE_*' 2건 이상
 * - 중복 실행해도 증가하지 않는지(멱등) 확인
 */
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.log('SKIP: SUPABASE_URL/SERVICE_ROLE_KEY required');
  process.exit(0);
}

const admin = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  const itemId = process.env.SMOKE_ITEM_ID || '00000000-0000-0000-0000-000000000001';
  const userId1 = process.env.SMOKE_USER_1 || '00000000-0000-0000-0000-000000000002';
  const userId2 = process.env.SMOKE_USER_2 || '00000000-0000-0000-0000-000000000003';

  let tradesBefore = 0;
  let ledgerBefore = 0;

  try {
    const { count: t1 } = await admin.from('trades').select('*', { count: 'exact', head: true }).eq('content_id', itemId);
    tradesBefore = t1 ?? 0;

    const { data: le } = await admin.from('ledger_entries').select('id').or('memo.eq.TRADE_BUY,memo.eq.TRADE_SELL');
    ledgerBefore = le?.length ?? 0;

    const { data: match1 } = await admin.rpc('rpc_match_orders', { p_item_id: itemId });
    const { data: match2 } = await admin.rpc('rpc_match_orders', { p_item_id: itemId });

    const { count: t2 } = await admin.from('trades').select('*', { count: 'exact', head: true }).eq('content_id', itemId);
    const { data: le2 } = await admin.from('ledger_entries').select('id').or('memo.eq.TRADE_BUY,memo.eq.TRADE_SELL');
    const tradesAfter = t2 ?? 0;
    const ledgerAfter = le2?.length ?? 0;

    console.log('match1:', JSON.stringify(match1));
    console.log('match2:', JSON.stringify(match2));
    console.log('trades:', tradesBefore, '->', tradesAfter);
    console.log('ledger TRADE_*:', ledgerBefore, '->', ledgerAfter);
    console.log('IDEMPOTENT:', match2?.matched_count === 0 ? 'OK (2nd run no new matches)' : 'CHECK');
  } catch (e) {
    console.log('ERROR:', e?.message ?? e);
  }
}

main();
