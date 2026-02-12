import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const supabase = createClient();
  const { content_id } = await req.json();
  if (!content_id) return NextResponse.json({ ok:false }, { status:400 });

  // 전환 지표 조회
  const { data: kpi } = await supabase
    .from("v_join_to_buy_7d")
    .select("joins_7d, conversion_rate_7d")
    .eq("content_id", content_id)
    .single();

  // 기본 A
  let variant: 'A'|'B'|'C' = 'A';

  // 권고 배지
  if (kpi && kpi.joins_7d >= 20 && kpi.conversion_rate_7d >= 0.08) {
    variant = 'B';
  }

  // 매수 버튼 노출(제한)
  if (kpi && kpi.joins_7d >= 40 && kpi.conversion_rate_7d >= 0.12) {
    variant = 'C';
  }

  await supabase
    .from("buy_button_exposure")
    .upsert({ content_id, variant }, { onConflict: "content_id" });

  return NextResponse.json({ ok:true, variant });
}
