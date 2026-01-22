import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const body = await req.json();

  const { error, data } = await supabaseAdmin
    .from("ledger_events")
    .insert(body);

  if (error) {
    console.error("LEDGER INSERT ERROR:", error);
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data });
}
