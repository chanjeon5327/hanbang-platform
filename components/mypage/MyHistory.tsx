'use client';

export default function MyHistory() {
  return (
    <section>
      <h2 className="font-semibold mb-3">기록</h2>

      <div className="bg-white rounded-xl divide-y text-sm">
        {['주문 내역', '정산 내역', '입출금 기록'].map((t) => (
          <div
            key={t}
            className="px-4 py-3 flex justify-between"
          >
            <span>{t}</span>
            <span className="text-gray-400">›</span>
          </div>
        ))}
      </div>
    </section>
  );
}
