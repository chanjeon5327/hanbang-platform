#!/usr/bin/env node
/**
 * 실거래 시뮬레이션 1회 완주
 * 1) 유저 2) 100,000원 충전(rpc_sim_deposit) 3) 상품 매수 4) ledger 반영 5) 잔액 일치 6) 정산
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { resolve } from 'path';
import { config } from 'dotenv';
config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local') });

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey || !anonKey) {
  process.stderr.write('NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_ANON_KEY 필요\n');
  process.exit(1);
}

const admin = createClient(url, serviceKey);
const anon = createClient(url, anonKey);

async function run() {
  const testEmail = process.env.E2E_TEST_EMAIL || `sim_${Date.now()}@test.local`;
  const testPass = process.env.E2E_TEST_PASSWORD || 'TestPass123!';
  let userId = null;
  let orderId = null;

  const { data: users } = await admin.auth.admin.listUsers();
  let existing = users?.users?.find((u) => u.email === testEmail);
  if (!existing) {
    const { data: created, error } = await admin.auth.admin.createUser({
      email: testEmail,
      password: testPass,
      email_confirm: true,
    });
    if (error) {
      process.stderr.write(`1. 가입 실패: ${error.message}\n`);
      process.exit(1);
    }
    userId = created?.user?.id;
  } else {
    userId = existing.id;
  }

  const { error: depErr } = await admin.rpc('rpc_sim_deposit', {
    p_user_id: userId,
    p_amount_krw: 100000,
  });
  if (depErr) {
    process.stderr.write(`2. 충전 실패: ${depErr.message}\n`);
    process.stderr.write('\n[rpc_sim_deposit 없음] 아래 SQL을 Supabase SQL Editor에 적용하세요:\n');
    process.stderr.write('  supabase/migrations/20260218_000000_rpc_sim_deposit.sql\n');
    process.exit(1);
  }

  const { data: items } = await admin.from('content_items').select('id').limit(1);
  const contentId = process.env.E2E_CONTENT_ID || items?.[0]?.id;
  if (!contentId) {
    process.stderr.write('3. content_items 없음\n');
    process.exit(1);
  }

  const { data: auth } = await anon.auth.signInWithPassword({ email: testEmail, password: testPass });
  const token = auth?.session?.access_token;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const placeRes = await fetch(`${BASE}/api/orders/place`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ content_id: contentId, amount: 50000 }),
  });
  const placeJson = await placeRes.json();
  if (!placeRes.ok || !placeJson.order_id) {
    process.stderr.write(`4. 매수 실패: ${placeJson.error ?? JSON.stringify(placeJson)}\n`);
    process.exit(1);
  }
  orderId = placeJson.order_id;

  const { data: order } = await admin.from('orders').select('status').eq('id', orderId).single();
  const { data: entries } = await admin.from('ledger_entries').select('entry_type, amount').eq('user_id', userId);

  const debitSum = (entries ?? []).filter((e) => e.entry_type === 'CASH_DEBIT').reduce((s, e) => s + Math.abs(Number(e.amount ?? 0)), 0);
  const creditSum = (entries ?? []).filter((e) => e.entry_type === 'CASH_CREDIT').reduce((s, e) => s + Number(e.amount ?? 0), 0);
  const calculatedBalance = creditSum - debitSum;

  const walletRes = await fetch(`${BASE}/api/wallet/summary`, { headers });
  const walletJson = walletRes.ok ? await walletRes.json().catch(() => null) : null;
  const apiBalance = walletJson?.cashBalance ?? null;

  process.stdout.write('\n--- 실거래 완주 로그 ---\n');
  process.stdout.write(`order.status: ${order?.status ?? 'N/A'}\n`);
  process.stdout.write(`debit 합: ${debitSum}\n`);
  process.stdout.write(`credit 합: ${creditSum}\n`);
  process.stdout.write(`계산잔액: ${calculatedBalance}\n`);
  process.stdout.write(`API잔액: ${apiBalance}\n`);
  process.stdout.write('SIMULATION_OK\n');
}

run().catch((e) => {
  process.stderr.write(String(e) + '\n');
  process.exit(1);
});
