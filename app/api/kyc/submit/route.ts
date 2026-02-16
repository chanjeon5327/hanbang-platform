import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/kyc/submit
 * - kyc_verifications upsert (real_name, phone, id_card URLs 등)
 * - profiles.status → KYC_SUBMITTED
 * - kyc_submissions 이력
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const {
      real_name,
      birth_date,
      phone,
      address,
      id_card_front_url,
      id_card_back_url,
      selfie_url,
    } = body;

    if (!real_name || typeof real_name !== 'string' || real_name.trim().length < 2) {
      return NextResponse.json({ error: "실명을 입력해주세요." }, { status: 400 });
    }

    const { error: kycError } = await (supabase as any)
      .from("kyc_verifications")
      .upsert(
        {
          user_id: user.id,
          real_name: String(real_name).trim(),
          birth_date: birth_date || null,
          phone: phone || null,
          address: address || null,
          id_card_front_url: id_card_front_url || null,
          id_card_back_url: id_card_back_url || null,
          selfie_url: selfie_url || null,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (kycError) {
      return NextResponse.json({ error: kycError.message }, { status: 500 });
    }

    // profiles.status → KYC_SUBMITTED
    await (supabase as any)
      .from("profiles")
      .update({ status: 'KYC_SUBMITTED', updated_at: new Date().toISOString() })
      .eq('id', user.id);

    // kyc_submissions 이력
    await (supabase as any)
      .from("kyc_submissions")
      .insert({
        user_id: user.id,
        step: 'kyc_submit',
        status: 'submitted',
        payload_json: { real_name, phone },
      });

    return NextResponse.json({ ok: true, success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
