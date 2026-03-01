import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/utils/supabase/admin";
import { requireAdmin } from "@/lib/admin/requireAdmin";

/**
 * GET /api/admin/users/[id]/limits - 투자 한도 조회
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "user id required" }, { status: 400 });
    }

    const admin = getAdminSupabase();
    const { data, error } = await admin
      .from("profiles")
      .select("id, daily_invest_limit, monthly_invest_limit, kyc_level")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "profile not found" }, { status: 404 });
    }
    return NextResponse.json({ profile: data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/users/[id]/limits
 * 투자 한도 수정 (daily_invest_limit, monthly_invest_limit, kyc_level)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "user id required" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const dailyLimit = body.daily_invest_limit;
    const monthlyLimit = body.monthly_invest_limit;
    const kycLevel = body.kyc_level;

    const updates: Record<string, number> = {};
    if (typeof dailyLimit === "number" && dailyLimit >= 0) {
      updates.daily_invest_limit = dailyLimit;
    }
    if (typeof monthlyLimit === "number" && monthlyLimit >= 0) {
      updates.monthly_invest_limit = monthlyLimit;
    }
    if (typeof kycLevel === "number" && kycLevel >= 1 && kycLevel <= 3) {
      updates.kyc_level = kycLevel;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "no valid fields to update" }, { status: 400 });
    }

    const admin = getAdminSupabase();
    const { data, error } = await admin
      .from("profiles")
      .update(updates)
      .eq("id", id)
      .select("id, daily_invest_limit, monthly_invest_limit, kyc_level")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ profile: data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
