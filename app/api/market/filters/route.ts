import { NextResponse } from "next/server";
import { getServerSupabase } from "@/utils/supabase/server";

export const revalidate = 300;

const CATEGORIES = ['여행', '게임', '음악', '웹툰', '웹소설', '드라마', '먹방', '일상', '팟캐스트', 'OTT', '유튜브', '음원'] as const;

/** GET /api/market/filters - 카테고리, artist_keyword 목록 */
export async function GET() {
  try {
    const supabase = await getServerSupabase();

    const { data } = await supabase
      .from("content_items")
      .select("artist_keyword")
      .eq("status", "active")
      .not("artist_keyword", "is", null);

    const artistKeywords = [...new Set((data ?? []).map((r: { artist_keyword?: string }) => r.artist_keyword).filter(Boolean))] as string[];

    return NextResponse.json({
      categories: [...CATEGORIES],
      artist_keywords: artistKeywords.sort(),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
