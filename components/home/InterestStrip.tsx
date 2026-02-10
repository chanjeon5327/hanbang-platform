'use client';

import InterestCard from './InterestCard';

export default function InterestStrip() {
  return (
    <section className="px-4 mt-2">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">관심 작품</h2>
        <button className="text-xs text-gray-400">전체보기</button>
      </div>

      <div className="flex gap-3 overflow-x-auto no-scrollbar">
        {[1, 2, 3, 4].map((i) => (
          <InterestCard key={i} />
        ))}
      </div>
    </section>
  );
}
