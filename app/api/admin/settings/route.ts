import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/utils/supabase/admin";
import { requireAdmin } from "@/lib/admin/requireAdmin";

/**
 * GET /api/admin/settings - 설정 조회
 * PATCH /api/admin/settings - INVEST_ENABLED 등 설정 수정
 */
export async function GET() {
  try {
    await requireAdmin();
    const admin = getAdminSupabase();
    const { data, error } = await admin.from("settings").select("key, value, updated_at");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const map: Record<string, { value: string; updated_at?: string }> = {};
    for (const row of data ?? []) {
      map[row.key] = { value: row.value ?? "", updated_at: row.updated_at };
    }
    return NextResponse.json({ settings: map });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json().catch(() => ({}));
    const key = body.key as string;
    const value = body.value as string;

    if (!key || typeof value !== "string") {
      return NextResponse.json({ error: "key and value required" }, { status: 400 });
    }

    const admin = getAdminSupabase();
    const { error } = await admin
      .from("settings")
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, key, value });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
