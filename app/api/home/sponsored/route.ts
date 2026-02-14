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
};

export async function GET() {
  try {
    const supabase = await createClient();

    // TODO: home_sponsored_slots 테이블 또는 admin 설정 연동
    // const { data } = await supabase.from("home_sponsored_slots").select("*").eq("slot_key", "main_top").single();
    // if (data) return NextResponse.json({ ok: true, pick: mapToSponsoredPick(data) });

    return NextResponse.json({ ok: true, pick: MOCK_SPONSORED });
  } catch {
    return NextResponse.json({ ok: true, pick: MOCK_SPONSORED });
  }
}
