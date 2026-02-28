#!/usr/bin/env node
/**
 * 데모 거래 E2E 스모크 테스트
 * - WATCH_BASE_URL (기본 http://localhost:3000)
 * - 로그인 → 상세페이지 진입 → 매수 API 호출 → wallet/ledger 확인
 * - DEMO_TRADING=true 환경에서 실행 권장
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { resolve } from 'path';
import { config } from 'dotenv';
config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local') });

const WATCH_BASE_URL = process.env.WATCH_BASE_URL || 'http://localhost:3000';
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
  const testEmail = process.env.E2E_TEST_EMAIL || 'demo@test.local';
  const testPass = process.env.E2E_TEST_PASSWORD || 'TestPass123!';
  let userId = null;

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

  const { data: auth } = await anon.auth.signInWithPassword({ email: testEmail, password: testPass });
  const token = auth?.session?.access_token;
  if (!token) {
    process.stderr.write('2. 로그인 실패\n');
    process.exit(1);
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const { data: items } = await admin.from('content_items').select('id').limit(1);
  const contentId = process.env.E2E_CONTENT_ID || items?.[0]?.id;
  if (!contentId) {
    process.stderr.write('3. content_items 없음\n');
    process.exit(1);
  }

  const { data: beforeLedger } = await admin
    .from('ledger_entries')
    .select('entry_type, amount, quantity, asset_id')
    .eq('user_id', userId);
  let cashBefore = 0;
  let assetQtyBefore = 0;
  for (const r of beforeLedger ?? []) {
    const amt = Number(r.amount) || 0;
    const qty = Number(r.quantity) || 0;
    const aid = String(r.asset_id ?? '');
    if (r.entry_type === 'CASH_CREDIT') cashBefore += amt;
    if (r.entry_type === 'CASH_DEBIT') cashBefore -= Math.abs(amt);
    if (r.entry_type === 'ASSET_CREDIT' && aid === contentId) assetQtyBefore += qty;
    if (r.entry_type === 'ASSET_DEBIT' && aid === contentId) assetQtyBefore -= qty;
  }

  const placeRes = await fetch(`${WATCH_BASE_URL}/api/orders/place`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ content_id: contentId, amount: 50000, price_krw: 13500 }),
  });
  const placeJson = await placeRes.json();

  if (!placeRes.ok || !placeJson.ok) {
    process.stderr.write(`4. 매수 API 실패: ${placeJson.debug ?? placeJson.error ?? JSON.stringify(placeJson)}\n`);
    process.exit(1);
  }

  const { data: afterLedger } = await admin
    .from('ledger_entries')
    .select('entry_type, amount, quantity, asset_id')
    .eq('user_id', userId);
  let cashAfter = 0;
  let assetQtyAfter = 0;
  for (const r of afterLedger ?? []) {
    const amt = Number(r.amount) || 0;
    const qty = Number(r.quantity) || 0;
    const aid = String(r.asset_id ?? '');
    if (r.entry_type === 'CASH_CREDIT') cashAfter += amt;
    if (r.entry_type === 'CASH_DEBIT') cashAfter -= Math.abs(amt);
    if (r.entry_type === 'ASSET_CREDIT' && aid === contentId) assetQtyAfter += qty;
    if (r.entry_type === 'ASSET_DEBIT' && aid === contentId) assetQtyAfter -= qty;
  }

  process.stdout.write('\n--- 데모 거래 스모크 로그 ---\n');
  process.stdout.write(`order_id: ${placeJson.order_id}\n`);
  process.stdout.write(`cashBefore: ${cashBefore} → cashAfter: ${cashAfter}\n`);
  process.stdout.write(`assetQtyBefore: ${assetQtyBefore} → assetQtyAfter: ${assetQtyAfter}\n`);
  process.stdout.write('TRADE_DEMO_OK\n');
}

run().catch((e) => {
  process.stderr.write(String(e) + '\n');
  process.exit(1);
});
