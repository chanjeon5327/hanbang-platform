/**
 * DividendInfoPanel — 배당 일정 표시
 */
'use client';

import { useEffect, useState } from 'react';
import { Banknote } from 'lucide-react';
import { formatKrw } from '@/lib/utils/format';
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
    <div className="rounded-2xl border p-4" style={{ backgroundColor: '#fffbeb', borderColor: '#fde68a' }}>
      <div className="flex items-center gap-2 mb-2">
        <Banknote size={16} className="text-amber-600" />
        <span className="text-xs font-semibold text-amber-800">배당 예정</span>
        <span className="text-xs px-1.5 py-0.5 rounded bg-amber-200 text-amber-800 font-medium ml-auto">
          {action.status}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div><span className="text-amber-600">배당락일</span> <span className="font-medium text-amber-900">{action.ex_date}</span></div>
        <div><span className="text-amber-600">기준일</span> <span className="font-medium text-amber-900">{action.record_date}</span></div>
        <div><span className="text-amber-600">지급일</span> <span className="font-medium text-amber-900">{action.pay_date}</span></div>
        <div><span className="text-amber-600">주당배당</span> <span className="font-medium text-amber-900">{formatKrw(action.amount_per_share)}</span></div>
      </div>
    </div>
  );
}
