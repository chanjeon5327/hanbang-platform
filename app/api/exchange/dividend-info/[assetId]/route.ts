/**
 * WARNING:
 * This exchange API is experimental/internal only.
 * Do NOT expose to public users.
 *
 * GET /api/exchange/dividend-info/[assetId] — 자산 배당 예정 정보 (관리자 전용)
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/utils/supabase/admin";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ assetId: string }> },
) {
  try {
    await requireAdmin();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    return NextResponse.json(
      { error: msg.includes("Forbidden") ? "FORBIDDEN" : "UNAUTHORIZED" },
      { status: msg.includes("Forbidden") ? 403 : 401 },
    );
  }
  const { assetId } = await params;
  if (!assetId) return NextResponse.json({ error: "MISSING_ASSET_ID" }, { status: 400 });

  const admin = getAdminSupabase();
  const { data, error } = await admin
    .from("corporate_actions")
    .select("*")
    .eq("asset_id", assetId)
    .eq("action_type", "DIVIDEND")
    .in("status", ["SCHEDULED", "SNAPSHOTTED"])
    .order("pay_date", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ action: data ?? null });
}
