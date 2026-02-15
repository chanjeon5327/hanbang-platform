import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    const { data, error } = await (admin as any)
      .from("kyc_submissions")
      .select("id, user_id, step, status, payload_json, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ submissions: data ?? [] });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
