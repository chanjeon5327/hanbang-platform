'use client';

import PriceChartSection from './PriceChartSection';
import OrderBookPanel from './OrderBookPanel';

/**
 * 거래 UI 영역 (업비트형 vs 모집형 구분)
 * - 모집형(청약/투자): 예상 수익 차트
 * - 업비트형(2차거래): 호가 + 가격 차트
 */
type Props = {
  isMobilization: boolean;
};

export default function TradingSection({ isMobilization }: Props) {
  return (
    <section className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--upbit-panel)', borderColor: 'var(--upbit-border)' }}>
      <h3 className="px-4 py-3 font-bold text-[15px] border-b" style={{ color: 'var(--upbit-text)', borderColor: 'var(--upbit-border)' }}>
        {isMobilization ? '청약 / 투자' : '2차 거래'}
      </h3>
      <div className="p-4 space-y-4">
        {isMobilization ? (
          <>
            <p className="text-[13px]" style={{ color: 'var(--upbit-text-dim)' }}>
              모집이 완료되면 수익권이 발행됩니다. 청약 시 목표 달성 시점에 참여가 확정됩니다.
            </p>
            <PriceChartSection mode="청약" isMobilization />
          </>
        ) : (
          <>
            <p className="text-[13px]" style={{ color: 'var(--upbit-text-dim)' }}>
              이미 발행된 수익권을 시장가로 매수·매도할 수 있습니다.
            </p>
            <OrderBookPanel />
            <PriceChartSection mode="2차거래" isMobilization={false} />
          </>
        )}
      </div>
    </section>
  );
}
