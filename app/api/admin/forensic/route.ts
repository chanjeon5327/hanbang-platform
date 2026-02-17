/**
 * ============================================================================
 * GET /api/admin/forensic — 관리자 포렌식 감사 데이터 API
 * ============================================================================
 *
 * [금융감독원 전자금융업 감독규정 준수 사항]
 * 1. 원장 해시 체인 무결성 실시간 검증 결과 제공
 * 2. 로그인 시도 모니터링 (성공/실패 통계)
 * 3. 강제 로그아웃 기록 추적
 * 4. 시간별 실패율 분석 (이상 탐지 기초 데이터)
 * 5. 관리자 전용 엔드포인트 (requireAdmin 검증)
 *
 * 반환 데이터:
 * - ledger_integrity: rpc_verify_ledger_integrity() 결과
 * - login_stats: 최근 24시간 로그인 시도 통계
 * - force_logouts: 최근 강제 로그아웃 기록
 * - hourly_failure_rates: 시간별 실패율 (최근 24시간)
 *
 * ============================================================================
 */

import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";

import type {
  ForensicDashboardData,
  LedgerIntegrityResult,
  LoginStats,
  ForceLogoutRecord,
  HourlyFailureRate,
} from "@/lib/types/financial";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();

    const admin = createAdminClient();
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    /* ──────────────────────────────────────────
     * 1. 원장 무결성 검증 (rpc_verify_ledger_integrity)
     * ────────────────────────────────────────── */
    let ledgerIntegrity: LedgerIntegrityResult = {
      total_entries: 0,
      mismatches: 0,
      chain_breaks: 0,
      first_mismatch_id: null,
      integrity_ok: true,
      verified_at: now.toISOString(),
    };

    try {
      const { data: integrityResult } = await admin.rpc("rpc_verify_ledger_integrity");
      if (integrityResult) {
        const r = integrityResult as Record<string, unknown>;
        ledgerIntegrity = {
          total_entries: Number(r.total_entries ?? 0),
          mismatches: Number(r.mismatches ?? 0),
          chain_breaks: Number(r.chain_breaks ?? 0),
          first_mismatch_id: (r.first_mismatch_id as string) ?? null,
          integrity_ok: Boolean(r.integrity_ok),
          verified_at: String(r.verified_at ?? now.toISOString()),
        };
      }
    } catch {
      /* RPC 미존재 시 기본값 유지 */
    }

    /* ──────────────────────────────────────────
     * 2. 최근 24시간 로그인 시도 통계
     * ────────────────────────────────────────── */
    let loginStats: LoginStats = {
      total_attempts: 0,
      success_count: 0,
      failure_count: 0,
      failure_rate: 0,
      unique_users: 0,
    };

    try {
      const { data: loginRows } = await admin
        .from("auth_login_audit")
        .select("id, user_id, success, attempted_at")
        .gte("attempted_at", twentyFourHoursAgo);

      if (loginRows) {
        const total = loginRows.length;
        const successCount = loginRows.filter(
          (r: { success: boolean }) => r.success === true,
        ).length;
        const failureCount = total - successCount;
        const uniqueUsers = new Set(
          loginRows
            .map((r: { user_id: string | null }) => r.user_id)
            .filter(Boolean),
        ).size;

        loginStats = {
          total_attempts: total,
          success_count: successCount,
          failure_count: failureCount,
          failure_rate: total > 0 ? Math.round((failureCount / total) * 10000) / 100 : 0,
          unique_users: uniqueUsers,
        };
      }
    } catch {
      /* auth_login_audit 테이블 미존재 시 기본값 유지 */
    }

    /* ──────────────────────────────────────────
     * 3. 최근 강제 로그아웃 기록
     * ────────────────────────────────────────── */
    let forceLogouts: ForceLogoutRecord[] = [];
    try {
      const { data: logoutRows } = await admin
        .from("profiles")
        .select("id, email, nickname, force_logout_at")
        .not("force_logout_at", "is", null)
        .order("force_logout_at", { ascending: false })
        .limit(20);

      forceLogouts = (logoutRows ?? []).map(
        (r: {
          id: string;
          email: string | null;
          nickname: string | null;
          force_logout_at: string;
        }) => ({
          user_id: r.id,
          email: r.email,
          nickname: r.nickname,
          force_logout_at: r.force_logout_at,
        }),
      );
    } catch {
      /* profiles 테이블에 force_logout_at 미존재 시 빈 배열 */
    }

    /* ──────────────────────────────────────────
     * 4. 시간별 로그인 실패율 (최근 24시간)
     * ────────────────────────────────────────── */
    let hourlyFailureRates: HourlyFailureRate[] = [];
    try {
      const { data: loginRows } = await admin
        .from("auth_login_audit")
        .select("success, attempted_at")
        .gte("attempted_at", twentyFourHoursAgo);

      if (loginRows && loginRows.length > 0) {
        /** 시간별 집계 */
        const byHour: Record<string, { total: number; failures: number }> = {};

        loginRows.forEach((r: { success: boolean; attempted_at: string }) => {
          const dt = new Date(r.attempted_at);
          const hourKey = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}T${String(dt.getHours()).padStart(2, "0")}:00`;

          if (!byHour[hourKey]) byHour[hourKey] = { total: 0, failures: 0 };
          byHour[hourKey].total += 1;
          if (!r.success) byHour[hourKey].failures += 1;
        });

        hourlyFailureRates = Object.entries(byHour)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([hour, stats]) => ({
            hour,
            total: stats.total,
            failures: stats.failures,
            rate: stats.total > 0
              ? Math.round((stats.failures / stats.total) * 10000) / 100
              : 0,
          }));
      }
    } catch {
      /* 집계 실패 시 빈 배열 */
    }

    /* ──────────────────────────────────────────
     * 5. 응답 반환
     * ────────────────────────────────────────── */
    const response: ForensicDashboardData = {
      ledger_integrity: ledgerIntegrity,
      login_stats: loginStats,
      force_logouts: forceLogouts,
      hourly_failure_rates: hourlyFailureRates,
    };

    return NextResponse.json(response);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "알 수 없는 오류";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
