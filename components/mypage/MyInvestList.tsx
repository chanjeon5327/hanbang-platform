'use client';

export default function MyInvestList() {
  return (
    <section>
      <h2 className="text-[17px] font-bold text-[var(--toss-text)] mb-3">투자 중인 작품</h2>
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white rounded-[16px] p-4 flex justify-between items-center shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[var(--toss-border)]"
          >
            <div>
              <div className="font-semibold text-[var(--toss-text)]">여행가 제이</div>
              <div className="text-[12px] text-[var(--toss-text-secondary)] mt-1">
                보유 수량 10주 · 평균가 ₩11,800
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-[var(--toss-text)]" style={{ fontVariantNumeric: 'tabular-nums' }}>₩12,300</div>
              <div className="text-[12px] text-[var(--accent-positive)] font-medium">+3.2%</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
