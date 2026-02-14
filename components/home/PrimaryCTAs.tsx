'use client';

import Link from 'next/link';
import { Download, TrendingUp } from 'lucide-react';
import { useDeadlinePicks } from '@/hooks/useDeadlinePicks';

const TOSS = {
  blue: '#3182f6',
  card: '#ffffff',
  text: '#191f28',
  secondary: '#6b7684',
} as const;

/** 로그인 유저용 다음 행동 CTA: 현금 충전, 수익권 둘러보기 */
export default function PrimaryCTAs({ enabled = true }: { enabled?: boolean }) {
  const { items: deadlineItems } = useDeadlinePicks(enabled);
  const urgentCount = deadlineItems.length;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/wallet/deposit"
          className="rounded-2xl p-4 flex items-center gap-3 transition active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2"
          style={{ backgroundColor: TOSS.blue, color: TOSS.card, boxShadow: '0 4px 12px rgba(49,130,246,0.35)' }}
        >
          <Download size={29} strokeWidth={2} aria-hidden />
          <div className="text-left">
            <div className="text-[15px] font-bold">현금 충전</div>
            <div className="text-[12px] opacity-90">KRW 입금</div>
          </div>
        </Link>
        <Link
          href="/market"
          className="rounded-2xl p-4 flex items-center gap-3 transition active:scale-[0.98] border border-black/5 focus:outline-none focus:ring-2 focus:ring-[var(--toss-blue)] focus:ring-offset-2"
          style={{ backgroundColor: TOSS.card, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        >
          <TrendingUp size={29} strokeWidth={2} aria-hidden />
          <div className="text-left">
            <div className="text-[15px] font-bold" style={{ color: TOSS.text }}>수익권 둘러보기</div>
            <div className="text-[12px]" style={{ color: TOSS.secondary }}>수익권 투자</div>
          </div>
        </Link>
      </div>
      <p className="text-[11px] text-center" style={{ color: TOSS.secondary }}>
        마감임박 {urgentCount}건
      </p>
    </div>
  );
}
