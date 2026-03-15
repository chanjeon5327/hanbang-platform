import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * investor_profiles.kyc_status가 APPROVED인지 확인
 * @returns { approved: true } | { approved: false, response: NextResponse }
 *
 * 개발 환경(NODE_ENV === 'development')에서는 DB 조회 없이 항상 통과.
 * NODE_ENV는 Next.js 빌드 시점에 확정되므로 프로덕션 빌드에 영향 없음.
 */
export async function requireKycApproved(
  supabase: SupabaseClient,
  userId: string
): Promise<
  | { approved: true }
  | { approved: false; response: NextResponse }
> {
  if (process.env.NODE_ENV === 'development') {
    return { approved: true };
  }

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
