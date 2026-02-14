import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/server";
import { requireActiveUser } from "@/lib/auth/requireActiveUser";
import { filterProfanity, containsProfanity } from "@/lib/chat/profanityFilter";

const MAX_MESSAGE_LENGTH = 300;

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUUID(s: string): boolean {
  return UUID_REGEX.test(s);
}

/**
 * GET: content_id(라우트 param: productId) 메시지 리스트 (pinned 1개 먼저, 일반 메시지 최신순)
 * POST: 로그인 유저만 메시지 작성 (필터 적용, RLS 정책에 맡김)
 * ※ product_chat_messages.product_id = content_items.id (마켓 기준 ID)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const contentId = productId;
    if (!contentId) {
      return NextResponse.json({ error: "productId required" }, { status: 400 });
    }
    if (!isValidUUID(contentId)) {
      return NextResponse.json({ error: "productId must be a valid UUID" }, { status: 400 });
    }

    const supabase = await createClient();

    const url = new URL(req.url);
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(50, Math.max(10, parseInt(url.searchParams.get("limit") ?? "50", 10) || 50));

    // 1) pinned 메시지 1개만 별도 조회
    const { data: pinnedRows } = await supabase
      .from("product_chat_messages")
      .select("id, product_id, user_id, message, created_at, is_pinned")
      .eq("product_id", contentId)
      .eq("is_deleted", false)
      .eq("is_pinned", true)
      .order("created_at", { ascending: false })
      .limit(1);

    // 2) 일반 메시지: cursor 기반 pagination (created_at desc)
    let query = supabase
      .from("product_chat_messages")
      .select("id, product_id, user_id, message, created_at, is_pinned")
      .eq("product_id", contentId)
      .eq("is_deleted", false)
      .eq("is_pinned", false)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (cursor) {
      query = query.lt("created_at", cursor);
    }

    const { data: rows, error } = await query;

    if (error) {
      return NextResponse.json({ messages: [] });
    }

    const normalRows = (rows ?? []).slice().sort((a: { created_at?: string }, b: { created_at?: string }) =>
      new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime()
    );
    const allRows = [...(pinnedRows ?? []), ...normalRows];
    const userIds = [...new Set(allRows.map((r: Record<string, unknown>) => r.user_id).filter(Boolean))] as string[];
    const profileMap = new Map<string, { nickname?: string; avatar_url?: string }>();
    if (userIds.length > 0) {
      const admin = createAdminClient();
      const { data: profiles } = await admin
        .from("profiles")
        .select("id, nickname, avatar_url, display_name")
        .in("id", userIds);
      (profiles ?? []).forEach((p: Record<string, unknown>) => {
        profileMap.set(String(p.id), {
          nickname: (p.nickname ?? p.display_name ?? "Unknown") as string,
          avatar_url: p.avatar_url as string | undefined,
        });
      });
    }

    const messages = allRows.map((r: Record<string, unknown>) => {
      const prof = profileMap.get(String(r.user_id));
      return {
        id: r.id,
        product_id: r.product_id,
        user_id: r.user_id,
        message: r.message,
        created_at: r.created_at,
        is_pinned: r.is_pinned ?? false,
        nickname: prof?.nickname ?? "Unknown",
        avatar_url: prof?.avatar_url ?? null,
      };
    });

    const sortedRows = rows ?? [];
    const nextCursor = sortedRows.length >= limit && sortedRows.length > 0
      ? sortedRows[sortedRows.length - 1]?.created_at
      : null;

    return NextResponse.json({ messages, nextCursor });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    try {
      await requireActiveUser(user.id);
    } catch {
      return NextResponse.json({ error: "USER_SUSPENDED" }, { status: 403 });
    }

    const { productId } = await params;
    if (!productId) {
      return NextResponse.json({ error: "productId required" }, { status: 400 });
    }
    if (!isValidUUID(productId)) {
      return NextResponse.json({ error: "productId must be a valid UUID" }, { status: 400 });
    }

    const body = await req.json();
    const raw = typeof body.message === "string" ? body.message.trim() : "";

    if (!raw || raw.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `메시지는 1~${MAX_MESSAGE_LENGTH}자 이내입니다.` },
        { status: 400 }
      );
    }

    if (containsProfanity(raw)) {
      return NextResponse.json(
        { error: "부적절한 표현이 포함되어 있습니다." },
        { status: 400 }
      );
    }

    const message = filterProfanity(raw);

    const tenSecondsAgo = new Date(Date.now() - 10_000).toISOString();
    const oneSecondAgo = new Date(Date.now() - 1_000).toISOString();

    const { count: count10 } = await supabase
      .from("chat_rate_limit")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", tenSecondsAgo);

    if ((count10 ?? 0) >= 5) {
      return NextResponse.json({ error: "RATE_LIMIT" }, { status: 429 });
    }

    const { count: count1 } = await supabase
      .from("chat_rate_limit")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", oneSecondAgo);

    if ((count1 ?? 0) > 0) {
      return NextResponse.json({ error: "RATE_LIMIT" }, { status: 429 });
    }

    await supabase.from("chat_rate_limit").insert({ user_id: user.id });

    const { data: inserted, error } = await supabase
      .from("product_chat_messages")
      .insert({
        product_id: contentId,
        user_id: user.id,
        message,
        is_pinned: false,
        is_deleted: false,
      })
      .select("id, created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: inserted?.id, created_at: inserted?.created_at });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
