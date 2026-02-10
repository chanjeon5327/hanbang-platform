import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

type EventType = "IMPRESSION" | "CLICK" | "INTEREST" | "WATCH";

export async function POST(req: Request) {
  const supabase = createClient();
  const body = await req.json();

  const {
    content_id,
    event_type,
    watch_seconds = 0,
  }: {
    content_id: string;
    event_type: EventType;
    watch_seconds?: number;
  } = body;

  if (!content_id || !event_type) {
    return NextResponse.json({ ok: false, error: "INVALID_PAYLOAD" }, { status: 400 });
  }

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // 증가 필드 결정
  const inc = {
    impressions: event_type === "IMPRESSION" ? 1 : 0,
    clicks: event_type === "CLICK" ? 1 : 0,
    interests: event_type === "INTEREST" ? 1 : 0,
    watch_seconds: event_type === "WATCH" ? Math.max(0, watch_seconds) : 0,
  };

  // upsert → 증가
  const { error } = await supabase.rpc("rpc_increment_content_metric", {
    p_content_id: content_id,
    p_day: today,
    p_impressions: inc.impressions,
    p_clicks: inc.clicks,
    p_interests: inc.interests,
    p_watch_seconds: inc.watch_seconds,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
