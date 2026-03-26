import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

export const metadata = { title: '굿즈 — HANBANG' };

const MOCK_GOODS = [
  { id: 1, name: '블루웨이 시즌3 한정 포토카드',  price: '₩12,000', tag: '한정판' },
  { id: 2, name: '사운드 플로어 공식 응원봉',       price: '₩38,000', tag: '공식' },
  { id: 3, name: '필름 하우스 아트포스터 (A2)',     price: '₩22,000', tag: null },
  { id: 4, name: '테이블 로그 머그컵',              price: '₩15,000', tag: null },
];

export default function GoodsPage() {
  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-5 py-10">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingBag size={20} className="text-[var(--hb-primary,#005AFF)]" />
            <span className="text-[13px] font-semibold text-[var(--hb-primary,#005AFF)]">굿즈</span>
          </div>
          <h1 className="text-[26px] sm:text-[30px] font-extrabold tracking-[-0.02em] text-[#0B1120]">
            핫 굿즈
          </h1>
          <p className="mt-1.5 text-[14px] text-black/50">
            투자한 크리에이터의 공식 굿즈를 만나보세요.
          </p>
        </div>

        {/* 굿즈 그리드 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5">
          {MOCK_GOODS.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden"
            >
              {/* 썸네일 플레이스홀더 */}
              <div
                className="w-full aspect-square flex items-center justify-center"
                style={{ backgroundColor: 'var(--hb-primary-muted, rgba(0,90,255,0.06))' }}
              >
                <ShoppingBag size={36} className="text-[var(--hb-primary,#005AFF)] opacity-40" />
              </div>
              <div className="p-3">
                {item.tag && (
                  <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#EFF6FF] text-[#005AFF] mb-1">
                    {item.tag}
                  </span>
                )}
                <p className="text-[13px] font-semibold text-[#0B1120] leading-snug">{item.name}</p>
                <p className="mt-1 text-[13px] font-bold text-black/70">{item.price}</p>
                <p className="mt-1 text-[11px] text-black/30">준비 중</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-[13px] text-black/35">
          굿즈 스토어가 곧 오픈됩니다.{' '}
          <Link href="/" className="text-[var(--hb-primary,#005AFF)] hover:underline">
            홈으로 돌아가기
          </Link>
        </p>
      </div>
    </div>
  );
}
