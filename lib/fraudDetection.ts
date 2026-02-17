import { createAdminClient } from "@/utils/supabase/server";
import { logSystem } from "./systemLog";

/**
 * req에서 IP 추출
 * 우선순위: x-real-ip > cf-connecting-ip > null
 * (x-forwarded-for는 조작 가능하므로 사용하지 않음)
 */
export function getClientIp(headers: Headers): string | null {
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();
  return null;
}

export type FraudCheckResult =
  | { ok: true }
  | { ok: false; reason: string };

/**
 * 결제 요청 시 이상 거래 탐지
 * - 10분 내 5회 이상 결제 시도
 * - 1회 투자 금액이 평균의 5배 이상
 * - 동일 IP에서 다계정 시도
 */
export async function checkFraud(
  userId: string,
  contentId: string,
  amount: number,
  ip: string | null,
  headers: Headers
): Promise<FraudCheckResult> {
  const admin = createAdminClient();

  // 1) 10분 내 5회 이상 결제 시도
  const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { count: recentCount } = await admin
    .from("payments")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", tenMinAgo);

  if ((recentCount ?? 0) >= 5) {
    await insertFraudAndNotify(admin, userId, contentId, amount, "10분 내 5회 이상 결제 시도", ip, { recentCount });
    return { ok: false, reason: "FRAUD_RATE_LIMIT" };
  }

  // 2) 1회 투자 금액이 평균의 5배 이상
  const { data: ledgerRows } = await admin
    .from("ledger_entries")
    .select("amount")
    .eq("user_id", userId)
    .eq("entry_type", "CASH_DEBIT");

  const amounts = (ledgerRows ?? []).map((r) => Math.abs(Number(r.amount)));
  const avg = amounts.length > 0 ? amounts.reduce((a, b) => a + b, 0) / amounts.length : 0;
  if (avg > 0 && amount > avg * 5) {
    await insertFraudAndNotify(admin, userId, contentId, amount, "1회 투자 금액이 평균의 5배 이상", ip, {
      avg,
      amount,
      ratio: amount / avg,
    });
    return { ok: false, reason: "FRAUD_AMOUNT_ANOMALY" };
  }

  // 3) 동일 IP에서 다계정 시도 (다른 유저가 이미 이 IP로 결제 시도함)
  if (ip) {
    const { data: sameIpPayments } = await admin
      .from("payments")
      .select("user_id")
      .eq("ip_address", ip)
      .gte("created_at", tenMinAgo);

    const uniqueUsers = new Set((sameIpPayments ?? []).map((p) => p.user_id).filter(Boolean));
    const wouldBeMulti = uniqueUsers.size >= 2 || (uniqueUsers.size === 1 && !uniqueUsers.has(userId));
    if (wouldBeMulti) {
      await insertFraudAndNotify(admin, userId, contentId, amount, "동일 IP에서 다계정 시도", ip, {
        uniqueUserCount: uniqueUsers.size,
      });
      return { ok: false, reason: "FRAUD_MULTI_ACCOUNT" };
    }
  }

  return { ok: true };
}

async function insertFraudAndNotify(
  admin: ReturnType<typeof import("@/utils/supabase/server").createAdminClient>,
  userId: string,
  contentId: string,
  amount: number,
  reason: string,
  ip: string | null,
  metadata: Record<string, unknown>
): Promise<void> {
  await admin.from("fraud_logs").insert({
    user_id: userId,
    content_id: contentId,
    amount,
    reason,
    ip_address: ip,
    metadata: metadata as Record<string, never>,
  });
  await logSystem("FRAUD_DETECTED", {
    user_id: userId,
    content_id: contentId,
    amount,
    reason,
    ip_address: ip,
    metadata,
  });
}
