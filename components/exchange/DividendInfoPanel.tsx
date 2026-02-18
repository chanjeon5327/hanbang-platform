/**
 * DividendInfoPanel — 배당 일정 표시
 * HANBANG Design V1: 통일된 카드/토큰
 */
'use client';

import { useEffect, useState } from 'react';
import { Banknote } from 'lucide-react';
import { formatKrw } from '@/lib/utils/format';
import { HBChip } from '@/components/ui/HBChip';
import type { CorporateActionDividend } from '@/lib/types/financial';

export default function DividendInfoPanel({ assetId }: { assetId: string }) {
  const [action, setAction] = useState<CorporateActionDividend | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/exchange/dividend-info/${assetId}`, { cache: 'no-store' });
        if (!res.ok) return;
        const d = await res.json();
        if (d.action) setAction(d.action);
      } catch { /* ignore */ }
    })();
  }, [assetId]);

  if (!action) return null;

  return (
    <div className="rounded-[var(--radius-base)] border" style={{ backgroundColor: 'rgba(245,158,11,0.04)', borderColor: 'rgba(245,158,11,0.2)', padding: 'var(--space-md)' }}>
      <div className="flex items-center gap-2 mb-2">
        <Banknote size={16} style={{ color: '#D97706' }} />
        <span className="caption font-semibold" style={{ color: '#92400E' }}>배당 예정</span>
        <HBChip tone="amber" size="sm" className="ml-auto">{action.status}</HBChip>
      </div>
      <div className="grid grid-cols-2 gap-2 caption">
        <div><span style={{ color: '#D97706' }}>배당락일</span> <span className="font-medium" style={{ color: '#78350F' }}>{action.ex_date}</span></div>
        <div><span style={{ color: '#D97706' }}>기준일</span> <span className="font-medium" style={{ color: '#78350F' }}>{action.record_date}</span></div>
        <div><span style={{ color: '#D97706' }}>지급일</span> <span className="font-medium" style={{ color: '#78350F' }}>{action.pay_date}</span></div>
        <div><span style={{ color: '#D97706' }}>주당배당</span> <span className="font-medium metric-number" style={{ color: '#78350F' }}>{formatKrw(action.amount_per_share)}</span></div>
      </div>
    </div>
  );
}
