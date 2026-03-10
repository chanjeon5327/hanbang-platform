'use client';

export default function MyInvestList() {
  return (
    <section>
      <h2 className="text-[14px] font-extrabold text-[var(--toss-text)] mb-2">투자 중인 작품</h2>
      <div className="rounded-2xl overflow-hidden bg-white border border-[var(--toss-border)] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="px-4 py-3 flex justify-between items-center border-b border-[var(--toss-border)] last:border-0"
          >
            <div>
              <div className="text-[14px] font-semibold text-[var(--toss-text)]">여행가 제이</div>
              <div className="caption text-[var(--toss-text-secondary)] mt-0.5">
                10주 · 평균 ₩11,800
              </div>
            </div>
            <div className="text-right">
              <div className="text-[14px] font-extrabold text-[var(--toss-text)] tabular-nums">₩12,300</div>
              <div className="caption text-[var(--accent-positive)] font-semibold">+3.2%</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
