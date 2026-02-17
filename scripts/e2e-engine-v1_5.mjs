/**
 * ============================================================================
 * HANBANG Financial Engine V1.5 — E2E 시뮬레이션 테스트
 * ============================================================================
 *
 * 실행: node scripts/e2e-engine-v1_5.mjs
 *
 * 테스트 시나리오:
 * 1) revenue_events 생성 (가짜 수익 이벤트)
 * 2) distribute 실행 (보유자에게 분배)
 * 3) ledger integrity 검증 (해시 체인 무결성)
 * 4) global snapshot 생성 및 검증
 * 5) dashboard 3종 API smoke test (pnl, risk, dividends)
 *
 * 전제 조건:
 * - NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 환경변수 필요
 * - 데이터베이스에 마이그레이션이 적용된 상태
 * - (선택) 테스트 사용자 및 포지션 데이터 존재
 *
 * ============================================================================
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  process.stderr.write(
    '[ERROR] NEXT_PUBLIC_SUPABASE_URL 및 SUPABASE_SERVICE_ROLE_KEY 환경변수가 필요합니다.\n',
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

let passed = 0;
let failed = 0;

function ok(name, condition, detail) {
  if (condition) {
    process.stdout.write(`  ✓ ${name}\n`);
    passed++;
  } else {
    process.stderr.write(`  ✗ ${name} — ${detail ?? 'FAILED'}\n`);
    failed++;
  }
}

async function main() {
  process.stdout.write('\n═══ HANBANG Financial Engine V1.5 E2E Test ═══\n\n');

  /* ──────────────────────────────────────────
   * 1. 원장 무결성 검증
   * ────────────────────────────────────────── */
  process.stdout.write('[1/5] 원장 무결성 검증 (rpc_verify_ledger_integrity)\n');
  try {
    const { data: integrity, error } = await supabase.rpc('rpc_verify_ledger_integrity');
    ok('RPC 호출 성공', !error, error?.message);
    if (integrity) {
      ok('integrity_ok', integrity.integrity_ok === true, `mismatches=${integrity.mismatches}`);
      ok('chain_breaks=0', integrity.chain_breaks === 0, `chain_breaks=${integrity.chain_breaks}`);
      ok(`총 엔트리: ${integrity.total_entries}`, integrity.total_entries >= 0);
    }
  } catch (e) {
    ok('원장 무결성 RPC', false, e.message);
  }

  /* ──────────────────────────────────────────
   * 2. 글로벌 스냅샷 생성 + 검증
   * ────────────────────────────────────────── */
  process.stdout.write('\n[2/5] 글로벌 스냅샷 생성 + 검증\n');
  let snapId = null;
  try {
    const { data: snap, error: snapErr } = await supabase.rpc('rpc_create_global_ledger_snapshot', {
      p_snap_date: new Date().toISOString().split('T')[0],
    });
    ok('스냅샷 생성 RPC', !snapErr && snap?.ok, snapErr?.message ?? snap?.error);
    if (snap?.ok) {
      snapId = snap.id;
      ok(`스냅샷 해시: ${snap.snapshot_hash?.slice(0, 16)}...`, !!snap.snapshot_hash);
      ok(`사용자 수: ${snap.user_count}`, snap.user_count >= 0);
      ok(`엔트리 수: ${snap.entry_count}`, snap.entry_count >= 0);
    }
  } catch (e) {
    ok('글로벌 스냅샷 생성', false, e.message);
  }

  if (snapId) {
    try {
      const { data: verify, error: vErr } = await supabase.rpc('rpc_verify_global_snapshot', {
        p_id: snapId,
      });
      ok('스냅샷 검증 RPC', !vErr && verify?.ok, vErr?.message);
      if (verify?.ok) {
        ok('해시 일치', verify.hash_match === true, `stored=${verify.stored_hash?.slice(0, 16)} vs recomputed=${verify.recomputed_hash?.slice(0, 16)}`);
        ok('엔트리 수 일치', verify.entry_count_match === true);
      }
    } catch (e) {
      ok('스냅샷 검증', false, e.message);
    }
  }

  /* ──────────────────────────────────────────
   * 3. 수익 이벤트 생성 + 분배
   * ────────────────────────────────────────── */
  process.stdout.write('\n[3/5] 수익 이벤트 생성 + 분배 테스트\n');

  // 테스트할 content_id 찾기 (보유자가 있는 콘텐츠)
  let testContentId = null;
  try {
    const { data: pos } = await supabase
      .from('positions')
      .select('asset_id')
      .gt('quantity', 0)
      .limit(1);

    if (pos && pos.length > 0) {
      testContentId = pos[0].asset_id;
      ok(`테스트 콘텐츠: ${testContentId.slice(0, 8)}...`, true);
    } else {
      ok('보유자가 있는 콘텐츠', false, '포지션 데이터 없음 — 분배 테스트 스킵');
    }
  } catch (e) {
    ok('포지션 조회', false, e.message);
  }

  if (testContentId) {
    let eventId = null;
    try {
      const { data: event, error: evErr } = await supabase
        .from('revenue_events')
        .insert({
          content_id: testContentId,
          gross_amount: 100000,
          net_amount: 90000,
          status: 'PENDING',
        })
        .select('id')
        .single();

      ok('수익 이벤트 생성', !evErr && !!event?.id, evErr?.message);
      eventId = event?.id;
    } catch (e) {
      ok('수익 이벤트 생성', false, e.message);
    }

    if (eventId) {
      try {
        const { data: dist, error: distErr } = await supabase.rpc('rpc_distribute_revenue', {
          p_event_id: eventId,
        });
        ok('분배 RPC 호출', !distErr, distErr?.message);
        if (dist) {
          ok('분배 성공', dist.ok === true, dist.error);
          ok(`분배 금액: ${dist.total_distributed}`, (dist.total_distributed ?? 0) > 0);
          ok(`보유자 수: ${dist.holder_count}`, (dist.holder_count ?? 0) > 0);
        }

        // 이중 분배 방지 확인
        const { data: dist2 } = await supabase.rpc('rpc_distribute_revenue', {
          p_event_id: eventId,
        });
        ok('이중 분배 방지', dist2?.ok === false && dist2?.error === 'EVENT_ALREADY_PROCESSED');
      } catch (e) {
        ok('분배 실행', false, e.message);
      }
    }
  }

  /* ──────────────────────────────────────────
   * 4. 일별 스냅샷 배치 생성
   * ────────────────────────────────────────── */
  process.stdout.write('\n[4/5] 일별 스냅샷 배치 생성\n');
  try {
    const { data: snapBatch, error: snapBatchErr } = await supabase.rpc('rpc_create_daily_snapshots');
    ok('일별 스냅샷 RPC', !snapBatchErr, snapBatchErr?.message);
    if (snapBatch) {
      ok('스냅샷 ok', snapBatch.ok === true);
      ok(`처리 사용자: ${snapBatch.users_processed}`, (snapBatch.users_processed ?? 0) >= 0);
    }
  } catch (e) {
    ok('일별 스냅샷', false, e.message);
  }

  /* ──────────────────────────────────────────
   * 5. Dashboard API Smoke Test (직접 호출 불가 → 테이블 확인)
   * ────────────────────────────────────────── */
  process.stdout.write('\n[5/5] 데이터 테이블 존재 확인 (API smoke proxy)\n');

  const tables = ['positions', 'portfolio_daily_snapshot', 'revenue_events', 'revenue_distributions', 'global_ledger_snapshots'];
  for (const table of tables) {
    try {
      const { count, error } = await supabase.from(table).select('id', { count: 'exact', head: true });
      ok(`${table} 테이블 접근 가능 (${count ?? 0}건)`, !error, error?.message);
    } catch (e) {
      ok(`${table} 테이블`, false, e.message);
    }
  }

  /* ──────────────────────────────────────────
   * 결과 요약
   * ────────────────────────────────────────── */
  process.stdout.write(`\n═══ 결과: ${passed} passed, ${failed} failed ═══\n\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  process.stderr.write(`[FATAL] ${e.message}\n`);
  process.exit(1);
});
