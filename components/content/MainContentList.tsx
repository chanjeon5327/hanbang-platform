'use client';

import MainContentCard from './MainContentCard';

const DUMMY = Array.from({ length: 6 }).map((_, i) => ({
  id: `demo-${i + 1}`,
  title:
    i % 2 === 0
      ? '전지적 독자 시점 웹툰 지분'
      : '유튜브 채널 <여행가 제이>',
  status: i === 0 ? '마감임박' : '모집중',
  thumbnail: `https://source.unsplash.com/random/400x600?sig=${i}`,
}));

export default function MainContentList() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {DUMMY.map((item) => (
        <MainContentCard
          key={item.id}
          id={item.id}
          title={item.title}
          status={item.status as any}
          thumbnail={item.thumbnail}
        />
      ))}
    </div>
  );
}
