import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const { data } = await (supabase as any)
      .from("user_consents")
      .select("terms_version, marketing_opt_in, risk_terms_accepted_at, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    return NextResponse.json({ consents: data ?? [] });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const termsVersion = body.terms_version ?? "v1";
    const marketingOptIn = Boolean(body.marketing_opt_in);
    const riskTermsAccepted = body.risk_terms_accepted_at ? new Date(body.risk_terms_accepted_at).toISOString() : new Date().toISOString();

    const { data, error } = await (supabase as any)
      .from("user_consents")
      .upsert(
        {
          user_id: user.id,
          terms_version: termsVersion,
          marketing_opt_in: marketingOptIn,
          risk_terms_accepted_at: riskTermsAccepted,
        },
        { onConflict: "user_id,terms_version" }
      )
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
