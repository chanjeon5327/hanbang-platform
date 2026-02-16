'use client';

export default function MyHistory() {
  return (
    <section>
      <h2 className="body-lg font-bold text-[var(--toss-text)] mb-3">기록</h2>
      <div className="bg-white rounded-[16px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[var(--toss-border)] divide-y divide-[var(--toss-border)]">
        {['주문 내역', '정산 내역', '입출금 기록'].map((t) => (
          <div key={t} className="px-4 py-4 flex justify-between items-center">
            <span className="body font-medium text-[var(--toss-text)]">{t}</span>
            <span className="text-[var(--toss-text-secondary)]">›</span>
          </div>
        ))}
      </div>
    </section>
  );
}
