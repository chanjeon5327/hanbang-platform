'use client';

import HeroCinematic from '@/components/home/HeroCinematic';
import MarketTickerBar from '@/components/home/MarketTickerBar';
import CurationRail from '@/components/home/CurationRail';
import MyAssetCard from '@/components/home/MyAssetCard';
import MarketMoodStrip from '@/components/home/MarketMoodStrip';
import HallyuIndexSection from '@/components/home/HallyuIndexSection';
import DeadlineRail from '@/components/home/DeadlineRail';
import NewsSection from '@/components/home/NewsSection';
import OverlayRecoCard from '@/components/home/OverlayRecoCard';
import Link from 'next/link';
import { MessageCircle, ShoppingBag } from 'lucide-react';
import { marketItems } from '@/lib/mock/marketItems';

// ── 인기 라운지 목 데이터 ──────────────────────────────────────────────────
const LOUNGE_MOCK = [
  { id: 1, title: '블루웨이 시즌3 팬 라운지',  members: 1240, badge: '🔥 인기' },
  { id: 2, title: '사운드 플로어 투자자 방',    members:  870, badge: '💬 활발' },
  { id: 3, title: '필름 하우스 커뮤니티',       members:  530, badge: null },
  { id: 4, title: '테이블 로그 투자 토론',      members:  310, badge: null },
];

// ── 핫굿즈 목 데이터 ──────────────────────────────────────────────────────
const GOODS_MOCK = [
  { id: 1, name: '블루웨이 시즌3 한정 포토카드', price: '₩12,000', tag: '한정판' },
  { id: 2, name: '사운드 플로어 공식 응원봉',     price: '₩38,000', tag: '공식' },
  { id: 3, name: '필름 하우스 아트포스터',        price: '₩22,000', tag: null },
  { id: 4, name: '테이블 로그 머그컵',            price: '₩15,000', tag: null },
];

// 콘텐츠 자산명 자연화 매핑
const TITLE_MAP: Record<string, string> = {
  '여행가 제이': '블루웨이 시즌3',
  '침착맨': '라운지 나인',
  '먹방연구소': '테이블 로그',
  'K-POP STAGE': '사운드 플로어',
  '영화 블록버스터': '필름 하우스',
};

const TRENDING_SLUGS = ['beauty-talk', 'comedy-cut', 'kids-world', 'history-lab'] as const;

export default function HomeV6() {
  const byId = Object.fromEntries(marketItems.map((it) => [it.id, it]));
  const trending4 = TRENDING_SLUGS.map((id) => byId[id]).filter(Boolean);

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#0B1120]">

      {/* ① 히어로 — 토스형 풀스크린 + 고정 투명 헤더 */}
      <HeroCinematic />

      {/* ② 실시간 시세 티커 ─ 풀폭 */}
      <MarketTickerBar />

      {/* ③ 추천 큐레이팅 ─ white */}
      <div className="bg-white border-t border-black/[0.06]">
        <CurationRail />
      </div>

      {/* ④ 지금 주목받는 콘텐츠 ─ gray, 4열 그리드 직접 렌더 */}
      <div className="bg-[#F7F8FA] border-t border-black/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 py-8 sm:py-10">
          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="text-[20px] sm:text-[22px] font-extrabold tracking-[-0.02em]">
                지금 주목받는 콘텐츠
              </h2>
              <p className="mt-1 text-[13px] text-black/55">
                팬덤 반응이 높은 콘텐츠를 선별했습니다.
              </p>
            </div>
            <Link
              href="/market"
              className="text-[13px] text-black/50 hover:text-black transition shrink-0"
            >
              전체 마켓 →
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {trending4.map((it) => (
              <OverlayRecoCard
                key={it.id}
                item={{ ...it, title: TITLE_MAP[it.title] ?? it.title }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ⑤ 내 자산 ─ white */}
      <div className="bg-white border-t border-black/[0.06]">
        <MyAssetCard />
      </div>

      {/* ⑥ 한류지수 ─ white (순서 올림: 기존 ⑦ → ⑥) */}
      <div className="bg-white border-t border-black/[0.06]">
        <HallyuIndexSection />
      </div>

      {/* ⑦ 시장 동향 ─ gray (순서 내림: 기존 ⑥ → ⑦) */}
      <div className="bg-[#F7F8FA] border-t border-black/[0.06]">
        <MarketMoodStrip />
      </div>

      {/* ⑧ 마감 임박 ─ blue-tinted */}
      <div className="bg-[#EFF6FF] border-t border-blue-100">
        <DeadlineRail />
      </div>

      {/* ⑨ 뉴스 & 업계동향 ─ white */}
      <div className="bg-white border-t border-black/[0.06]">
        <NewsSection />
      </div>

      {/* ⑩ 인기 라운지 ─ gray */}
      <div className="bg-[#F7F8FA] border-t border-black/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 py-8 sm:py-10">
          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="text-[20px] sm:text-[22px] font-extrabold tracking-[-0.02em]">
                인기 라운지
              </h2>
              <p className="mt-1 text-[13px] text-black/55">
                투자자와 팬이 함께 대화하는 공간입니다.
              </p>
            </div>
            <Link
              href="/lounge"
              className="text-[13px] text-black/50 hover:text-black transition shrink-0"
            >
              전체 라운지 →
            </Link>
          </div>
          <div className="flex flex-col gap-2.5">
            {LOUNGE_MOCK.map((room) => (
              <Link
                key={room.id}
                href="/lounge"
                className="bg-white rounded-xl border border-black/[0.06] px-4 py-3.5 flex items-center justify-between hover:border-black/10 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-[#EFF6FF]">
                    <MessageCircle size={16} className="text-[#005AFF]" />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-[#0B1120]">{room.title}</p>
                    <p className="text-[12px] text-black/40">{room.members.toLocaleString()}명 참여 중</p>
                  </div>
                </div>
                {room.badge && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#005AFF] shrink-0">
                    {room.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ⑪ 핫굿즈 ─ white */}
      <div className="bg-white border-t border-black/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 py-8 sm:py-10">
          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="text-[20px] sm:text-[22px] font-extrabold tracking-[-0.02em]">
                핫 굿즈
              </h2>
              <p className="mt-1 text-[13px] text-black/55">
                투자한 크리에이터의 공식 굿즈를 만나보세요.
              </p>
            </div>
            <Link
              href="/goods"
              className="text-[13px] text-black/50 hover:text-black transition shrink-0"
            >
              전체 굿즈 →
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {GOODS_MOCK.map((item) => (
              <Link
                key={item.id}
                href="/goods"
                className="bg-[#F7F8FA] rounded-2xl border border-black/[0.06] overflow-hidden hover:border-black/10 transition"
              >
                <div className="w-full aspect-square flex items-center justify-center bg-[#EFF6FF]">
                  <ShoppingBag size={32} className="text-[#005AFF] opacity-30" />
                </div>
                <div className="p-3">
                  {item.tag && (
                    <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#EFF6FF] text-[#005AFF] mb-1">
                      {item.tag}
                    </span>
                  )}
                  <p className="text-[13px] font-semibold text-[#0B1120] leading-snug">{item.name}</p>
                  <p className="mt-1 text-[13px] font-bold text-black/70">{item.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* footer 하단 여백 */}
      <div className="h-10 sm:h-14 bg-[#F7F8FA] border-t border-black/[0.06]" />
    </div>
  );
}
