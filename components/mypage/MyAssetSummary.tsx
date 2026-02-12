'use client';

export default function MyAssetSummary() {
  return (
    <section className="bg-white rounded-[16px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[var(--toss-border)]">
      <div className="text-[14px] text-[var(--toss-text-secondary)]">나의 총 자산</div>
      <div className="text-[28px] font-bold text-[var(--toss-text)] mt-1" style={{ fontVariantNumeric: 'tabular-nums' }}>
        ₩12,340,000
      </div>
      <div className="text-[14px] text-[var(--accent-positive)] font-medium mt-1">
        +2.83% (₩340,000)
      </div>
      <div className="grid grid-cols-3 gap-2 mt-5 text-center">
        <div className="py-2 rounded-xl bg-[var(--toss-bg)]">
          <div className="text-[12px] text-[var(--toss-text-secondary)]">투자중</div>
          <div className="text-[14px] font-semibold text-[var(--toss-text)] mt-0.5">₩9,000,000</div>
        </div>
        <div className="py-2 rounded-xl bg-[var(--toss-bg)]">
          <div className="text-[12px] text-[var(--toss-text-secondary)]">출금가능</div>
          <div className="text-[14px] font-semibold text-[var(--toss-text)] mt-0.5">₩3,340,000</div>
        </div>
        <div className="py-2 rounded-xl bg-[var(--toss-bg)]">
          <div className="text-[12px] text-[var(--toss-text-secondary)]">수익</div>
          <div className="text-[14px] font-semibold text-[var(--accent-positive)] mt-0.5">+₩340,000</div>
        </div>
      </div>
    </section>
  );
}
