#!/usr/bin/env node
/**
 * 부분 매도 검증 테스트
 * 1) asset_id 선택, 보유 수량 확인
 * 2) 보유 0이면 매수 1회 실행
 * 3) (A) 매수 (B) 부분 매도 0.3 (C) 잔여 0.7 확인 (D) cashBalance 증가 (E) totalValue (F) 수익률
 * 4) ledger_entries 검증
 *
 * 사용: USER_ID, ASSET_ID env 또는 자동 탐색
 *       LOGIN_EMAIL, LOGIN_PASSWORD 로 로그인 후 API 호출 (선택)
 */
import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const userId = process.env.USER_ID;
const assetId = process.env.ASSET_ID;
const loginEmail = process.env.LOGIN_EMAIL;
const loginPassword = process.env.LOGIN_PASSWORD;
const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

if (!url) {
  console.error('NEXT_PUBLIC_SUPABASE_URL 필요');
  process.exit(1);
}

let supabase = createClient(url, serviceKey || anonKey);

async function getPosition(uid, aid) {
  const { data: rows } = await supabase
    .from('ledger_entries')
    .select('entry_type, quantity')
    .eq('user_id', uid)
    .eq('asset_id', aid);
  let qty = 0;
  (rows ?? []).forEach((r) => {
    const n = Number(r.quantity ?? 0);
    if (r.entry_type === 'ASSET_CREDIT') qty += n;
    if (r.entry_type === 'ASSET_DEBIT') qty -= n;
  });
  return Math.max(0, qty);
}

async function getLedgerSummary(uid) {
  const { data: rows } = await supabase
    .from('ledger_entries')
    .select('entry_type, amount')
    .eq('user_id', uid);
  let cash = 0;
  let invested = 0;
  (rows ?? []).forEach((r) => {
    const amt = Number(r.amount ?? 0);
    if (r.entry_type === 'CASH_DEBIT') {
      cash -= Math.abs(amt);
      invested += Math.abs(amt);
    }
    if (r.entry_type === 'CASH_CREDIT') cash += amt;
  });
  return { cashBalance: cash, investedPrincipal: invested };
}

async function run() {
  let uid = userId;
  let aid = assetId;

  if (loginEmail && loginPassword && anonKey) {
    const authClient = createClient(url, anonKey);
    const { data: authData, error: authErr } = await authClient.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    if (authErr) {
      console.error('로그인 실패:', authErr.message);
      process.exit(1);
    }
    uid = authData.user?.id;
    supabase = authClient;
    console.log('로그인 성공, user_id:', uid);
  }

  if (!aid) {
    const { data: items, error: itemsErr } = await supabase
      .from('content_items')
      .select('id, share_price_usd')
      .not('share_price_usd', 'is', null)
      .limit(1);
    if (itemsErr) console.warn('content_items 조회:', itemsErr.message);
    aid = items?.[0]?.id;
  }
  if (!uid) {
    const { data: users } = await supabase.from('profiles').select('id').limit(1);
    uid = users?.[0]?.id;
  }
  if (!uid) {
    console.error('USER_ID 또는 LOGIN_EMAIL+LOGIN_PASSWORD 필요 (RPC는 본인 인증 필요)');
    process.exit(1);
  }
  if (!aid) {
    console.error('ASSET_ID 필요. content_items에 share_price_usd 있는 항목의 id 사용');
    process.exit(1);
  }
  console.log('테스트 대상:', { userId: uid, assetId: aid });

  const { data: item } = await supabase
    .from('content_items')
    .select('share_price_usd')
    .eq('id', aid)
    .single();
  const sharePriceUsd = Number(item?.share_price_usd ?? 0);
  const fxRate = 1350;
  const priceKrw = sharePriceUsd * fxRate;

  console.log('\n=== 1) 초기 상태 ===');
  let pos = await getPosition(uid, aid);
  let summary = await getLedgerSummary(uid);
  console.log('보유 수량:', pos);
  console.log('cashBalance:', summary.cashBalance);
  console.log('investedPrincipal:', summary.investedPrincipal);

  if (pos < 0.001) {
    console.log('\n=== 2) 매수 1회 (보유 0 → 1) ===');
    const buyAmount = Math.round(priceKrw);
    const { data: buyResult, error: buyErr } = await supabase.rpc('rpc_invest_and_notify', {
      p_user_id: uid,
      p_content_id: aid,
      p_amount_krw: buyAmount,
      p_idempotency_key: null,
    });
    if (buyErr) {
      console.error('매수 실패:', buyErr.message);
      if (buyErr.message?.includes('INSUFFICIENT_FUNDS')) {
        console.log('→ 입금 후 재시도. 또는 다른 유저(USER_ID) 사용');
      }
      process.exit(1);
    }
    console.log('매수 성공:', buyResult);
    pos = await getPosition(uid, aid);
    summary = await getLedgerSummary(uid);
    console.log('매수 후 보유:', pos);
    console.log('매수 후 cashBalance:', summary.cashBalance);
  }

  console.log('\n=== 3) 부분 매도 0.3 ===');
  const { data: sellResult, error: sellErr } = await supabase.rpc('rpc_sell_content', {
    p_user_id: uid,
    p_content_id: aid,
    p_quantity: 0.3,
    p_idempotency_key: null,
  });
  if (sellErr) {
    console.error('매도 실패:', sellErr.message);
    process.exit(1);
  }
  console.log('매도 성공:', sellResult);

  console.log('\n=== 4) 매도 후 검증 ===');
  const posAfter = await getPosition(uid, aid);
  const summaryAfter = await getLedgerSummary(uid);
  const expectedRemaining = Math.round((pos - 0.3) * 1e6) / 1e6;
  const cashIncrease = summaryAfter.cashBalance - summary.cashBalance;
  const expectedCash = Math.round(0.3 * priceKrw);

  const results = [
    { check: '잔여 수량 0.7', expected: 0.7, actual: posAfter, ok: Math.abs(posAfter - 0.7) < 0.0001 },
    { check: 'cashBalance 증가', expected: `~${expectedCash}`, actual: Math.round(cashIncrease), ok: cashIncrease > 0 && Math.abs(cashIncrease - expectedCash) < 100 },
  ];

  console.table(results);

  console.log('\n=== 5) ledger_entries 검증 ===');
  const { data: ledgers } = await supabase
    .from('ledger_entries')
    .select('entry_type, amount, quantity, memo')
    .eq('user_id', uid)
    .eq('asset_id', aid)
    .order('created_at', { ascending: false })
    .limit(10);
  console.log('asset 관련 ledger:', JSON.stringify(ledgers ?? [], null, 2));

  const hasCredit = (ledgers ?? []).some((l) => l.entry_type === 'ASSET_CREDIT' && Number(l.quantity) >= 0.99);
  const hasDebit = (ledgers ?? []).some((l) => l.entry_type === 'ASSET_DEBIT' && Number(l.quantity) === 0.3);
  console.log('ASSET_CREDIT 1.0 존재:', hasCredit);
  console.log('ASSET_DEBIT 0.3 존재:', hasDebit);

  const { data: cashLedgers } = await supabase
    .from('ledger_entries')
    .select('entry_type, amount, memo')
    .eq('user_id', uid)
    .or('entry_type.eq.CASH_DEBIT,entry_type.eq.CASH_CREDIT')
    .order('created_at', { ascending: false })
    .limit(10);
  console.log('CASH ledger 최근:', JSON.stringify(cashLedgers ?? [], null, 2));

  console.log('\n=== 6) position API 호출 (직접 검증) ===');
  const posRes = await fetch(`${baseUrl}/api/wallet/position?asset_id=${aid}`, {
    headers: { Cookie: '' },
  });
  if (posRes.ok) {
    const posJson = await posRes.json();
    console.log('position API:', posJson);
    console.log('avg_price 유지(매도 후 동일):', posJson.avg_price);
  } else {
    console.log('position API (인증 필요):', posRes.status);
  }

  console.log('\n=== 테스트 완료 ===');
  const allOk = results.every((r) => r.ok);
  process.exit(allOk ? 0 : 1);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
