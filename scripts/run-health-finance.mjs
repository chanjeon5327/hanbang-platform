#!/usr/bin/env node
/**
 * 금융 헬스 체크 스크립트
 * - 최근 10분 LOCK_BUSY 비율 (메트릭 있으면)
 * - 최근 10분 audit 액션별 카운트
 * - ledger 밸런스 검사 (전체/특정 content_id)
 * - 불변식 위반 주문 존재 여부
 * 실패 시 exit(1) + 원인 요약
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

const admin = createClient(url, key);
const WINDOW_MIN = 10;
const since = new Date(Date.now() - WINDOW_MIN * 60 * 1000).toISOString();

const failures = [];

async function checkLockBusyRatio() {
  // LOCK_BUSY는 DB에 직접 기록되지 않음. finance_health_metrics 테이블 있으면 사용
  try {
    const { data, error } = await admin
      .from('finance_health_metrics')
      .select('lock_busy_count, total_requests')
      .gte('created_at', since)
      .limit(1)
      .maybeSingle();
    if (error || !data) {
      console.log('[LOCK_BUSY] SKIP (메트릭 없음, 앱에서 finance_health_metrics 추가 시 활성화)');
      return;
    }
    const total = Number(data.total_requests ?? 0);
    const lockBusy = Number(data.lock_busy_count ?? 0);
    const ratio = total > 0 ? lockBusy / total : 0;
    console.log(`[LOCK_BUSY] ratio=${(ratio * 100).toFixed(2)}% (${lockBusy}/${total})`);
    if (ratio > 0.5) {
      failures.push(`LOCK_BUSY 비율 과다: ${(ratio * 100).toFixed(1)}%`);
    }
  } catch {
    console.log('[LOCK_BUSY] SKIP (finance_health_metrics 테이블 없음)');
  }
}

async function checkAuditCounts() {
  const { data } = await admin
    .from('financial_audit_logs')
    .select('action')
    .gte('created_at', since);
  const counts = { ORDERBOOK_WRITE: 0, LEDGER_WRITE: 0, MATCH_ORDER: 0 };
  (data ?? []).forEach((r) => {
    if (r.action in counts) counts[r.action]++;
  });
  console.log('[AUDIT]', counts);
  // 정상: 거래 없을 때는 0 가능. 거래 있을 때 audit 누락만 문제
  // 여기서는 "최근 10분에 audit이 전혀 없으면" 경고만 (실패 아님)
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) {
    console.log('[AUDIT] 최근 10분 audit 0건 (거래 없음이면 정상)');
  }
}

async function checkLedgerBalance(contentId = null) {
  const { data } = await admin.from('ledger_entries').select('entry_type, amount, quantity, asset_id');
  let cashBal = 0;
  const assetMap = new Map();
  (data ?? []).forEach((r) => {
    if (r.entry_type === 'CASH_CREDIT') cashBal += Number(r.amount ?? 0);
    if (r.entry_type === 'CASH_DEBIT') cashBal -= Math.abs(Number(r.amount ?? 0));
    if ((r.entry_type === 'ASSET_CREDIT' || r.entry_type === 'ASSET_DEBIT') && r.asset_id) {
      const aid = r.asset_id;
      const q = Number(r.quantity ?? 0);
      assetMap.set(aid, (assetMap.get(aid) ?? 0) + (r.entry_type === 'ASSET_CREDIT' ? q : -q));
    }
  });
  console.log('[LEDGER] cash_net=', cashBal);
  for (const [aid, net] of assetMap) {
    if (net !== 0) console.log(`[LEDGER] asset ${aid} net=`, net);
  }
  // 정상: asset net >= 0 (총 발행량, 음수면 불가)
  for (const [aid, net] of assetMap) {
    if (net < -0.0001) {
      failures.push(`Ledger asset 음수: asset_id=${aid} net=${net}`);
    }
  }
}

async function checkOrderInvariants() {
  const { data } = await admin
    .from('orderbook_orders')
    .select('id, content_id, side, quantity, filled_quantity, remaining_quantity, status');
  const bad = (data ?? []).filter((r) => {
    const qty = Number(r.quantity ?? 0);
    const filled = Number(r.filled_quantity ?? 0);
    const remain = Number(r.remaining_quantity ?? qty - filled);
    return remain < 0 || filled > qty || Math.abs(remain + filled - qty) > 0.001;
  });
  if (bad.length > 0) {
    failures.push(`불변식 위반 주문 ${bad.length}건: remaining<0 또는 filled>quantity`);
    bad.slice(0, 5).forEach((r) => console.error('  ', r.id, r.content_id, r.side, r.quantity, r.filled_quantity, r.remaining_quantity));
  } else {
    console.log('[ORDERS] 불변식 OK');
  }
}

async function checkAuditPresence() {
  const { count } = await admin
    .from('financial_audit_logs')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', since);
  if (count === 0) {
    // 거래가 없을 수 있음. 최근 1시간 전체 거래 확인
    const { count: tradeCount } = await admin
      .from('trades')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());
    const { count: orderCount } = await admin
      .from('orderbook_orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());
    if ((tradeCount > 0 || orderCount > 0) && count === 0) {
      failures.push('거래/주문 있으나 최근 10분 audit 0건 (audit 누락 의심)');
    }
  }
}

async function main() {
  console.log('=== Finance Health Check ===');
  console.log('window:', WINDOW_MIN, 'min');

  await checkLockBusyRatio();
  await checkAuditCounts();
  await checkLedgerBalance(process.env.HEALTH_CONTENT_ID || null);
  await checkOrderInvariants();
  await checkAuditPresence();

  if (failures.length > 0) {
    console.error('\n--- FAIL ---');
    failures.forEach((f) => console.error(' ', f));
    process.exit(1);
  }
  console.log('\n--- OK ---');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
