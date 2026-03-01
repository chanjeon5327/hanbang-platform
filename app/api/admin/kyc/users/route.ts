import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/utils/supabase/admin';
import { requireAdmin } from '@/lib/admin/requireAdmin';

/**
 * GET /api/admin/kyc/users - profiles.status === 'KYC_SUBMITTED' (KYC 대기 큐)
 * kyc_verification 데이터 포함 (이름, 휴대폰, 생년월일, 제출일)
 */
export async function GET() {
  try {
    await requireAdmin();

    const admin = getAdminSupabase();

    const { data: profiles, error } = await (admin as any)
      .from('profiles')
      .select('id, email, status')
      .eq('status', 'KYC_SUBMITTED');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const list = (profiles ?? []) as { id: string; email: string | null; status: string }[];
    const userIds = list.map((p) => p.id);

    let verifications: Record<string, { real_name?: string; phone?: string; birth_date?: string; submitted_at?: string }> = {};
    if (userIds.length > 0) {
      const { data: kycRows } = await (admin as any)
        .from('kyc_verifications')
        .select('user_id, real_name, phone, birth_date, submitted_at')
        .in('user_id', userIds);
      (kycRows ?? []).forEach((r: { user_id: string; real_name?: string; phone?: string; birth_date?: string; submitted_at?: string }) => {
        verifications[r.user_id] = {
          real_name: r.real_name,
          phone: r.phone,
          birth_date: r.birth_date,
          submitted_at: r.submitted_at,
        };
      });
    }

    const users = list.map((p) => ({
      id: p.id,
      email: p.email ?? '(이메일 없음)',
      kyc_status: 'PENDING',
      user_status: p.status,
      real_name: verifications[p.id]?.real_name ?? '-',
      phone: verifications[p.id]?.phone ?? null,
      birth_date: verifications[p.id]?.birth_date ?? null,
      submitted_at: verifications[p.id]?.submitted_at ?? null,
    }));

    return NextResponse.json({ users });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
