import { NextResponse } from "next/server";
import { getServerSupabase } from "@/utils/supabase/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";

/**
 * GET /api/admin/dashboard
 * daily, suspicious, topContent
 */
export async function GET() {
  try {
    await requireAdmin();
    const supabase = await getServerSupabase();

    const [dailyRes, suspiciousRes, topRes] = await Promise.all([
      supabase.from("v_admin_daily_summary").select("*").limit(1).single(),
      supabase.from("v_admin_suspicious_activity").select("*"),
      supabase
        .from("v_admin_top_content_24h")
        .select("content_id, total_amount, order_count")
        .order("total_amount", { ascending: false })
        .limit(10),
    ]);

    const daily = dailyRes.data ?? {
      date: new Date().toISOString().slice(0, 10),
      confirmed_count: 0,
      confirmed_amount: 0,
      cancelled_count: 0,
    };
    const suspicious = suspiciousRes.data ?? [];
    const topContent = topRes.data ?? [];

    return NextResponse.json({
      daily,
      suspicious,
      topContent,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
