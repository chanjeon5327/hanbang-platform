'use client';

import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import MetricRow from '@/components/ui/MetricRow';
import Divider from '@/components/ui/Divider';

type Props = {
  payoutDay?: number;
  dividendMonthlyRate?: number | null;
  dividendMonthlyUsdPerShare?: number | null;
  sharePriceUsd?: number | null;
  fxRate?: number;
};

export default function DividendInfo({
  payoutDay = 3,
  dividendMonthlyRate,
  dividendMonthlyUsdPerShare,
  fxRate = 1350,
}: Props) {
  const [showHelp, setShowHelp] = useState(false);

  const rateText = dividendMonthlyRate != null ? `${dividendMonthlyRate}%` : null;
  const usdText = dividendMonthlyUsdPerShare != null ? `$${dividendMonthlyUsdPerShare.toFixed(4)}/주` : null;
  const krwText = dividendMonthlyUsdPerShare != null && fxRate ? `₩${Math.round(dividendMonthlyUsdPerShare * fxRate).toLocaleString()}/주` : null;

  const items: { label: string; value: string; tone?: 'default' | 'muted' | 'positive' | 'negative' }[] = [
    { label: '정산일', value: `매월 ${payoutDay}일` },
    ...(rateText ? [{ label: '월 배당률', value: rateText, tone: 'positive' as const }] : []),
    ...(usdText ? [{ label: '월 배당금 (USD)', value: usdText }] : []),
    ...(krwText ? [{ label: '월 배당금 (KRW)', value: krwText }] : []),
  ];

  return (
    <div className="py-4">
      <Divider />
      <div className="pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="body-sm font-bold" style={{ color: 'var(--text)' }}>배당 정보</h3>
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="p-1 rounded-full"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="배당 안내"
          >
            <HelpCircle size={18} />
          </button>
        </div>
        <MetricRow items={items} columns={2} dense />
      {showHelp && (
        <div className="mt-3 p-3 rounded-xl caption" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
          <p>· 기준일: 매월 말일 23:59:59 보유자 기준</p>
          <p>· 정산일: 매월 {payoutDay}일 지급</p>
          <p>· 실제 수익은 콘텐츠 성과에 따라 변동될 수 있습니다.</p>
        </div>
      )}
      </div>
    </div>
  );
}
