import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/utils/supabase/admin';
import { requireAdmin } from '@/lib/admin/requireAdmin';

type KycStatus = 'NOT_STARTED' | 'PENDING' | 'APPROVED' | 'REJECTED';

/**
 * GET /api/admin/kyc/users
 * ?status=pending|rejected|approved|all (기본: pending)
 * - pending: 확인 중 (KYC 제출 대기)
 * - rejected: 보완 필요 (반려됨)
 * - approved: 완료 (승인됨)
 * - all: 전체
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const statusParam = (req.nextUrl.searchParams.get('status') || 'pending').toLowerCase();
    const admin = getAdminSupabase();

    const profileMap: Record<string, { id: string; email: string | null; status: string }> = {};
    const userIds: string[] = [];

    if (statusParam === 'pending' || statusParam === 'all') {
      const { data: pending } = await (admin as any)
        .from('profiles')
        .select('id, email, status')
        .eq('status', 'KYC_SUBMITTED');
      (pending ?? []).forEach((p: { id: string; email: string | null; status: string }) => {
        profileMap[p.id] = p;
        userIds.push(p.id);
      });
    }

    if (statusParam === 'rejected' || statusParam === 'approved' || statusParam === 'all') {
      const filterStatus = statusParam === 'all' ? ['APPROVED', 'REJECTED'] : [statusParam === 'rejected' ? 'REJECTED' : 'APPROVED'];
      const { data: invProfiles } = await (admin as any)
        .from('investor_profiles')
        .select('user_id, kyc_status')
        .in('kyc_status', filterStatus);
      const ids = (invProfiles ?? []).map((ip: { user_id: string }) => ip.user_id);
      if (ids.length > 0) {
        const { data: profs } = await (admin as any)
          .from('profiles')
          .select('id, email, status')
          .in('id', ids);
        (profs ?? []).forEach((p: { id: string; email: string | null; status: string }) => {
          profileMap[p.id] = p;
          if (!userIds.includes(p.id)) userIds.push(p.id);
        });
      }
    }

    const uniqueIds = [...new Set(userIds)];
    let verifications: Record<string, { real_name?: string; phone?: string; birth_date?: string; submitted_at?: string; status?: string; rejection_reason?: string }> = {};
    let invMap: Record<string, string> = {};

    if (uniqueIds.length > 0) {
      const { data: kycRows } = await (admin as any)
        .from('kyc_verifications')
        .select('user_id, real_name, phone, birth_date, submitted_at, status, rejection_reason')
        .in('user_id', uniqueIds);
      (kycRows ?? []).forEach((r: { user_id: string; real_name?: string; phone?: string; birth_date?: string; submitted_at?: string; status?: string; rejection_reason?: string }) => {
        verifications[r.user_id] = {
          real_name: r.real_name,
          phone: r.phone,
          birth_date: r.birth_date,
          submitted_at: r.submitted_at,
          status: r.status,
          rejection_reason: r.rejection_reason ?? undefined,
        };
      });
      const { data: invRows } = await (admin as any)
        .from('investor_profiles')
        .select('user_id, kyc_status')
        .in('user_id', uniqueIds);
      (invRows ?? []).forEach((ip: { user_id: string; kyc_status: string }) => {
        invMap[ip.user_id] = ip.kyc_status ?? 'PENDING';
      });
    }

    function resolveStatus(id: string): KycStatus {
      const p = profileMap[id];
      const inv = invMap[id] ?? '';
      const ver = verifications[id]?.status ?? '';
      const ps = p?.status ?? '';
      if (inv === 'APPROVED' || String(ver).toLowerCase().includes('approved')) return 'APPROVED';
      if (inv === 'REJECTED' || String(ver).toLowerCase().includes('reject')) return 'REJECTED';
      if (ps === 'KYC_SUBMITTED' || String(ver).toLowerCase().includes('submitted')) return 'PENDING';
      return 'NOT_STARTED';
    }

    const users = uniqueIds
      .map((id) => {
        const p = profileMap[id];
        const resolved = resolveStatus(id);
        if (statusParam === 'pending' && resolved !== 'PENDING') return null;
        if (statusParam === 'rejected' && resolved !== 'REJECTED') return null;
        if (statusParam === 'approved' && resolved !== 'APPROVED') return null;
        return {
          id,
          email: p?.email ?? '(이메일 없음)',
          kyc_status: resolved,
          user_status: p?.status ?? '',
          real_name: verifications[id]?.real_name ?? '-',
          phone: verifications[id]?.phone ?? null,
          birth_date: verifications[id]?.birth_date ?? null,
          submitted_at: verifications[id]?.submitted_at ?? null,
          rejection_reason: verifications[id]?.rejection_reason ?? null,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ users });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
