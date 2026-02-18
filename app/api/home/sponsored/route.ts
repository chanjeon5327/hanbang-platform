import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { FALLBACK_IDS } from "@/lib/constants/fallbackIds";
import { getYtThumb } from "@/lib/thumbnails";

export const revalidate = 120;

export type SponsoredPick = {
  id: string;
  productId: string;
  title: string;
  subtitle: string;
  thumbnailUrl: string;
  progress: number;
  yieldRate: number;
  ctaLabel: string;
  sharePriceKrw?: number | null;
};

/** 관리자 설정 가능 구조 대비 - DB 없으면 mock fallback */
const MOCK_SPONSORED: SponsoredPick = {
  id: "sponsored-1",
  productId: FALLBACK_IDS.SAMPLE_1,
  title: "전문가 추천 청약/투자",
  subtitle: "안정적이고 높은 수익률을 원한다면?",
  thumbnailUrl: getYtThumb(2),
  progress: 72,
  yieldRate: 8.4,
  ctaLabel: "지금 참여하기",
  sharePriceKrw: 13500,
};

export async function GET() {
  try {
    const supabase = await createClient();

    // TODO: home_sponsored_slots 테이블 또는 admin 설정 연동
    // const { data } = await supabase.from("home_sponsored_slots").select("*").eq("slot_key", "main_top").single();
    // if (data) return NextResponse.json({ ok: true, pick: mapToSponsoredPick(data) });

    const pick = { ...MOCK_SPONSORED };
    const { data: fx } = await supabase.from("fx_rates").select("rate").eq("currency", "USD").single();
    const fxRate = Number((fx as { rate?: number })?.rate ?? 1350);
    const { data: item } = await supabase
      .from("content_items")
      .select("share_price_usd")
      .eq("id", pick.productId)
      .single();
    const sharePriceUsd = Number((item as { share_price_usd?: number } | null)?.share_price_usd ?? 0);
    if (sharePriceUsd > 0) pick.sharePriceKrw = Math.round(sharePriceUsd * fxRate);

    return NextResponse.json({ ok: true, pick });
  } catch {
    return NextResponse.json({ ok: true, pick: MOCK_SPONSORED });
  }
}
