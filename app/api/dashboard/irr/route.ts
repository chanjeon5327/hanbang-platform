import { NextResponse } from "next/server";
import { getServerSupabase } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const { data, error } = await supabase.rpc("rpc_calculate_irr", { p_user_id: user.id });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const r = data as { ok?: boolean; irr?: number; total_invested?: number; current_value?: number; total_dividend?: number };
    return NextResponse.json({
      ok: r?.ok,
      irr: r?.irr ?? 0,
      total_invested: r?.total_invested ?? 0,
      current_value: r?.current_value ?? 0,
      total_dividend: r?.total_dividend ?? 0,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
