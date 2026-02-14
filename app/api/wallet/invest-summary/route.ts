import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireActiveUser } from "@/lib/auth/requireActiveUser";

/**
 * GET /api/wallet/invest-summary
 * - 총 투자금 = ledger_entries CASH_DEBIT 합계 (abs)
 * - 평균 수익률 = (총 평가금액 - 총 투자금) / 총 투자금 * 100
 * - 이번 달 수익 = 이번 달 CASH_CREDIT (settlement) 합계
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    await requireActiveUser(user.id);
  } catch {
    return NextResponse.json({ error: "이 계정은 이용이 제한되었습니다." }, { status: 403 });
  }

  const { data: entries, error } = await supabase
    .from("ledger_entries")
    .select("entry_type, amount, created_at")
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = entries ?? [];
  let totalInvest = 0;
  let monthlyProfit = 0;

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  for (const r of rows) {
    const amt = Number(r.amount) || 0;
    if (r.entry_type === "CASH_DEBIT") {
      totalInvest += Math.abs(amt);
    }
    if (r.entry_type === "CASH_CREDIT" && r.created_at >= thisMonthStart) {
      monthlyProfit += amt;
    }
  }

  const { data: assetData } = await supabase
    .from("ledger_entries")
    .select("entry_type, amount, quantity, asset_id")
    .eq("user_id", user.id);

  let holdingsValue = 0;
  (assetData ?? []).forEach((r) => {
    if (r.entry_type === "ASSET_CREDIT") {
      holdingsValue += Number(r.quantity ?? 0) * 12300;
    }
    if (r.entry_type === "ASSET_DEBIT") {
      holdingsValue -= Number(r.quantity ?? 0) * 12300;
    }
  });
  holdingsValue = Math.max(0, holdingsValue);

  const avgReturnRate = totalInvest > 0
    ? ((holdingsValue - totalInvest) / totalInvest) * 100
    : 0;

  return NextResponse.json({
    totalInvest,
    avgReturnRate: Number(avgReturnRate.toFixed(2)),
    monthlyProfit,
    holdingsValue,
  });
}
