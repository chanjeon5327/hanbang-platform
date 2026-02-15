#!/usr/bin/env node
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
  console.log('(A) dividends 1개 조회');
  const { data: divs } = await supabase.from('dividends').select('*').order('created_at', { ascending: false }).limit(1);
  const div = divs?.[0];
  if (!div) {
    console.log('  dividends 없음');
    return;
  }
  console.log('  dividend_id=', div.id);

  console.log('\n(B) dividend 상세 조회');
  const { data: dists } = await supabase.from('dividend_distributions').select('*').eq('dividend_id', div.id);
  const total = (dists ?? []).reduce((s, d) => s + Number(d.payout_amount ?? 0), 0);
  console.log('  recipient_count=', (dists ?? []).length, 'total_payout=', total);

  console.log('\n(C) 내 배당(my) 조회');
  const { data: profiles } = await supabase.from('profiles').select('id').limit(1);
  const uid = profiles?.[0]?.id;
  if (uid) {
    const { data: my } = await supabase.from('dividend_distributions').select('*').eq('user_id', uid).limit(5);
    console.log('  count=', (my ?? []).length);
  } else {
    console.log('  user 없음');
  }
}

run().catch(console.error);
