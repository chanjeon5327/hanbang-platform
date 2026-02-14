'use client';

import { useState } from 'react';
import { HelpCircle } from 'lucide-react';

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
  sharePriceUsd,
  fxRate = 1350,
}: Props) {
  const [showHelp, setShowHelp] = useState(false);

  const rateText = dividendMonthlyRate != null ? `${dividendMonthlyRate}%` : null;
  const usdText = dividendMonthlyUsdPerShare != null ? `$${dividendMonthlyUsdPerShare.toFixed(4)}/주` : null;
  const krwText = dividendMonthlyUsdPerShare != null && fxRate ? `₩${Math.round(dividendMonthlyUsdPerShare * fxRate).toLocaleString()}/주` : null;

  return (
    <div className="py-4" style={{ borderBottom: '1px solid var(--upbit-border)' }}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[14px] font-bold" style={{ color: 'var(--upbit-text)' }}>배당 정보</h3>
        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="p-1 rounded-full"
          style={{ color: 'var(--upbit-text-dim)' }}
          aria-label="배당 안내"
        >
          <HelpCircle size={18} />
        </button>
      </div>
      <div className="space-y-1 text-[13px]">
        <div className="flex justify-between">
          <span style={{ color: 'var(--upbit-text-dim)' }}>정산일</span>
          <span className="font-semibold tabular-nums" style={{ color: 'var(--upbit-text)' }}>매월 {payoutDay}일</span>
        </div>
        {rateText && (
          <div className="flex justify-between">
            <span style={{ color: 'var(--upbit-text-dim)' }}>월 배당률</span>
            <span className="font-semibold tabular-nums" style={{ color: 'var(--upbit-positive)' }}>{rateText}</span>
          </div>
        )}
        {usdText && (
          <div className="flex justify-between">
            <span style={{ color: 'var(--upbit-text-dim)' }}>월 배당금 (USD)</span>
            <span className="font-semibold tabular-nums" style={{ color: 'var(--upbit-text)' }}>{usdText}</span>
          </div>
        )}
        {krwText && (
          <div className="flex justify-between">
            <span style={{ color: 'var(--upbit-text-dim)' }}>월 배당금 (KRW)</span>
            <span className="font-semibold tabular-nums" style={{ color: 'var(--upbit-text)' }}>{krwText}</span>
          </div>
        )}
      </div>
      {showHelp && (
        <div className="mt-3 p-3 rounded-lg text-[12px]" style={{ backgroundColor: 'rgba(0,0,0,0.04)', color: 'var(--upbit-text-dim)' }}>
          <p>· 기준일: 매월 말일 23:59:59 보유자 기준</p>
          <p>· 정산일: 매월 {payoutDay}일 지급</p>
          <p>· 실제 수익은 콘텐츠 성과에 따라 변동될 수 있습니다.</p>
        </div>
      )}
    </div>
  );
}
