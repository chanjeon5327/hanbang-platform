'use client';

import Link from 'next/link';
import { Download, TrendingUp } from 'lucide-react';
import { useDeadlinePicks } from '@/hooks/useDeadlinePicks';

const ROYAL = {
  blue: 'var(--royal-blue)',
  card: 'var(--card)',
  text: 'var(--text)',
  secondary: 'var(--text-secondary)',
} as const;

/** 로그인 유저용 다음 행동 CTA: 현금 충전, 수익권 둘러보기 (투자 대시보드) */
export default function PrimaryCTAs({ enabled = true }: { enabled?: boolean }) {
  const { items: deadlineItems } = useDeadlinePicks(enabled);
  const urgentCount = deadlineItems.length;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/wallet/deposit"
          className="rounded-[16px] p-4 flex items-center gap-3 tap-scale focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2"
          style={{ backgroundColor: ROYAL.blue, color: ROYAL.card, boxShadow: 'var(--shadow-royal)' }}
        >
          <Download size={29} strokeWidth={2} aria-hidden />
          <div className="text-left">
            <div className="body font-bold">현금 충전</div>
            <div className="caption opacity-90">KRW 입금</div>
          </div>
        </Link>
        <Link
          href="/market"
          className="rounded-[16px] p-4 flex items-center gap-3 tap-scale border focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)] focus:ring-offset-2"
          style={{ backgroundColor: ROYAL.card, borderColor: 'var(--border)', boxShadow: 'var(--shadow-sm)' }}
        >
          <TrendingUp size={29} strokeWidth={2} aria-hidden />
          <div className="text-left">
            <div className="body font-bold" style={{ color: ROYAL.text }}>수익권 둘러보기</div>
            <div className="caption" style={{ color: ROYAL.secondary }}>매수하기</div>
          </div>
        </Link>
      </div>
      <p className="caption text-center" style={{ color: ROYAL.secondary }}>
        마감임박 {urgentCount}건
      </p>
    </div>
  );
}
