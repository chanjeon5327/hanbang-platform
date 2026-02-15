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

async function main() {
  let itemId = null;
  let userId = null;

  const { data: items } = await supabase.from('content_items').select('id').order('created_at', { ascending: false }).limit(1);
  itemId = items?.[0]?.id;
  if (!itemId) {
    console.error('content_items 없음');
    process.exit(1);
  }

  const { data: profiles } = await supabase.from('profiles').select('id').limit(1);
  userId = profiles?.[0]?.id;
  if (!userId) {
    const { data: le } = await supabase.from('ledger_entries').select('user_id').limit(1).single();
    userId = le?.user_id;
  }
  if (!userId) {
    console.error('user_id 없음');
    process.exit(1);
  }

  const { data: existing } = await supabase
    .from('ledger_entries')
    .select('id')
    .eq('user_id', userId)
    .eq('asset_id', itemId)
    .eq('memo', 'TEST_POSITION')
    .limit(1);
  if (!existing?.length) {
    let orderId = null;
    let productId = null;
    const { data: prods } = await supabase.from('products').select('id').or(`content_id.eq.${itemId},id.eq.${itemId}`).limit(1);
    productId = prods?.[0]?.id;
    if (!productId) {
      const { data: anyProd } = await supabase.from('products').select('id').limit(1).single();
      if (!anyProd?.id) {
        console.error('products 없음');
        process.exit(1);
      }
      productId = anyProd.id;
    }
    const { data: ord } = await supabase.from('orders').insert({
      user_id: userId,
      product_id: productId,
      type: 'BUY',
      order_type: 'MARKET',
      price: 0,
      quantity: 100,
      status: 'COMPLETED',
    }).select('id').single();
    orderId = ord?.id;
    if (!orderId) {
      const { data: anyOrd } = await supabase.from('orders').select('id').limit(1).single();
      orderId = anyOrd?.id;
    }
    if (orderId) {
      const { error: ie } = await supabase.from('ledger_entries').insert({
        user_id: userId,
        order_id: orderId,
        entry_type: 'ASSET_CREDIT',
        asset_id: itemId,
        quantity: 100,
        amount: 0,
        currency: 'KRW',
        memo: 'TEST_POSITION',
        metadata: {},
      });
      if (ie) {
        console.error('ledger insert:', ie.message);
        process.exit(1);
      }
    } else {
      console.error('order_id 없음, ledger 스킵');
    }
  }

  const { data: positions } = await supabase.from('user_positions').select('*').eq('item_id', itemId);
  console.log('user_positions:', JSON.stringify(positions ?? [], null, 2));

  const { data: calc, error: ce } = await supabase.rpc('rpc_calculate_dividend', {
    p_item_id: itemId,
    p_total_revenue: 100000,
    p_dividend_rate: 0.1,
  });
  if (ce) {
    console.error('rpc_calculate_dividend:', ce.message);
    process.exit(1);
  }
  const dividendId = calc?.dividend_id;
  if (!dividendId) {
    console.error('dividend_id null');
    process.exit(1);
  }

  const { data: exec, error: ee } = await supabase.rpc('rpc_execute_dividend', { p_dividend_id: dividendId });
  if (ee) {
    console.error('rpc_execute_dividend:', ee.message);
    if (ee.message?.includes('order_id') && ee.message?.includes('not-null')) {
      console.error('\nPATCH: Supabase SQL Editor에서 실행:\nALTER TABLE public.ledger_entries ALTER COLUMN order_id DROP NOT NULL;\n');
    }
    process.exit(1);
  }
  if (exec?.ok === false) {
    console.error('execute fail:', exec?.error);
    process.exit(1);
  }

  const { count: distCount } = await supabase.from('dividend_distributions').select('*', { count: 'exact', head: true }).eq('dividend_id', dividendId);
  const { count: ledgerCount } = await supabase.from('ledger_entries').select('*', { count: 'exact', head: true }).eq('memo', 'DIVIDEND');

  console.log('\n--- FINAL OUTPUT ---');
  console.log('dividend_id=', dividendId);
  console.log('dividend_distributions row count=', distCount ?? 0);
  console.log("ledger_entries memo='DIVIDEND' count=", ledgerCount ?? 0);
  console.log('성공');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
