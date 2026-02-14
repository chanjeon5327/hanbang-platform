'use client';

import { useToken } from '@/context/TokenContext';
import { AlertTriangle } from 'lucide-react';

type Props = {
  minAmount?: number;
  period?: string;
  settlementCycle?: string;
  feeRate?: number;
  riskNotice?: string;
};

export default function InvestmentConditions({
  minAmount = 10000,
  period = '24개월',
  settlementCycle = '매월 1회 (전월 기준)',
  feeRate = 0.001,
  riskNotice = '수익권 투자는 원금 손실 위험이 있습니다. 투자 전 상세 약관을 확인하세요.',
}: Props) {
  const { formatPrice } = useToken();

  return (
    <section className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--upbit-panel)', borderColor: 'var(--upbit-border)' }}>
      <h3 className="px-4 py-3 font-bold text-[15px] border-b" style={{ color: 'var(--upbit-text)', borderColor: 'var(--upbit-border)' }}>
        투자 조건
      </h3>
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[13px]" style={{ color: 'var(--upbit-text-dim)' }}>최소 금액</span>
          <span className="text-[14px] font-semibold tabular-nums" style={{ color: 'var(--upbit-text)' }}>{formatPrice(minAmount)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[13px]" style={{ color: 'var(--upbit-text-dim)' }}>투자 기간</span>
          <span className="text-[14px] font-semibold" style={{ color: 'var(--upbit-text)' }}>{period}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[13px]" style={{ color: 'var(--upbit-text-dim)' }}>정산 주기</span>
          <span className="text-[14px] font-semibold" style={{ color: 'var(--upbit-text)' }}>{settlementCycle}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[13px]" style={{ color: 'var(--upbit-text-dim)' }}>수수료</span>
          <span className="text-[14px] font-semibold" style={{ color: 'var(--upbit-text)' }}>{(feeRate * 100).toFixed(2)}%</span>
        </div>
        <div className="flex gap-2 p-3 rounded-lg mt-2" style={{ backgroundColor: 'rgba(235, 77, 61, 0.08)', border: '1px solid rgba(235, 77, 61, 0.2)' }}>
          <AlertTriangle size={18} className="shrink-0 mt-0.5" style={{ color: 'var(--upbit-ask)' }} />
          <div>
            <h4 className="text-[13px] font-semibold mb-0.5" style={{ color: 'var(--upbit-ask)' }}>위험 고지</h4>
            <p className="text-[12px] leading-relaxed" style={{ color: 'var(--upbit-text-dim)' }}>{riskNotice}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
