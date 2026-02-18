/**
 * ============================================================================
 * POST /api/admin/settlement/finalize — 정산 배치 동결 확정 API
 * ============================================================================
 *
 * [금융감독원 전자금융업 감독규정 준수 사항]
 * 1. 정산 확정 시 원장 상태를 해시로 봉인 (tamper-proof snapshot)
 * 2. 확정된 정산 배치의 원장 해시로 사후 정합성 검증 가능
 * 3. 확정 관리자 ID 및 시각 기록 (감사 추적)
 * 4. 이중 확정 방지 (already finalized 체크)
 * 5. Advisory Lock으로 동시 확정 방지
 *
 * 동결 해시 생성 방식:
 *   rpc_finalize_settlement가 모든 사용자의 마지막 row_hash를 수집하여
 *   정렬 → 연결 → SHA-256 해시를 생성하고 settlement_batches에 저장합니다.
 *
 * 요청 형식:
 *   POST body: { batch_id: string }
 *
 * 응답 형식:
 *   { ok, batch_id, ledger_snapshot_hash, entry_count, finalized_at }
 *
 * ============================================================================
 */

import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";

import type {
  SettlementFinalizeRequest,
  SettlementFinalizeResponse,
} from "@/lib/types/financial";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    /* ──────────────────────────────────────────
     * 1단계: 관리자 권한 검증
     * ────────────────────────────────────────── */
    const admin = await requireAdmin();

    /* ──────────────────────────────────────────
     * 2단계: 요청 본문 파싱
     * ────────────────────────────────────────── */
    let body: SettlementFinalizeRequest;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: "INVALID_JSON" },
        { status: 400 },
      );
    }

    if (!body.batch_id || typeof body.batch_id !== "string") {
      return NextResponse.json(
        { ok: false, error: "INVALID_PAYLOAD", debug: "batch_id가 필요합니다." },
        { status: 400 },
      );
    }

    /* ──────────────────────────────────────────
     * 3단계: 정산 동결 RPC 호출
     * rpc_finalize_settlement:
     *   - Advisory Lock 획득
     *   - 배치 존재 및 상태 확인
     *   - 원장 스냅샷 해시 생성 (모든 사용자의 마지막 row_hash 결합)
     *   - settlement_batches 갱신
     *   - 정산 대상 주문 settled_at 기록
     * ────────────────────────────────────────── */
    const supabaseAdmin = createAdminClient();

    const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc(
      "rpc_finalize_settlement",
      {
        p_batch_id: body.batch_id,
        p_admin_id: admin.id,
      },
    );

    if (rpcError) {
      return NextResponse.json(
        { ok: false, error: "FINALIZE_FAILED", debug: rpcError.message },
        { status: 500 },
      );
    }

    const result = rpcResult as {
      ok: boolean;
      error?: string;
      batch_id?: string;
      ledger_snapshot_hash?: string;
      entry_count?: number;
      finalized_at?: string;
    };

    if (!result.ok) {
      const statusMap: Record<string, number> = {
        BATCH_NOT_FOUND: 404,
        ALREADY_FINALIZED: 409,
      };
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: statusMap[result.error ?? ""] ?? 500 },
      );
    }

    /* ──────────────────────────────────────────
     * 4단계: 감사 로그 기록
     * ────────────────────────────────────────── */
    try {
      await supabaseAdmin.rpc("rpc_write_financial_audit", {
        p_user_id: admin.id,
        p_action: "SETTLEMENT_FINALIZE",
        p_target_type: "settlement",
        p_target_id: body.batch_id,
        p_metadata: {
          ledger_snapshot_hash: result.ledger_snapshot_hash,
          entry_count: result.entry_count,
        },
      });
    } catch {
      /* 감사 로그 실패: 정산 확정에 영향 없음 */
    }

    /* ──────────────────────────────────────────
     * 5단계: 성공 응답
     * ────────────────────────────────────────── */
    const response: SettlementFinalizeResponse = {
      ok: true,
      batch_id: body.batch_id,
      ledger_snapshot_hash: result.ledger_snapshot_hash ?? "",
      entry_count: result.entry_count ?? 0,
      finalized_at: result.finalized_at ?? new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "알 수 없는 오류";
    return NextResponse.json(
      { ok: false, error: msg },
      { status: 500 },
    );
  }
}
