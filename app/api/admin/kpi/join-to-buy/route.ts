import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function GET() {
  await requireAdmin();

  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from("v_join_to_buy_7d")
    .select("*")
    .order("conversion_rate_7d", { ascending: false });

  if (error) {
    return NextResponse.json({ ok:false, error:error.message }, { status:500 });
  }

  return NextResponse.json({ ok:true, data });
}
