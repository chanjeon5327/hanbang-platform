import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("v_join_to_buy_7d")
    .select("*")
    .order("conversion_rate_7d", { ascending: false });

  if (error) {
    return NextResponse.json({ ok:false, error:error.message }, { status:500 });
  }

  return NextResponse.json({ ok:true, data });
}
