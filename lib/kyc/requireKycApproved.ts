import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * investor_profiles.kyc_status가 APPROVED인지 확인
 * @returns { approved: true } | { approved: false, response: NextResponse }
 */
export async function requireKycApproved(
  supabase: SupabaseClient,
  userId: string
): Promise<
  | { approved: true }
  | { approved: false; response: NextResponse }
> {
  const { data } = await (supabase as any)
    .from('investor_profiles')
    .select('kyc_status')
    .eq('user_id', userId)
    .single();

  const status = (data?.kyc_status as string)?.toUpperCase();
  if (status === 'APPROVED') {
    return { approved: true };
  }

  return {
    approved: false,
    response: NextResponse.json(
      { ok: false, code: 'KYC_REQUIRED', message: 'KYC required', error: 'KYC_REQUIRED' },
      { status: 403 }
    ),
  };
}
