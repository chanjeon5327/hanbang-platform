'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Shield, DollarSign, Search, FileText } from 'lucide-react';
import { HBCard } from '@/components/ui/HBCard';
import HBSkeleton from '@/components/ui/HBSkeleton';

type Batch = { id: string; settlement_date: string; status: string };

const NAV_ITEMS = [
  { href: '/admin/creators',     icon: Users,     label: '크리에이터 관리', desc: '승인 및 정산 현황 확인' },
  { href: '/admin/kyc',          icon: Shield,    label: 'KYC 관리',       desc: '사용자 KYC 처리' },
  { href: '/admin/settlement',   icon: DollarSign, label: '정산 관리',      desc: '정산 배치 확인' },
  { href: '/admin/forensic',     icon: Search,    label: '포렌식 감사',     desc: '원장 무결성 검사' },
  { href: '/admin/audit-logins', icon: FileText,  label: '로그인 감사',     desc: 'AUTH Phase-2 · 보안 로그' },
];

export default function AdminHubPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/settlement/batches', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { batches: [] }))
      .then((d) => setBatches(d.batches ?? []))
      .catch(() => setBatches([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl space-y-8">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
        관리자 허브
      </h1>

      {/* 내비게이션 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {NAV_ITEMS.map(({ href, icon: Icon, label, desc }) => (
          <Link key={href} href={href}>
            <HBCard variant="default" hover className="flex items-center gap-3">
              <div
                className="p-2 rounded-xl flex-shrink-0"
                style={{ background: 'rgba(59,130,246,0.1)' }}
              >
                <Icon size={22} style={{ color: 'var(--royal-blue)' }} />
              </div>
              <div>
                <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{desc}</div>
              </div>
            </HBCard>
          </Link>
        ))}
      </div>

      {/* 최근 정산 배치 */}
      <HBCard variant="elevated">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            최근 정산
          </h2>
          <Link href="/admin/settlement" className="text-sm font-semibold" style={{ color: 'var(--royal-blue)' }}>
            전체 보기
          </Link>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <HBSkeleton key={i} variant="text" h={20} />)}
          </div>
        ) : batches.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>정산 배치 없음</p>
        ) : (
          <div className="space-y-2">
            {batches.map((s) => (
              <Link
                key={s.id}
                href={`/admin/settlement/${s.id}`}
                className="flex justify-between items-center p-3 rounded-xl hover:opacity-80 transition"
                style={{ background: 'var(--bg-secondary)' }}
              >
                <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                  {s.settlement_date}
                </span>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: s.status === 'CONFIRMED' ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)',
                    color: s.status === 'CONFIRMED' ? 'var(--accent-gain)' : '#d97706',
                  }}
                >
                  {s.status === 'CONFIRMED' ? '확정' : '대기'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </HBCard>
    </div>
  );
}
