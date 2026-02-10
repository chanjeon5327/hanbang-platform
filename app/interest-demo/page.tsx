import InterestRail from '@/components/interest/InterestRail';
import InterestPreview from '@/components/interest/InterestPreview';

const items = Array.from({ length: 10 }).map((_, i) => ({
  id: String(i),
  title: i % 2 ? '유튜브 <여행가 제이> 수익권' : '전지적 독자 시점 웹툰 지분',
  subtitle: i % 2 ? '구독자 50만 · 여행' : '글로벌 IP 확장',
  thumbUrl: 'https://images.unsplash.com/photo-1526481280695-3c687fd5432c?auto=format&fit=crop&w=800&q=70',
  tags: i % 2 ? ['여행', '유튜브'] : ['웹툰', 'IP'],
  investors: 1200 + i * 33,
  roiText: i % 3 === 0 ? '+12.4%' : '+5.1%',
}));

export default function InterestDemoPage() {
  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <div className="mx-auto max-w-[520px] py-4">
        <InterestRail
          title="지금 뜨는 조각"
          subtitle="탭 → 오버레이 프리뷰"
          items={items}
        />
      </div>

      {/* 프리뷰 오버레이 골조 */}
      <InterestPreview>
        <div className="space-y-2">
          <div className="h-[180px] rounded-xl bg-black/30" />
          <div className="h-4 w-2/3 rounded bg-white/20" />
          <div className="h-3 w-1/2 rounded bg-white/15" />
          <div className="mt-2 h-10 rounded bg-white/15" />
        </div>
      </InterestPreview>
    </main>
  );
}
