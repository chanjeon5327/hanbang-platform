import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/utils/supabase/admin';
import { requireAdmin } from '@/lib/admin/requireAdmin';

/**
 * GET /api/admin/users/list - 가입자 목록 (가입 방식, 온보딩 완료, 선호 카테고리)
 * 관리자 전용
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const limit = Math.min(100, Math.max(10, Number(req.nextUrl.searchParams.get('limit')) || 50));
    const offset = Math.max(0, Number(req.nextUrl.searchParams.get('offset')) || 0);
    const q = (req.nextUrl.searchParams.get('q') || '').trim().toLowerCase();

    const admin = getAdminSupabase();

    // profiles 조회 (signup_method, onboarding_completed 포함)
    const { data: profiles, error: profError } = await (admin as any)
      .from('profiles')
      .select('id, email, display_name, nickname, status, signup_method, onboarding_completed, created_at')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (profError) {
      return NextResponse.json({ error: profError.message }, { status: 500 });
    }

    const list = profiles ?? [];
    const userIds = list.map((p: { id: string }) => p.id);

    // user_onboarding_status 조회 (preference_summary 포함)
    let onboardingMap: Record<string, { completed_at?: string; skipped?: boolean; preference_summary?: Record<string, unknown> }> = {};
    if (userIds.length > 0) {
      const { data: statuses } = await (admin as any)
        .from('user_onboarding_status')
        .select('user_id, completed_at, skipped, preference_summary')
        .in('user_id', userIds);
      (statuses ?? []).forEach((s: { user_id: string; completed_at?: string; skipped?: boolean; preference_summary?: Record<string, unknown> }) => {
        onboardingMap[s.user_id] = {
          completed_at: s.completed_at,
          skipped: s.skipped,
          preference_summary: s.preference_summary ?? {},
        };
      });
    }

    // investor_profiles + kyc_verifications 조회 (KYC 상태)
    const kycMap: Record<string, { inv_status?: string; verification_status?: string; rejection_reason?: string }> = {};
    if (userIds.length > 0) {
      const { data: invProfiles } = await (admin as any)
        .from('investor_profiles')
        .select('user_id, kyc_status')
        .in('user_id', userIds);
      const { data: kycVerifications } = await (admin as any)
        .from('kyc_verifications')
        .select('user_id, status, rejection_reason')
        .in('user_id', userIds);

      (invProfiles ?? []).forEach((ip: { user_id: string; kyc_status?: string }) => {
        kycMap[ip.user_id] = { ...kycMap[ip.user_id], inv_status: ip.kyc_status ?? 'PENDING' };
      });
      (kycVerifications ?? []).forEach((kv: { user_id: string; status?: string; rejection_reason?: string }) => {
        kycMap[kv.user_id] = {
          ...kycMap[kv.user_id],
          verification_status: kv.status ?? '',
          rejection_reason: kv.rejection_reason ?? kycMap[kv.user_id]?.rejection_reason,
        };
      });
    }

    function parseKycStatus(invStatus: string, verificationStatus: string, profileStatus: string): string {
      const inv = String(invStatus ?? '').toLowerCase();
      const ver = String(verificationStatus ?? '').toLowerCase();
      const ps = String(profileStatus ?? '').toUpperCase();
      if (inv.includes('approved')) return 'APPROVED';
      if (inv.includes('reject') || inv.includes('denied') || ver.includes('reject') || ver.includes('denied')) return 'REJECTED';
      if (inv.includes('pending') || ver.includes('submitted') || ver.includes('in_review') || ps === 'KYC_SUBMITTED') return 'PENDING';
      return 'NOT_STARTED';
    }

    const items = list
      .map((p: { id: string; email?: string; display_name?: string; nickname?: string; status?: string; signup_method?: string; onboarding_completed?: boolean; created_at?: string }) => {
        const ob = onboardingMap[p.id] ?? {};
        const pref = (ob.preference_summary ?? {}) as { preferred_categories?: string[]; round_completed?: number; rated_count?: number };
        const kyc = kycMap[p.id] ?? {};
        const kycStatus = parseKycStatus(kyc.inv_status ?? '', kyc.verification_status ?? '', p.status ?? '');
        return {
          id: p.id,
          email: p.email ?? '',
          name: p.display_name ?? p.nickname ?? '-',
          status: p.status ?? 'NEW',
          signup_method: p.signup_method ?? 'email',
          onboarding_completed: p.onboarding_completed === true,
          created_at: p.created_at,
          kyc_status: kycStatus,
          kyc_reason: kyc.rejection_reason ?? undefined,
          onboarding: {
            completed_at: ob.completed_at ?? null,
            skipped: ob.skipped ?? false,
            preferred_categories: pref.preferred_categories ?? [],
            round_completed: pref.round_completed ?? 0,
            rated_count: pref.rated_count ?? 0,
          },
        };
      })
      .filter((u: { email: string; name: string }) => {
        if (!q) return true;
        return (
          (u.email ?? '').toLowerCase().includes(q) ||
          (u.name ?? '').toLowerCase().includes(q)
        );
      });

    return NextResponse.json({ users: items });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
