import { getAdminSupabase } from "@/utils/supabase/admin";

export type SystemLogType =
  | "API_ERROR"
  | "PAYMENT_FAILED"
  | "RPC_EXCEPTION"
  | "FRAUD_DETECTED";

/**
 * system_logs 테이블에 로그 기록 (서버 전용)
 */
export async function logSystem(
  type: SystemLogType,
  payload: Record<string, unknown>
): Promise<void> {
  try {
    const admin = getAdminSupabase();
    await admin.from("system_logs").insert({
      type,
      payload: payload as Record<string, never>,
    });
  } catch {
    // 로깅 실패 시 무시 (무한 루프 방지)
  }
}
