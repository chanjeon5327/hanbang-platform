import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/server";

/** 공개 프로필 조회 - nickname, avatar_url 등 최소 필드만 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, nickname, avatar_url, display_name, role")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({
        id,
        nickname: "Unknown",
        avatar_url: null,
        display_name: "익명",
        role: "USER",
      }, { status: 200 });
    }

    return NextResponse.json({
      id: data.id,
      nickname: data.nickname ?? data.display_name ?? "Unknown",
      avatar_url: data.avatar_url ?? null,
      display_name: data.display_name ?? "익명",
      role: data.role ?? "USER",
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
