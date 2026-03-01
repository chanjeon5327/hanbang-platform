import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/utils/supabase/server";

/**
 * GET: 알림 목록 (본인만, 최신순)
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await getServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ notifications: [], unreadCount: 0 });

    const { data: rows, error } = await supabase
      .from("notifications")
      .select("id, type, reference_id, message, is_read, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) return NextResponse.json({ notifications: [], unreadCount: 0 });

    const notifications = (rows ?? []).map((r) => ({
      id: r.id,
      type: r.type,
      reference_id: r.reference_id,
      title: r.message,
      content: null,
      is_read: r.is_read ?? false,
      created_at: r.created_at,
    }));

    const unreadCount = notifications.filter((n) => !n.is_read).length;
    return NextResponse.json({ notifications, unreadCount });
  } catch {
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }
}

/**
 * POST: 알림 기록 생성 (실DB)
 * rpc_invest_and_notify에서 이미 처리하므로, 별도 호출 시에만 사용
 */
export async function POST(req: Request) {
  try {
    const supabase = await getServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ ok: true });

    const body = await req.json();
    const { type, contentId, amount } = body;
    const refId = contentId ? String(contentId).trim() : null;
    const amt = typeof amount === "number" ? amount : Number(amount) || 0;
    const message = type === "INVEST_SUCCESS" && amt > 0
      ? `₩${amt.toLocaleString()} 투자 완료`
      : (body.message ?? String(type));

    const { error } = await supabase.from("notifications").insert({
      user_id: user.id,
      type: type ?? "INVEST_SUCCESS",
      reference_id: refId && /^[0-9a-f-]{36}$/i.test(refId) ? refId : null,
      message,
    });

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
