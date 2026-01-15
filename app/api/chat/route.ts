import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// env
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function sb() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  });
}

/* =======================
   GET
======================= */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const room_key = searchParams.get("room_key");

    if (!room_key) {
      return NextResponse.json(
        { error: "room_key is required" },
        { status: 400 }
      );
    }

    const client = sb();

    const { data, error } = await client
      .from("chat_messages_v2")
      .select("id, room_key, sender, text, created_at")
      .eq("room_key", room_key)
      .order("created_at", { ascending: true })
      .limit(200);

    if (error) throw error;

    const rows =
      data?.map((r) => ({
        id: r.id,
        room_key: r.room_key,
        sender_label: r.sender,
        message: r.text,
        created_at: r.created_at,
      })) ?? [];

    return NextResponse.json({ data: rows }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "unknown" },
      { status: 500 }
    );
  }
}

/* =======================
   POST
======================= */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { room_key, message, sender } = body;

    if (!room_key || !message || !sender) {
      return NextResponse.json(
        { error: "room_key, message, sender are required" },
        { status: 400 }
      );
    }

    const productNo = Number(room_key.split(":")[1]);
    if (!productNo) {
      return NextResponse.json(
        { error: "invalid room_key format" },
        { status: 400 }
      );
    }

    const client = sb();

    const { error } = await client
      .from("chat_messages_v2")
      .insert({
        product_no: productNo,
        room_key,
        text: message,
        sender,
        ts: Date.now(), // ⭐ 이 줄 추가
      });
      

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "unknown" },
      { status: 500 }
    );
  }
}
