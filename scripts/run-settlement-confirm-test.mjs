#!/usr/bin/env node
/**
 * 1) confirmed_at null인 settlement_batch 1건 조회
 * 2) batch_id 출력
 * 3) rpc_admin_confirm_settlement(batch_id) 실행
 * 4) 실행 결과 출력
 * 5) 해당 batch에 연결된 ledger_entries 조회
 * 6) ledger_posted_at 값 출력
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

async function run() {
  // 1) confirmed_at이 null인 settlement_batch 1건 조회
  const { data: batches, error: e1 } = await supabase
    .from('settlement_batches')
    .select('id, settlement_date, confirmed_at, order_count')
    .is('confirmed_at', null)
    .limit(1);

  if (e1) {
    console.error('1) settlement_batches 조회 오류:', e1.message);
    process.exit(1);
  }

  if (!batches?.length) {
    console.log('1) confirmed_at이 null인 settlement_batch 없음.');
    process.exit(0);
  }

  const batch = batches[0];
  console.log('1) confirmed_at null인 settlement_batch 1건:', JSON.stringify(batch, null, 2));
  const batch_id = batch.id;

  console.log('1) confirmed_at null인 settlement_batch 1건:', JSON.stringify(batch, null, 2));
  console.log('\n2) batch_id:', batch_id);

  // 3) rpc_admin_confirm_settlement(batch_id) 실행
  const { data: rpcResult, error: e2 } = await supabase.rpc('rpc_admin_confirm_settlement', {
    p_batch_id: batch_id,
  });

  if (e2) {
    console.error('\n3) rpc_admin_confirm_settlement 오류:', e2.message);
    process.exit(1);
  }

  console.log('\n4) rpc_admin_confirm_settlement 실행 결과:', JSON.stringify(rpcResult, null, 2));

  // 5) 해당 batch에 연결된 orders의 id 조회
  const { data: orders, error: e3 } = await supabase
    .from('orders')
    .select('id')
    .eq('settlement_batch_id', batch_id);

  if (e3) {
    console.error('\n5) orders 조회 오류:', e3.message);
    process.exit(1);
  }

  const order_ids = (orders ?? []).map((o) => o.id);

  if (order_ids.length === 0) {
    console.log('\n5) 해당 batch에 연결된 orders 없음.');
    console.log('6) ledger_entries 없음.');
    return;
  }

  // 5) ledger_entries 조회 (order_id in order_ids)
  const { data: ledgers, error: e4 } = await supabase
    .from('ledger_entries')
    .select('*')
    .in('order_id', order_ids);

  if (e4) {
    console.error('\n5) ledger_entries 조회 오류:', e4.message);
    process.exit(1);
  }

  console.log('\n5) 해당 batch에 연결된 ledger_entries:', JSON.stringify(ledgers ?? [], null, 2));
  console.log('\n6) ledger_posted_at 값:');
  (ledgers ?? []).forEach((l, i) => {
    const lp = l.ledger_posted_at ?? 'null';
    console.log(`   [${i + 1}] id=${l.id} order_id=${l.order_id} entry_type=${l.entry_type} ledger_posted_at=${lp}`);
  });
}

run().catch(console.error);
