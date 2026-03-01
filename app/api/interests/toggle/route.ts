import { NextResponse } from "next/server";
import { getServerSupabase } from "@/utils/supabase/server";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * 관심 등록/해제 토글
 * POST /api/interests/toggle { contentId }
 * 응답: { ok, isInterested }
 */
export async function POST(req: Request) {
  try {
    const supabase = await getServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ ok: false, error: "로그인이 필요합니다." }, { status: 401 });
    }

    const body = await req.json();
    const contentId = body?.contentId ?? body?.content_id;

    if (!contentId || typeof contentId !== "string") {
      return NextResponse.json({ ok: false, error: "contentId required" }, { status: 400 });
    }

    if (!UUID_REGEX.test(contentId)) {
      return NextResponse.json({ ok: false, error: "contentId must be a valid UUID" }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from("user_interests")
      .select("content_id")
      .eq("user_id", user.id)
      .eq("content_id", contentId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("user_interests")
        .delete()
        .eq("user_id", user.id)
        .eq("content_id", contentId);

      if (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      }
      return NextResponse.json({ ok: true, isInterested: false });
    }

    const { error } = await supabase
      .from("user_interests")
      .insert({ user_id: user.id, content_id: contentId });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, isInterested: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
