/**
 * ============================================================================
 * POST /api/orders/place — 안전 주문 실행 (Financial Engine V1)
 * ============================================================================
 *
 * [금융감독원 전자금융업 감독규정 준수 사항]
 * 1. 원자적 트랜잭션: 잔고 확인 → 주문 생성 → 원장 기록이 단일 RPC 내에서 수행
 * 2. Double Spend 방지: Advisory Lock으로 동일 사용자의 동시 주문 직렬화
 * 3. Race Condition 제거: TOCTOU 취약점 원천 차단 (서버 사이드 잔고 검증 제거)
 * 4. 멱등성 보장: idempotency_key를 통한 중복 주문 방지
 * 5. Partial Fill 지원: 잔여 수량 부족 시 가용 수량만큼 부분 체결
 * 6. 감사 추적: 모든 주문 행위를 financial_audit에 기록
 *
 * 이전 구현과의 차이점:
 * - [기존] 클라이언트 사이드 잔고 확인 후 별도 RPC 호출 → Race Condition 취약
 * - [개선] rpc_safe_place_order 단일 호출로 모든 검증 + 실행을 원자적 수행
 *
 * PG 결제 플로우:
 * - payment_method=pg 시 주문만 생성 (PAYMENT_REQUESTED 상태)
 * - 이후 /api/payments/confirm에서 결제 확인 후 원장 기록
 *
 * ============================================================================
 */

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireKycApproved } from "@/lib/kyc/requireKycApproved";

import type { SafeOrderRequest, SafeOrderResult } from "@/lib/types/financial";

export const dynamic = "force-dynamic";

/**
 * 양수 금액 검증 유틸리티
 * 금액은 반드시 양수여야 하며, 유효하지 않은 값은 0을 반환합니다.
 */
function toPositiveAmount(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return n;
}

export async function POST(req: Request) {
  try {
    /* ──────────────────────────────────────────
     * 1단계: 인증 확인
     * ────────────────────────────────────────── */
    const supabase = await createClient();
    const {
      data: authData,
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      return NextResponse.json(
        { ok: false, error: "AUTH_ERROR", debug: authError?.message ?? "인증 정보가 없습니다." },
        { status: 401 },
      );
    }

    const user = authData.user;

    const kycCheck = await requireKycApproved(supabase, user.id);
    if (!kycCheck.approved) {
      return kycCheck.response;
    }

    /* ──────────────────────────────────────────
     * 2단계: 요청 본문 파싱 및 검증
     * ────────────────────────────────────────── */
    let body: SafeOrderRequest;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: "INVALID_JSON", debug: "요청 본문이 유효한 JSON이 아닙니다." },
        { status: 400 },
      );
    }

    const contentId = body.content_id ?? body.product_id;
    const amountPositive = toPositiveAmount(body.amount);
    const usePg = body.payment_method === "pg";

    if (!contentId || typeof contentId !== "string" || contentId.trim() === "") {
      return NextResponse.json(
        { ok: false, error: "INVALID_PAYLOAD", debug: "content_id 또는 product_id가 필요합니다." },
        { status: 400 },
      );
    }

    if (amountPositive <= 0) {
      return NextResponse.json(
        { ok: false, error: "INVALID_PAYLOAD", debug: "투자 금액(amount)은 양수여야 합니다." },
        { status: 400 },
      );
    }

    /* ──────────────────────────────────────────
     * 3단계: PG 결제 플로우 (결제 대기 주문 생성)
     * PG 결제는 주문만 생성하고 원장 기록은
     * 결제 확인(/api/payments/confirm) 시 수행합니다.
     * ────────────────────────────────────────── */
    if (usePg) {
      const admin = (await import("@/utils/supabase/server")).createAdminClient();
      const { data: order, error: orderErr } = await admin
        .from("orders")
        .insert({
          user_id: user.id,
          content_id: contentId.trim(),
          status: "PAYMENT_REQUESTED",
          total_amount_krw: amountPositive,
          quantity: 1,
          type: "BUY",
          order_type: "MARKET",
          price: amountPositive,
        } as Record<string, unknown>)
        .select("id")
        .single();

      if (orderErr || !order?.id) {
        return NextResponse.json(
          { ok: false, error: "ORDER_CREATE_FAILED", debug: orderErr?.message },
          { status: 500 },
        );
      }

      return NextResponse.json({
        ok: true,
        success: true,
        order_id: order.id,
        data: { order_id: order.id },
      });
    }

    /* ──────────────────────────────────────────
     * 4단계: 원자적 주문 실행 (rpc_safe_place_order)
     *
     * 단일 RPC 호출로 다음을 원자적으로 수행:
     * - Advisory Lock 획득 (Double Spend 방지)
     * - 원장 기반 잔고 검증
     * - KYC 상태 및 투자 한도 검증
     * - 주문 생성 + 원장 기록 (CASH_DEBIT, ASSET_CREDIT)
     * - 콘텐츠 잔여 수량 차감
     * - 해시 체인 자동 봉인 (트리거)
     *
     * 트랜잭션 실패 시 모든 변경이 자동 롤백됩니다.
     * ────────────────────────────────────────── */
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      "rpc_safe_place_order",
      {
        p_user_id: user.id,
        p_content_id: contentId.trim(),
        p_amount_krw: amountPositive,
        p_idempotency_key: body.idempotency_key ?? null,
      },
    );

    if (rpcError) {
      const msg = rpcError.message ?? "";

      /* 비즈니스 오류를 적절한 HTTP 상태 코드로 매핑 */
      if (msg.includes("INSUFFICIENT_FUNDS")) {
        return NextResponse.json(
          { ok: false, error: "INSUFFICIENT_FUNDS", debug: "잔액이 부족합니다." },
          { status: 400 },
        );
      }
      if (msg.includes("KYC_REQUIRED")) {
        return NextResponse.json(
          { ok: false, error: "KYC_REQUIRED", debug: "KYC 인증이 필요합니다." },
          { status: 403 },
        );
      }
      if (msg.includes("INVESTMENT_LIMIT_EXCEEDED")) {
        return NextResponse.json(
          { ok: false, error: "INVESTMENT_LIMIT_EXCEEDED", debug: "투자 한도를 초과합니다." },
          { status: 400 },
        );
      }

      return NextResponse.json(
        { ok: false, error: "ORDER_FAILED", debug: rpcError.message },
        { status: 500 },
      );
    }

    /* ──────────────────────────────────────────
     * 5단계: RPC 결과 처리
     * ────────────────────────────────────────── */
    const result = rpcResult as SafeOrderResult;

    if (!result || result.ok === false) {
      const errorCode = result?.error ?? "ORDER_FAILED";

      /** 비즈니스 오류 매핑 */
      const statusMap: Record<string, number> = {
        INSUFFICIENT_FUNDS: 400,
        STATUS_REQUIRED: 403,
        KYC_REQUIRED: 403,
        INVESTMENT_LIMIT_EXCEEDED: 400,
        CONTENT_NOT_FOUND: 404,
        NO_REMAINING_QUANTITY: 400,
      };

      return NextResponse.json(
        { ok: false, error: errorCode },
        { status: statusMap[errorCode] ?? 500 },
      );
    }

    /* ──────────────────────────────────────────
     * 6단계: 감사 로그 기록 (비차단)
     * 감사 로그 실패가 주문 실행에 영향을 주지 않도록
     * 오류를 무시합니다.
     * ────────────────────────────────────────── */
    try {
      await supabase.rpc("rpc_write_financial_audit", {
        p_user_id: user.id,
        p_action: "ORDER_PLACE",
        p_target_type: "order",
        p_target_id: result.order_id ?? null,
        p_metadata: {
          content_id: contentId,
          amount: amountPositive,
          filled_quantity: result.filled_quantity,
          remaining_quantity: result.remaining_quantity,
          idempotent: result.idempotent ?? false,
        },
      });
    } catch {
      /* 감사 로그 기록 실패: 주문 실행에 영향 없음 */
    }

    /* ──────────────────────────────────────────
     * 7단계: 성공 응답
     * ────────────────────────────────────────── */
    return NextResponse.json({
      ok: true,
      success: true,
      order_id: result.order_id,
      data: {
        order_id: result.order_id,
        filled_quantity: result.filled_quantity ?? amountPositive,
        remaining_quantity: result.remaining_quantity ?? 0,
        actual_amount: result.actual_amount ?? amountPositive,
        idempotent: result.idempotent ?? false,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다.";
    return NextResponse.json(
      { ok: false, error: "UNKNOWN_ERROR", debug: message },
      { status: 500 },
    );
  }
}
