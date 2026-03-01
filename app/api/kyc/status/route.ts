import { NextResponse } from "next/server";
import { getServerSupabase } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await getServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const { data: invProfile } = await (supabase as any)
      .from("investor_profiles")
      .select("kyc_status, kyc_level, investment_limit")
      .eq("user_id", user.id)
      .single();

    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select("status")
      .eq("id", user.id)
      .single();

    const { data: kycVerification } = await (supabase as any)
      .from("kyc_verifications")
      .select("id, status, rejection_reason, submitted_at")
      .eq("user_id", user.id)
      .single();

    const { data: submissions } = await (supabase as any)
      .from("kyc_submissions")
      .select("id, step, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    return NextResponse.json({
      user_status: profile?.status ?? "NEW",
      kyc_status: invProfile?.kyc_status ?? "PENDING",
      kyc_level: invProfile?.kyc_level ?? "NONE",
      investment_limit: Number(invProfile?.investment_limit ?? 50000000),
      verification: kycVerification ?? null,
      submissions: submissions ?? [],
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
