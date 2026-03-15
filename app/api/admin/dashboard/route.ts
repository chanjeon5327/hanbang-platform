import { NextResponse } from "next/server";
import { getServerSupabase } from "@/utils/supabase/server";
import { getAdminSupabase } from "@/utils/supabase/admin";
import { requireAdmin } from "@/lib/admin/requireAdmin";

/**
 * GET /api/admin/dashboard
 * daily, suspicious, topContent, summary (회원/온보딩/KYC 요약)
 */
export async function GET() {
  try {
    await requireAdmin();
    const supabase = await getServerSupabase();
    const admin = getAdminSupabase();

    const [dailyRes, suspiciousRes, topRes, totalRes, onboardingRes, kycPendingRes, kycApprovedRes] = await Promise.all([
      supabase.from("v_admin_daily_summary").select("*").limit(1).single(),
      supabase.from("v_admin_suspicious_activity").select("*"),
      supabase
        .from("v_admin_top_content_24h")
        .select("content_id, total_amount, order_count")
        .order("total_amount", { ascending: false })
        .limit(10),
      (admin as any).from("profiles").select("*", { count: "exact", head: true }),
      (admin as any).from("profiles").select("*", { count: "exact", head: true }).eq("onboarding_completed", true),
      (admin as any).from("profiles").select("*", { count: "exact", head: true }).eq("status", "KYC_SUBMITTED"),
      (admin as any).from("investor_profiles").select("*", { count: "exact", head: true }).eq("kyc_status", "APPROVED"),
    ]);

    const daily = dailyRes.data ?? {
      date: new Date().toISOString().slice(0, 10),
      confirmed_count: 0,
      confirmed_amount: 0,
      cancelled_count: 0,
    };
    const suspicious = suspiciousRes.data ?? [];
    const topContent = topRes.data ?? [];

    const summary = {
      total_members: totalRes.count ?? 0,
      onboarding_completed: onboardingRes.count ?? 0,
      kyc_pending: kycPendingRes.count ?? 0,
      kyc_approved: kycApprovedRes.count ?? 0,
    };

    return NextResponse.json({
      daily,
      suspicious,
      topContent,
      summary,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
