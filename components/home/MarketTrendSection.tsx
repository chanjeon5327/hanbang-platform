'use client';

export default function MarketTrendSection() {
  const rows = [
    { name: 'K-여행', score: '+14.2', desc: '관심 급증' },
    { name: '먹방', score: '+9.8', desc: '거래량 증가' },
    { name: '시사/토크', score: '+4.1', desc: '안정 상승' },
    { name: '스포츠', score: '-1.2', desc: '조정 구간' },
  ];

  return (
    <section className="px-5 sm:px-6 py-10 sm:py-14 max-w-7xl mx-auto">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">시장 동향</h2>
          <p className="text-sm text-white/60 mt-1">
            카테고리별 모멘텀 · 변동성 요약
          </p>
        </div>
        <div className="text-xs text-white/50">최근 24시간</div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
          <div className="text-sm text-white/60 mb-3">모멘텀 TOP</div>
          <div className="space-y-3">
            {rows.map((r, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-black/10 px-4 py-3"
              >
                <div>
                  <div className="font-semibold">{r.name}</div>
                  <div className="text-xs text-white/50 mt-1">{r.desc}</div>
                </div>
                <div
                  className={
                    r.score.startsWith('-')
                      ? 'text-red-300 font-bold tabular-nums'
                      : 'text-emerald-300 font-bold tabular-nums'
                  }
                >
                  {r.score}%
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
          <div className="text-sm text-white/60 mb-3">요약</div>
          <div className="rounded-xl border border-white/10 bg-black/10 p-4">
            <div className="text-base font-semibold">오늘의 시장</div>
            <p className="text-sm text-white/60 mt-2 leading-relaxed">
              인기 카테고리 중심으로 거래가 집중되고 있습니다. 변동성은
              완만하지만, 마감 임박 종목에서 체결이 증가하는 구간입니다.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="rounded-xl border border-white/10 bg-black/10 p-4">
              <div className="text-xs text-white/50">활성 사용자</div>
              <div className="text-lg font-bold tabular-nums mt-1">1,284</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/10 p-4">
              <div className="text-xs text-white/50">총 거래 건수</div>
              <div className="text-lg font-bold tabular-nums mt-1">3,912</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
