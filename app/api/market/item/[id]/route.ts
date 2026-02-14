import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getYtThumb } from "@/lib/thumbnails";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * content_items 기반 상세 조회 (마켓 기준 ID = content_items.id)
 * popular_content_mv cnt, deadline 기반 배지용
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contentId = id;
    if (!contentId || !UUID_REGEX.test(contentId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("content_items")
      .select("id, title, summary, creator_name, category, platform, thumbnail_url, deadline, youtube_video_id, media_url, created_at, total_raise, current_raise, yield_rate, artist_keyword, event_date, product_type, pricing_currency, share_price_usd, total_raise_usd, current_raise_usd, dividend_monthly_usd_per_share, dividend_monthly_rate, payout_day")
      .eq("id", contentId)
      .eq("status", "active")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    let popularCnt = 0;
    try {
      const { data: mv } = await supabase
        .from("popular_content_mv")
        .select("cnt")
        .eq("content_id", contentId)
        .maybeSingle();
      popularCnt = Number((mv as { cnt?: number } | null)?.cnt ?? 0);
    } catch {
      // ignore
    }

    let participants = 0;
    try {
      const { data: orderRows } = await supabase
        .from("orders")
        .select("user_id")
        .or(`content_id.eq.${contentId},product_id.eq.${contentId}`)
        .in("status", ["INVEST_CONFIRMED", "COMPLETED", "SETTLED"]);
      participants = new Set((orderRows ?? []).map((r) => r.user_id).filter(Boolean)).size;
    } catch {
      // ignore
    }

    let last1hCount = 0;
    let last24hCount = 0;
    let last24hAmount = 0;
    try {
      const { data: stats } = await supabase
        .from("v_recent_invest_stats")
        .select("last_1h_count, last_24h_count, last_24h_amount")
        .eq("content_id", contentId)
        .maybeSingle();
      if (stats) {
        last1hCount = Number((stats as { last_1h_count?: number })?.last_1h_count ?? 0);
        last24hCount = Number((stats as { last_24h_count?: number })?.last_24h_count ?? 0);
        last24hAmount = Number((stats as { last_24h_amount?: number })?.last_24h_amount ?? 0);
      }
    } catch {
      // ignore
    }

    let fxRate = 1350;
    try {
      const base = new URL(req.url).origin;
      const fxRes = await fetch(`${base}/api/fx/usd`, { cache: "no-store" });
      const fxJson = await fxRes.json();
      if (typeof fxJson?.usd_krw === "number") fxRate = fxJson.usd_krw;
    } catch {
      // fallback
    }

    const item = {
      id: data.id,
      title: data.title,
      summary: data.summary,
      creator_name: data.creator_name,
      category: data.category,
      platform: data.platform,
      thumbnail_url: data.thumbnail_url ?? getYtThumb(0),
      deadline: data.deadline,
      youtube_video_id: data.youtube_video_id,
      media_url: data.media_url,
      created_at: data.created_at,
      total_raise: data.total_raise,
      current_raise: data.current_raise,
      popular_cnt: popularCnt,
      yield_rate: data.yield_rate ?? 8.4,
      participants: Math.max(1, participants),
      artist_keyword: data.artist_keyword ?? null,
      event_date: data.event_date ?? null,
      last_1h_count: last1hCount,
      last_24h_count: last24hCount,
      last_24h_amount: last24hAmount,
      product_type: data.product_type ?? "DIVIDEND_ONLY",
      pricing_currency: data.pricing_currency ?? "USD",
      share_price_usd: data.share_price_usd ?? null,
      total_raise_usd: data.total_raise_usd ?? null,
      current_raise_usd: data.current_raise_usd ?? null,
      dividend_monthly_usd_per_share: data.dividend_monthly_usd_per_share ?? null,
      dividend_monthly_rate: data.dividend_monthly_rate ?? null,
      payout_day: data.payout_day ?? 3,
      fx_rate: fxRate,
    };

    return NextResponse.json(item);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
