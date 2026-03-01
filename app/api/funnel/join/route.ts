import { NextResponse } from "next/server";
import { getServerSupabase } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok:false, error:"UNAUTH" }, { status:401 });

  const { content_id, source = "detail" } = await req.json();
  if (!content_id) {
    return NextResponse.json({ ok:false, error:"INVALID_PAYLOAD" }, { status:400 });
  }

  // 1) 합류 upsert (중복 방지)
  const { error } = await supabase
    .from("join_funnel")
    .upsert({ user_id: user.id, content_id, source }, { onConflict: "user_id,content_id" });

  if (error) {
    return NextResponse.json({ ok:false, error: error.message }, { status:500 });
  }

  // 2) 합류 신호를 metrics로도 반영 (INTEREST와 분리된 강한 신호)
  // 합류는 관심보다 강한 신호로 동일 필드 가중
  const today = new Date().toISOString().slice(0,10);
  await supabase.rpc("rpc_increment_content_metric", {
    p_content_id: content_id,
    p_day: today,
    p_impressions: 0,
    p_clicks: 0,
    p_interests: 1,
    p_watch_seconds: 0,
  });

  return NextResponse.json({ ok:true });
}
