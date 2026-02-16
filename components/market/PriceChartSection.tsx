'use client';

import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useToken } from '@/context/TokenContext';

/**
 * 모집형: 예상 수익 그래프
 * 2차 거래형: 가격 변동 그래프
 * 더미 데이터 사용
 */
type ChartMode = '청약' | '2차거래';

// 모집형 예상 수익 더미 (월별 누적 예상)
const MOCK_PROFIT_DATA = [
  { month: '1개월', expected: 12000, cumulative: 12000 },
  { month: '3개월', expected: 15000, cumulative: 27000 },
  { month: '6개월', expected: 18000, cumulative: 45000 },
  { month: '12개월', expected: 22000, cumulative: 97000 },
  { month: '18개월', expected: 25000, cumulative: 142000 },
  { month: '24개월', expected: 28000, cumulative: 198000 },
];

// 2차 거래 가격 변동 더미
const MOCK_PRICE_DATA = [
  { date: '1/1', price: 12000 },
  { date: '1/5', price: 12400 },
  { date: '1/10', price: 12100 },
  { date: '1/15', price: 12800 },
  { date: '1/20', price: 12500 },
  { date: '1/25', price: 13200 },
  { date: '1/30', price: 12900 },
  { date: '2/5', price: 13100 },
  { date: '2/10', price: 13500 },
];

type Props = {
  mode: ChartMode;
  isMobilization?: boolean;
};

export default function PriceChartSection({ mode, isMobilization }: Props) {
  const { formatPrice } = useToken();
  const [activeTab, setActiveTab] = useState<'청약' | '2차거래'>(isMobilization ? '청약' : '2차거래');

  const showProfitChart = activeTab === '청약' || isMobilization;
  const showPriceChart = activeTab === '2차거래' || !isMobilization;

  return (
    <section className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--upbit-panel)', borderColor: 'var(--upbit-border)' }}>
      <div className="flex border-b" style={{ borderColor: 'var(--upbit-border)' }}>
        {(['청약', '2차거래'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-3 body-sm font-semibold transition"
            style={{
              backgroundColor: activeTab === tab ? 'var(--upbit-bid)' : 'transparent',
              color: activeTab === tab ? '#fff' : 'var(--upbit-text-dim)',
            }}
          >
            {tab === '청약' ? '예상 수익' : '가격 변동'}
          </button>
        ))}
      </div>
      <div className="p-4">
        {showProfitChart && (
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_PROFIT_DATA} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--upbit-bid)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--upbit-bid)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--upbit-border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--upbit-text-dim)" />
                <YAxis tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`} tick={{ fontSize: 11 }} stroke="var(--upbit-text-dim)" />
                <Tooltip
                  formatter={(value: number | undefined) => [value != null ? formatPrice(value) : '-', '예상 수익']}
                  contentStyle={{ backgroundColor: 'var(--upbit-panel)', border: '1px solid var(--upbit-border)', borderRadius: 8 }}
                />
                <Area type="monotone" dataKey="cumulative" stroke="var(--upbit-bid)" fill="url(#profitGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
        {showPriceChart && (
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_PRICE_DATA} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--upbit-bid)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--upbit-bid)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--upbit-border)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--upbit-text-dim)" />
                <YAxis tickFormatter={(v) => formatPrice(v)} tick={{ fontSize: 11 }} stroke="var(--upbit-text-dim)" />
                <Tooltip
                  formatter={(value: number | undefined) => [value != null ? formatPrice(value) : '-', '가격']}
                  contentStyle={{ backgroundColor: 'var(--upbit-panel)', border: '1px solid var(--upbit-border)', borderRadius: 8 }}
                />
                <Area type="monotone" dataKey="price" stroke="var(--upbit-bid)" fill="url(#priceGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </section>
  );
}
