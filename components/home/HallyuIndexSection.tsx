'use client';

import MarketCandleChart from '@/components/charts/MarketCandleChart';

const MARKET_STATS = [
  { label: '지수',       value: '1,284.7', delta: '+2.1%',  up: true  },
  { label: '24h 거래량', value: '₩4.2억',  delta: '+18%',   up: true  },
  { label: '활성 종목',  value: '188개',   delta: null,     up: true  },
  { label: '신규 상장',  value: '3종목',   delta: '이번 주', up: true  },
];

export default function HallyuIndexSection() {
  return (
    <section className="px-5 sm:px-6 py-10 sm:py-12 max-w-7xl mx-auto">
      <div className="rounded-2xl border border-black/10 bg-white overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.05)]">

        {/* 헤더 */}
        <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-black/[0.05]">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div>
              <div className="text-xl sm:text-2xl font-extrabold tracking-[-0.3px]">한류지수</div>
              <div className="text-sm text-black/50 mt-1">
                K-콘텐츠 자산 시장의 실시간 흐름을 확인합니다.
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[12px] font-bold text-emerald-700">실시간</span>
            </div>
          </div>
        </div>

        {/* 시장 요약 지표 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-black/[0.05]">
          {MARKET_STATS.map((s) => (
            <div key={s.label} className="bg-white px-4 py-3">
              <div className="text-[10px] text-black/40 uppercase tracking-wide mb-0.5">{s.label}</div>
              <div className="text-[15px] font-extrabold tabular-nums">{s.value}</div>
              {s.delta && (
                <div className={`text-[11px] font-bold mt-0.5 ${s.up ? 'text-emerald-600' : 'text-red-500'}`}>
                  {s.delta}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 캔들차트 */}
        <MarketCandleChart
          seed="hallyu-index"
          basePrice={12847}
          chgPct={2.1}
          height={300}
        />
      </div>
    </section>
  );
}
