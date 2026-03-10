'use client';

export default function MyAssetSummary() {
  return (
    <section className="bg-white rounded-2xl px-4 py-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[var(--toss-border)]">
      <div className="caption text-[var(--toss-text-secondary)]">나의 총 자산</div>
      <div className="flex items-baseline gap-3 mt-0.5">
        <div className="text-[22px] font-extrabold text-[var(--toss-text)]" style={{ fontVariantNumeric: 'tabular-nums' }}>
          ₩12,340,000
        </div>
        <div className="text-[13px] text-[var(--accent-positive)] font-semibold">
          +2.83%
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-3">
        <div className="py-2 px-2 rounded-xl bg-[var(--toss-bg)] text-center">
          <div className="caption text-[var(--toss-text-secondary)]">투자중</div>
          <div className="text-[13px] font-semibold text-[var(--toss-text)] mt-0.5 tabular-nums">₩9,000,000</div>
        </div>
        <div className="py-2 px-2 rounded-xl bg-[var(--toss-bg)] text-center">
          <div className="caption text-[var(--toss-text-secondary)]">출금가능</div>
          <div className="text-[13px] font-semibold text-[var(--toss-text)] mt-0.5 tabular-nums">₩3,340,000</div>
        </div>
        <div className="py-2 px-2 rounded-xl bg-[var(--toss-bg)] text-center">
          <div className="caption text-[var(--toss-text-secondary)]">수익</div>
          <div className="text-[13px] font-semibold text-[var(--accent-positive)] mt-0.5 tabular-nums">+₩340,000</div>
        </div>
      </div>
    </section>
  );
}
