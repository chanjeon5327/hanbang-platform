import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * GET /api/artist/progress
 * 로그인 유저의 아티스트별 공식 파트너십 도달률 조회
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("user_artist_progress")
      .select("artist_keyword, total_amount, target_amount, progress_percent")
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const items = (data ?? []).map((row) => ({
      artist_keyword: row.artist_keyword ?? "",
      total_amount: Number(row.total_amount ?? 0),
      target_amount: Number(row.target_amount ?? 100000000),
      progress_percent: Math.min(100, Math.max(0, Number(row.progress_percent ?? 0))),
    }));

    return NextResponse.json({ items });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
