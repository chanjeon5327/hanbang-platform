/**
 * GET /api/exchange/dividend-info/[assetId] — 자산 배당 예정 정보
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ assetId: string }> },
) {
  const { assetId } = await params;
  if (!assetId) return NextResponse.json({ error: "MISSING_ASSET_ID" }, { status: 400 });

  const admin = createAdminClient();
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
