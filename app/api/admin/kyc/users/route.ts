import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server';
import { requireAdmin } from '@/lib/admin/requireAdmin';

/**
 * GET /api/admin/kyc/users - profiles.status === 'KYC_SUBMITTED' (KYC ?? ??)
 */
export async function GET() {
  try {
    await requireAdmin();

    const admin = createAdminClient();

    const { data: profiles, error } = await (admin as any)
      .from('profiles')
      .select('id, email, status')
      .eq('status', 'KYC_SUBMITTED');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const list = (profiles ?? []) as { id: string; email: string | null; status: string }[];
    const users = list.map((p) => ({
      id: p.id,
      email: p.email ?? '(??? ??)',
      kyc_status: 'PENDING',
      user_status: p.status,
    }));

    return NextResponse.json({ users });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
