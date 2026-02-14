#!/usr/bin/env node
/**
 * DB 점검: rpc 정의, 테이블 구조, 최근 데이터
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
  // 4) 최근 settlement 3건
  const { data: settlements, error: e1 } = await supabase
    .from('settlement_batches')
    .select('*')
    .order('settlement_date', { ascending: false })
    .limit(3);
  if (e1) console.error('settlement_batches error:', e1.message);
  else console.log('4) 최근 settlement 3건:\n', JSON.stringify(settlements ?? [], null, 2));

  // 5) 최근 ledger_entries 5건
  const { data: ledgers, error: e2 } = await supabase
    .from('ledger_entries')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
  if (e2) console.error('ledger_entries error:', e2.message);
  else console.log('\n5) 최근 ledger_entries 5건:\n', JSON.stringify(ledgers ?? [], null, 2));
}

run().catch(console.error);
