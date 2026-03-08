import InterestRail from '@/components/interest/InterestRail';
import { getYtThumb } from '@/lib/thumbnails';

const items = Array.from({ length: 10 }).map((_, i) => ({
  id: String(i),
  title: i % 2 ? '블루웨이 시즌3 수익권' : '달빛 아래 웹드라마 지분',
  subtitle: i % 2 ? '구독자 50만 · 여행' : '글로벌 IP 확장',
  thumbUrl: getYtThumb(i),
  tags: i % 2 ? ['여행', '유튜브'] : ['웹툰', 'IP'],
  investors: 1200 + i * 33,
  roiText: i % 3 === 0 ? '+12.4%' : '+5.1%',
}));

export default function InterestDemoPage() {
  return (
    <div className="bg-[#f7f8fa]">
      <div className="mx-auto max-w-[520px] py-4">
        <InterestRail
          title="지금 뜨는 조각"
          items={items}
        />
      </div>
    </div>
  );
}
