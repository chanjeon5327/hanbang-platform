import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/utils/supabase/server';

/**
 * GET /api/wallet/balance
 * - ledger_entries 합계 기반 cashBalance 반환
 * - CASH_CREDIT: 입금, CASH_DEBIT: 출금
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
