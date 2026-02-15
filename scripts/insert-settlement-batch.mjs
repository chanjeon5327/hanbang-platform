#!/usr/bin/env node
/**
 * settlement_batches에 1건 INSERT 후 batch_id 출력
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
  // seller_id 조회
  const { data: existing } = await supabase
    .from('settlement_batches')
    .select('seller_id')
    .limit(1)
    .single();

  const seller_id = existing?.seller_id;
  if (!seller_id) {
    console.error('settlement_batches에 기존 행 없음. seller_id를 알 수 없습니다.');
    process.exit(1);
  }

  const row = {
    seller_id,
    settlement_date: new Date().toISOString().slice(0, 10),
    order_count: 1,
    gross_amount: 10000,
    platform_fee: 300,
    net_amount: 9700,
    snapshot_hash: 'test-' + Date.now(),
  };

  const { data, error } = await supabase
    .from('settlement_batches')
    .insert(row)
    .select('id')
    .single();

  if (error) {
    console.error('INSERT 오류:', error.message);
    process.exit(1);
  }

  console.log('batch_id:', data.id);
}

run().catch(console.error);
