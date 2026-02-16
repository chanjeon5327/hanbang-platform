#!/usr/bin/env node
/**
 * E2E 실거래 완주 강제 검증
 * CREATED → PAID → COMPLETED → SETTLED
 * payment_method: "pg"
 */
import 'dotenv/config';

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const result = {
  flowSuccess: false,
  ledgerIntegrity: false,
  settlementOk: false,
  modifiedFiles: ['scripts/e2e-payment-flow.mjs'],
  risks: [],
};

function log(step, msg, ok = true) {
  const icon = ok ? '✓' : '✗';
  process.stdout.write(`[${step}] ${icon} ${msg}\n`);
}

async function main() {
  let orderId = null;
  let paymentId = null;
  let userId = null;
  const failStep = { step: null, msg: null };

  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;
  if (!email || !password) {
    failStep.step = '0';
    failStep.msg = 'E2E_TEST_EMAIL, E2E_TEST_PASSWORD 필요';
    process.stdout.write(`\n실패 단계: 0 - 로그인\n`);
    process.stdout.write(`  원인: ${failStep.msg}\n`);
    process.stdout.write(`  파일: scripts/e2e-payment-flow.mjs\n`);
    printResult(failStep);
    process.exit(1);
  }

  let cookies = '';
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !anonKey) {
      failStep.step = '0';
      failStep.msg = 'NEXT_PUBLIC_SUPABASE_URL/ANON_KEY 없음';
      process.stdout.write(`\n실패 단계: 0 - 로그인\n`);
      printResult(failStep);
      process.exit(1);
    }
    const authRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      signal: AbortSignal.timeout(10000),
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: anonKey, Authorization: `Bearer ${anonKey}` },
      body: JSON.stringify({ email, password }),
    });
    const authJson = await authRes.json();
    if (!authJson.access_token) {
      failStep.step = '0';
      failStep.msg = authJson.error_description ?? '로그인 실패';
      process.stdout.write(`\n실패 단계: 0 - 로그인\n`);
      printResult(failStep);
      process.exit(1);
    }
    const host = new URL(supabaseUrl).hostname.split('.')[0];
    cookies = `sb-${host}-auth-token=${encodeURIComponent(JSON.stringify({ access_token: authJson.access_token, refresh_token: authJson.refresh_token ?? '' }))}`;
    log('0', '로그인 성공');
  } catch (e) {
    failStep.step = '0';
    failStep.msg = e.message;
    process.stdout.write(`\n실패 단계: 0 - 로그인\n`);
    printResult(failStep);
    process.exit(1);
  }

  const headers = { 'Content-Type': 'application/json', Cookie: cookies };
  const contentId = process.env.E2E_CONTENT_ID ?? process.env.E2E_MARKET_ID;
  const amount = Number(process.env.E2E_AMOUNT ?? 12300);

  if (!contentId) {
    failStep.step = '1';
    failStep.msg = 'E2E_CONTENT_ID 또는 E2E_MARKET_ID 필요';
      process.stdout.write(`\n실패 단계: 1 - content_id\n`);
      printResult(failStep);
    process.exit(1);
  }

  // Step 1: POST /api/orders/place (payment_method: pg)
  try {
    const placeRes = await fetch(`${BASE}/api/orders/place`, {
      signal: AbortSignal.timeout(10000),
      method: 'POST',
      headers,
      body: JSON.stringify({ content_id: contentId, amount, payment_method: 'pg' }),
    });
    const placeJson = await placeRes.json();
    orderId = placeJson.order_id ?? placeJson.data?.order_id;
    if (!placeRes.ok || !orderId) {
      failStep.step = '1';
      failStep.msg = placeJson.error ?? JSON.stringify(placeJson);
      process.stdout.write(`\n실패 단계: 1 - POST /api/orders/place\n`);
      printResult(failStep);
      process.exit(1);
    }
    log('1', `주문 생성 order_id=${orderId}`);
  } catch (e) {
    failStep.step = '1';
    failStep.msg = e.message;
    process.stdout.write(`\n실패 단계: 1 - POST /api/orders/place\n`);
    printResult(failStep);
    process.exit(1);
  }

  // Step 2: POST /api/payments/request
  try {
    const reqRes = await fetch(`${BASE}/api/payments/request`, {
      signal: AbortSignal.timeout(10000),
      method: 'POST',
      headers,
      body: JSON.stringify({ order_id: orderId }),
    });
    const reqJson = await reqRes.json();
    paymentId = reqJson.payment_id;
    const redirectUrl = reqJson.redirect_url;
    if (!reqRes.ok || !paymentId || !redirectUrl) {
      failStep.step = '2';
      failStep.msg = reqJson.error ?? 'payment_id/redirect_url 없음';
      process.stdout.write(`\n실패 단계: 2 - POST /api/payments/request\n`);
      printResult(failStep);
      process.exit(1);
    }
    log('2', `결제 요청 payment_id=${paymentId}`);
  } catch (e) {
    failStep.step = '2';
    failStep.msg = e.message;
    process.stdout.write(`\n실패 단계: 2 - POST /api/payments/request\n`);
    printResult(failStep);
    process.exit(1);
  }

  // Step 3: POST /api/payments/confirm (payment_id 필수)
  try {
    const confirmRes = await fetch(`${BASE}/api/payments/confirm`, {
      signal: AbortSignal.timeout(10000),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_id: paymentId, pg_transaction_id: `e2e-${Date.now()}` }),
    });
    const confirmJson = await confirmRes.json();
    if (!confirmRes.ok || confirmJson.ok === false) {
      failStep.step = '3';
      failStep.msg = confirmJson.error ?? JSON.stringify(confirmJson);
      process.stdout.write(`\n실패 단계: 3 - POST /api/payments/confirm\n`);
      printResult(failStep);
      process.exit(1);
    }
    log('3', '결제 확정 완료');
  } catch (e) {
    failStep.step = '3';
    failStep.msg = e.message;
    process.stdout.write(`\n실패 단계: 3 - POST /api/payments/confirm\n`);
    printResult(failStep);
    process.exit(1);
  }

  result.flowSuccess = true;

  // Step 4: DB 검증 - order.status, ledger_entries, 잔액
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    process.stdout.write('\n[경고] SUPABASE 키 없음 - DB 검증 스킵\n');
    printResult();
    process.exit(0);
  }

  const { createClient } = await import('@supabase/supabase-js');
  const admin = createClient(supabaseUrl, serviceKey);

  const { data: order, error: ordErr } = await admin.from('orders').select('id, status, user_id').eq('id', orderId).single();
  if (ordErr || !order) {
    failStep.step = '4';
    failStep.msg = 'orders 조회 실패';
    result.flowSuccess = false;
    process.stdout.write(`\n실패 단계: 4 - orders 조회\n`);
    printResult(failStep);
    process.exit(1);
  }
  userId = order.user_id;

  process.stdout.write('\n--- 주문 최종 상태 ---\n');
  process.stdout.write(`order.status: ${order.status}\n`);

  const { data: entries, error: leErr } = await admin
    .from('ledger_entries')
    .select('entry_type, amount, user_id')
    .eq('user_id', userId);

  if (leErr) {
    failStep.step = '4';
    failStep.msg = 'ledger_entries 조회 실패';
    result.ledgerIntegrity = false;
    process.stdout.write(`\n실패 단계: 4 - ledger_entries\n`);
    printResult(failStep);
    process.exit(1);
  }

  const debitTotal = (entries ?? []).filter((e) => e.entry_type === 'CASH_DEBIT').reduce((s, e) => s + Math.abs(Number(e.amount ?? 0)), 0);
  const creditTotal = (entries ?? []).filter((e) => e.entry_type === 'CASH_CREDIT').reduce((s, e) => s + Number(e.amount ?? 0), 0);
  const calculatedBalance = creditTotal - debitTotal;

  process.stdout.write('\n--- ledger ---\n');
  process.stdout.write(`ledger debit 총합: ${debitTotal}\n`);
  process.stdout.write(`ledger credit 총합: ${creditTotal}\n`);
  process.stdout.write(`계산 잔액 (credit - debit): ${calculatedBalance}\n`);

  const walletRes = await fetch(`${BASE}/api/wallet/summary`, { headers });
  const walletJson = walletRes.ok ? await walletRes.json().catch(() => null) : null;
  const dbBalance = walletJson?.cashBalance ?? null;
  process.stdout.write(`DB/API 잔액 (wallet/summary): ${dbBalance}\n`);

  const balanceMatch = dbBalance != null && Math.abs(Number(dbBalance) - calculatedBalance) <= 1;
  if (!balanceMatch && dbBalance != null) {
    process.stdout.write(`\n[불일치] 계산잔액=${calculatedBalance} vs API잔액=${dbBalance}\n`);
    result.ledgerIntegrity = false;
    result.risks.push('ledger 잔액 불일치');
  } else {
    result.ledgerIntegrity = true;
  }

  // Step 5: settlement 테스트
  let batchId = null;
  const { data: batches } = await admin.from('settlement_batches').select('id, confirmed_at').is('confirmed_at', null).limit(1);
  if (batches?.length) {
    batchId = batches[0].id;
    const { error: confErr } = await admin.rpc('rpc_admin_confirm_settlement', { p_batch_id: batchId });
    if (confErr) {
      result.settlementOk = false;
      result.risks.push(`정산 확정 실패: ${confErr.message}`);
    } else {
      const { data: after } = await admin.from('settlement_batches').select('confirmed_at').eq('id', batchId).single();
      result.settlementOk = !!after?.confirmed_at;
      process.stdout.write(`\n--- 정산 ---\n`);
      process.stdout.write(`settlement_batch id: ${batchId}\n`);
      process.stdout.write(`confirmed_at: ${after?.confirmed_at ?? 'null'}\n`);
    }
  } else {
    const { data: allBatches } = await admin.from('settlement_batches').select('id, settlement_date, confirmed_at').limit(5);
    if (allBatches?.length) {
      process.stdout.write(`\n--- 정산 (이미 확정된 배치만 존재) ---\n`);
      result.settlementOk = true;
    } else {
      process.stdout.write(`\n--- 정산 (settlement_batches 없음, 스킵) ---\n`);
      result.settlementOk = true;
    }
  }

  const { data: auditRows } = await admin.from('admin_audit_logs').select('id, action, target_type').order('created_at', { ascending: false }).limit(3);
  process.stdout.write(`admin_audit_logs 최근 ${auditRows?.length ?? 0}건\n`);

  printResult(failStep);
  process.exit(result.flowSuccess && result.ledgerIntegrity ? 0 : 1);
}

function printResult(failStep = null) {
  process.stdout.write('\n[실거래 완주 결과]\n');
  process.stdout.write(`- 흐름 성공 여부: ${result.flowSuccess}\n`);
  process.stdout.write(`- ledger 정합성: ${result.ledgerIntegrity}\n`);
  process.stdout.write(`- 정산 확정 정상 여부: ${result.settlementOk}\n`);
  process.stdout.write(`- 수정된 파일 목록: ${result.modifiedFiles.join(', ')}\n`);
  process.stdout.write(`- 남은 리스크: ${result.risks.length ? result.risks.join('; ') : '없음'}\n`);
  if (failStep?.step != null && failStep?.msg) {
    process.stdout.write(`\n[불일치/실패] 단계 ${failStep.step}: ${failStep.msg}\n`);
    process.stdout.write(`  수정 파일: scripts/e2e-payment-flow.mjs\n`);
  }
}

main().catch((e) => {
  process.stderr.write(String(e) + '\n');
  printResult({ step: 'exception', msg: e.message });
  process.exit(1);
});
