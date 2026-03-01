import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireActiveUser } from '@/lib/auth/requireActiveUser';
import { requireKycApproved } from '@/lib/kyc/requireKycApproved';

/**
 * GET /api/wallet/ledger
 * - 로그인 + KYC 승인 필수
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.', entries: [] }, { status: 401 });
  }
  const kycCheck = await requireKycApproved(supabase, user.id);
  if (!kycCheck.approved) return kycCheck.response;

  try {
    await requireActiveUser(user.id);
  } catch {
    return NextResponse.json({ error: '이 계정은 이용이 제한되었습니다.', entries: [] }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('ledger_entries')
    .select('id, order_id, entry_type, currency, amount, asset_id, quantity, memo, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message, entries: [] }, { status: 500 });
  }

  return NextResponse.json({ entries: data ?? [] });
}
