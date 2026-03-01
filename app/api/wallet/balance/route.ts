import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/utils/supabase/server';
import { requireKycApproved } from '@/lib/kyc/requireKycApproved';

/**
 * GET /api/wallet/balance
 * - ledger_entries 합계 기반 cashBalance 반환
 * - 로그인 + KYC 승인 필수
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });
  }
  const kycCheck = await requireKycApproved(supabase, user.id);
  if (!kycCheck.approved) return kycCheck.response;

  const { data } = await supabase
    .from('ledger_entries')
    .select('*')
    .eq('user_id', user.id);

  const cashBalance =
    (data ?? []).reduce((a, r) => {
      if (r.entry_type === 'CASH_CREDIT') return a + Number(r.amount ?? 0);
      if (r.entry_type === 'CASH_DEBIT') return a - Math.abs(Number(r.amount ?? 0));
      return a;
    }, 0);

  return NextResponse.json({ ok: true, cashBalance });
}
