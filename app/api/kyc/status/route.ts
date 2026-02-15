import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const { data: profile } = await (supabase as any)
      .from("investor_profiles")
      .select("kyc_status, kyc_level, investment_limit")
      .eq("user_id", user.id)
      .single();

    const { data: submissions } = await (supabase as any)
      .from("kyc_submissions")
      .select("id, step, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    return NextResponse.json({
      kyc_status: profile?.kyc_status ?? "PENDING",
      kyc_level: profile?.kyc_level ?? "NONE",
      investment_limit: Number(profile?.investment_limit ?? 50000000),
      submissions: submissions ?? [],
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
