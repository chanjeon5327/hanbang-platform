'use client';

const DEMO_HOLDINGS = [
  { title: '블루웨이 시즌3', sub: '10주 · 평균 ₩11,800', value: '₩12,300', rate: '+4.2%', up: true },
  { title: '라운지 나인', sub: '5주 · 평균 ₩9,400', value: '₩9,850', rate: '+4.8%', up: true },
  { title: '테이블 로그', sub: '8주 · 평균 ₩7,200', value: '₩7,050', rate: '-2.1%', up: false },
];

export default function MyInvestList() {
  return (
    <section>
      <h2 className="text-[14px] font-extrabold text-[var(--toss-text)] mb-2">투자 중인 작품</h2>
      <div className="rounded-2xl overflow-hidden bg-white border border-[var(--toss-border)] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        {DEMO_HOLDINGS.map((h) => (
          <div
            key={h.title}
            className="px-4 py-3 flex justify-between items-center border-b border-[var(--toss-border)] last:border-0"
          >
            <div>
              <div className="text-[14px] font-semibold text-[var(--toss-text)]">{h.title}</div>
              <div className="caption text-[var(--toss-text-secondary)] mt-0.5">{h.sub}</div>
            </div>
            <div className="text-right">
              <div className="text-[14px] font-extrabold text-[var(--toss-text)] tabular-nums">{h.value}</div>
              <div className={`caption font-semibold ${h.up ? 'text-[var(--accent-positive)]' : 'text-[var(--accent-loss,#ef4444)]'}`}>
                {h.rate}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
