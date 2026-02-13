'use client';

import { AlertTriangle } from 'lucide-react';

/**
 * 수익률 안내 섹션
 * - 예상 수익률 (가정 기반)
 * - 정산 주기
 * - 수익 배분 구조
 * - 리스크 고지
 */
const MOCK_PAST_DATA = [
  { period: '2024.01', revenue: 125000 },
  { period: '2024.02', revenue: 132000 },
  { period: '2024.03', revenue: 118000 },
];

export default function RevenueInfoSection() {
  return (
    <section className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--upbit-panel)', borderColor: 'var(--upbit-border)' }}>
      <h3 className="px-4 py-3 font-bold text-[15px] border-b" style={{ color: 'var(--upbit-text)', borderColor: 'var(--upbit-border)' }}>
        수익 구조 안내
      </h3>
      <div className="p-4 space-y-4">
        <div>
          <h4 className="text-[13px] font-semibold mb-1" style={{ color: 'var(--upbit-text)' }}>예상 수익률</h4>
          <p className="text-[12px] leading-relaxed" style={{ color: 'var(--upbit-text-dim)' }}>
            연 8~15% (가정) — 유튜브 광고 수익 기반. 실제 수익은 콘텐츠 성과에 따라 달라질 수 있습니다.
          </p>
        </div>
        <div>
          <h4 className="text-[13px] font-semibold mb-1" style={{ color: 'var(--upbit-text)' }}>정산 주기</h4>
          <p className="text-[12px] leading-relaxed" style={{ color: 'var(--upbit-text-dim)' }}>
            매월 1회 (전월 수익 기준). 익월 15일 경 정산·지급.
          </p>
        </div>
        <div>
          <h4 className="text-[13px] font-semibold mb-1" style={{ color: 'var(--upbit-text)' }}>수익 배분 구조</h4>
          <p className="text-[12px] leading-relaxed" style={{ color: 'var(--upbit-text-dim)' }}>
            크리에이터 50% · 투자자 45% · 플랫폼 5% (수익 발생 시 배분)
          </p>
        </div>
        <div className="flex gap-2 p-3 rounded-lg" style={{ backgroundColor: 'rgba(235, 77, 61, 0.08)', border: '1px solid rgba(235, 77, 61, 0.2)' }}>
          <AlertTriangle size={18} className="shrink-0" style={{ color: 'var(--upbit-ask)' }} />
          <div>
            <h4 className="text-[13px] font-semibold mb-0.5" style={{ color: 'var(--upbit-ask)' }}>리스크 고지</h4>
            <p className="text-[12px] leading-relaxed" style={{ color: 'var(--upbit-text-dim)' }}>
              수익권 투자는 원금 손실 위험이 있습니다. 투자 전 상세 약관을 확인하세요.
            </p>
          </div>
        </div>
        <div>
          <h4 className="text-[13px] font-semibold mb-2" style={{ color: 'var(--upbit-text)' }}>과거 정산 (더미)</h4>
          <div className="space-y-2">
            {MOCK_PAST_DATA.map((d) => (
              <div key={d.period} className="flex justify-between text-[12px]">
                <span style={{ color: 'var(--upbit-text-dim)' }}>{d.period}</span>
                <span className="font-medium tabular-nums" style={{ color: 'var(--upbit-positive)' }}>₩{(d.revenue / 10000).toFixed(1)}만</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
