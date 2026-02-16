import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server';
import { requireAdmin } from '@/lib/admin/requireAdmin';

const VALID_STATUS = ['APPROVED', 'REJECTED'] as const;

/**
 * GET /api/admin/kyc/users/[id] - KYC 상세 (관리자)
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: profile } = await admin.from('profiles').select('id, email, status').eq('id', id).single();
    const { data: invProfile } = await (admin as any).from('investor_profiles').select('*').eq('user_id', id).single();
    const { data: kycVerification } = await (admin as any).from('kyc_verifications').select('*').eq('user_id', id).single();

    return NextResponse.json({
      profile: profile ?? null,
      investor_profile: invProfile ?? null,
      kyc_verification: kycVerification ?? null,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/kyc/users/[id] - investor_profiles.kyc_status + profiles.status 업데이트
 * - rejection_reason 기록 (REJECTED 시)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await requireAdmin();

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const status = body.kyc_status;
    const rejection_reason = body.rejection_reason ?? null;

    if (!status || !VALID_STATUS.includes(status)) {
      return NextResponse.json(
        { error: 'kyc_status must be APPROVED or REJECTED' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // investor_profiles 업데이트
    const { data: invData, error: invError } = await (admin as any)
      .from('investor_profiles')
      .update({ kyc_status: status, updated_at: new Date().toISOString() })
      .eq('user_id', id)
      .select('user_id, kyc_status')
      .single();

    if (invError) {
      return NextResponse.json({ error: invError.message }, { status: 500 });
    }
    if (!invData) {
      return NextResponse.json({ error: 'investor profile not found' }, { status: 404 });
    }

    // kyc_verifications 업데이트 (rejection_reason, reviewed_at)
    await (admin as any)
      .from('kyc_verifications')
      .update({
        status: status === 'APPROVED' ? 'approved' : 'rejected',
        rejection_reason: status === 'REJECTED' ? rejection_reason : null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminUser.id,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', id);

    // profiles.status 업데이트
    const nextStatus = status === 'APPROVED' ? 'ONBOARDING_REQUIRED' : 'KYC_REQUIRED';
    await (admin as any)
      .from('profiles')
      .update({ status: nextStatus, updated_at: new Date().toISOString() })
      .eq('id', id);

    return NextResponse.json({ user: invData, next_status: nextStatus });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
