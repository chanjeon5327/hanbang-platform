'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Download, LogIn, TrendingUp } from 'lucide-react';
import { getYtThumb } from '@/lib/thumbnails';
import BottomNavigation from '@/components/home/BottomNavigation';
import HomeHero from '@/components/home/HomeHero';
import InterestStrip from '@/components/home/InterestStrip';
import CurationSection from '@/components/home/CurationSection';
import SectionHeader from '@/components/home/SectionHeader';

export type RailItem = {
  id: string;
  title: string;
  thumbnail_url?: string;
  creator_name?: string;
  category?: string;
  platform?: string;
  reason?: { code: string; text: string };
};

export type Rail = { key: string; title: string; items: RailItem[] };

export type AssetData = {
  totalAssets: number;
  userCash: number;
  holdingsValue: number;
  returnAmount: number;
  returnRate: number;
};

export const FALLBACK_RAILS: Rail[] = [
  { key: 'fallback-top', title: '오늘의 추천', items: [
    { id: 'sample-1', title: '여행가 제이', creator_name: '유튜브', thumbnail_url: getYtThumb(0) },
    { id: 'sample-2', title: '먹방 로드', creator_name: '유튜브', thumbnail_url: getYtThumb(1) },
    { id: 'sample-3', title: '일상 브이로그', creator_name: '유튜브', thumbnail_url: getYtThumb(2) },
    { id: 'sample-4', title: '웹툰 작가 A', creator_name: '웹툰', thumbnail_url: getYtThumb(3) },
    { id: 'sample-5', title: '웹소설 작가 B', creator_name: '웹소설', thumbnail_url: getYtThumb(4) },
  ]},
  { key: 'fallback-hot', title: '마감 임박', items: [
    { id: 'sample-6', title: '뮤직 비디오 프로젝트', creator_name: '음악', thumbnail_url: getYtThumb(5) },
    { id: 'sample-7', title: '드라마 리메이크', creator_name: 'OTT', thumbnail_url: getYtThumb(6) },
    { id: 'sample-8', title: '팟캐스트 시즌2', creator_name: '오디오', thumbnail_url: getYtThumb(7) },
  ]},
  { key: 'fallback-interest', title: '인기 수익권', items: [
    { id: 'sample-1', title: '여행가 제이', creator_name: '유튜브', thumbnail_url: getYtThumb(8) },
    { id: 'sample-2', title: '먹방 로드', creator_name: '유튜브', thumbnail_url: getYtThumb(9) },
    { id: 'sample-3', title: '일상 브이로그', creator_name: '유튜브', thumbnail_url: getYtThumb(10) },
  ]},
];

const TOSS = {
  bg: '#f2f4f6',
  card: '#ffffff',
  blue: '#3182f6',
  text: '#191f28',
  secondary: '#6b7684',
  border: '#e5e8eb',
  positive: '#00c48c',
  negative: '#eb4d3d',
} as const;

const RAIL_CARD_W = 140;
const RAIL_GAP = 16;

function RailCard({ item, index, badge }: { item: RailItem; index: number; badge?: string }) {
  const thumbSrc = item.thumbnail_url || getYtThumb(index);
  return (
    <Link
      href={`/market/${item.id}`}
      className="flex-shrink-0 group block focus:outline-none focus:ring-2 focus:ring-[var(--toss-blue)] focus:ring-offset-2 rounded-2xl"
      style={{ width: RAIL_CARD_W }}
      aria-label={`${item.title} 수익권 보기`}
    >
      <div className="relative overflow-hidden rounded-2xl border border-black/5 active:scale-[0.97] transition-all duration-200" style={{ backgroundColor: 'var(--toss-card)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div className="aspect-[4/5] relative overflow-hidden">
          <img src={thumbSrc} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" aria-hidden />
          {badge && (
            <span className="absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: TOSS.negative }}>
              {badge}
            </span>
          )}
          <div className="absolute bottom-2 left-2 right-2">
            <span className="inline-block rounded-lg px-2 py-0.5 text-[10px] font-semibold text-white" style={{ backgroundColor: TOSS.blue }}>수익권</span>
          </div>
        </div>
        <div className="p-3">
          <div className="text-[13px] font-bold line-clamp-1 leading-snug" style={{ color: 'var(--toss-text)' }}>{item.title}</div>
          {item.creator_name && <div className="text-[11px] mt-0.5 font-medium truncate" style={{ color: 'var(--toss-text-secondary)' }}>{item.creator_name}</div>}
        </div>
      </div>
    </Link>
  );
}

function RailSection({ rail, railIndex }: { rail: Rail; railIndex: number }) {
  const badge = rail.key.includes('hot') || rail.key.includes('마감') ? '마감임박' : undefined;
  const isEmpty = !rail.items || rail.items.length === 0;

  if (isEmpty) return null;

  return (
    <section className="mb-6">
      <SectionHeader title={rail.title} viewAllHref="/market" />
      <div className="flex overflow-x-auto no-scrollbar pb-2 -mx-1" style={{ gap: RAIL_GAP }}>
        {rail.items.map((item, i) => (
          <RailCard key={`${item.id}-${i}`} item={item} index={railIndex * 20 + i} badge={badge} />
        ))}
      </div>
    </section>
  );
}

type Props = {
  assetData: AssetData;
  demoMode?: boolean;
  showBottomNav?: boolean;
};

export default function HomeView({ assetData, demoMode = false, showBottomNav = true }: Props) {
  const [rails, setRails] = useState<Rail[]>([]);
  const [loading, setLoading] = useState(!demoMode);
  const [heroItem, setHeroItem] = useState<{ id: string; title: string; subtitle?: string; thumbUrl?: string; score?: number } | null>(null);

  useEffect(() => {
    if (demoMode) {
      setLoading(false);
      return;
    }
    fetch('/api/home/rails', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (json?.rails?.length > 0) {
          setRails(json.rails);
          const topRail = json.rails.find((r: Rail) => r.key === 'top');
          const firstItem = topRail?.items?.[0] ?? json.rails[0]?.items?.[0];
          if (firstItem) {
            setHeroItem({ id: firstItem.id, title: firstItem.title, subtitle: firstItem.creator_name ? `${firstItem.creator_name} · 수익권` : undefined, thumbUrl: firstItem.thumbnail_url || getYtThumb(0), score: firstItem.score });
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [demoMode]);

  const displayRails = loading || rails.length === 0 ? FALLBACK_RAILS : rails;
  const { totalAssets, userCash, holdingsValue, returnAmount, returnRate } = assetData;

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--toss-bg)' }}>
      <main className="max-w-lg mx-auto px-4 pt-4 pb-6 space-y-4">
        {/* Above the fold 1: 내 자산 카드 (2x2 그리드) */}
        <div className="rounded-2xl p-5 border border-black/5" style={{ backgroundColor: TOSS.card, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div className="text-[13px] font-medium mb-2" style={{ color: 'var(--toss-text-secondary)' }}>내 자산</div>
          <div className="text-[26px] font-bold tracking-tight tabular-nums" style={{ color: 'var(--toss-text)' }}>
            ₩{totalAssets.toLocaleString()}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4" style={{ borderTop: '1px solid var(--toss-border)' }}>
            <div>
              <div className="text-[11px] font-medium" style={{ color: 'var(--toss-text-secondary)' }}>예수금</div>
              <div className="text-[14px] font-semibold tabular-nums mt-0.5" style={{ color: 'var(--toss-text)' }}>{userCash.toLocaleString()}원</div>
            </div>
            <div>
              <div className="text-[11px] font-medium" style={{ color: 'var(--toss-text-secondary)' }}>보유평가</div>
              <div className="text-[14px] font-semibold tabular-nums mt-0.5" style={{ color: 'var(--toss-text)' }}>{holdingsValue.toLocaleString()}원</div>
            </div>
            <div>
              <div className="text-[11px] font-medium" style={{ color: 'var(--toss-text-secondary)' }}>수익률</div>
              <div className="text-[14px] font-semibold tabular-nums mt-0.5" style={{ color: returnRate >= 0 ? TOSS.positive : TOSS.negative }}>
                {returnRate >= 0 ? '+' : ''}{returnRate.toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-[11px] font-medium" style={{ color: 'var(--toss-text-secondary)' }}>손익</div>
              <div className="text-[14px] font-semibold tabular-nums mt-0.5" style={{ color: returnAmount >= 0 ? TOSS.positive : TOSS.negative }}>
                {returnAmount >= 0 ? '+' : ''}{returnAmount.toLocaleString()}원
              </div>
            </div>
          </div>
        </div>

        {/* Above the fold 2: CTA 2개 */}
        <div className="grid grid-cols-2 gap-3">
          {demoMode ? (
            <>
              <Link
                href="/login"
                className="rounded-2xl p-4 flex items-center gap-3 transition active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2"
                style={{ backgroundColor: TOSS.blue, color: TOSS.card, boxShadow: '0 4px 12px rgba(49,130,246,0.35)' }}
              >
                <LogIn size={29} strokeWidth={2} aria-hidden />
                <div className="text-left">
                  <div className="text-[15px] font-bold">로그인</div>
                  <div className="text-[12px] opacity-90">시작하기</div>
                </div>
              </Link>
              <Link
                href="/market"
                className="rounded-2xl p-4 flex items-center gap-3 transition active:scale-[0.98] border border-black/5 focus:outline-none focus:ring-2 focus:ring-[var(--toss-blue)] focus:ring-offset-2"
                style={{ backgroundColor: TOSS.card, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              >
                <TrendingUp size={29} strokeWidth={2} aria-hidden />
                <div className="text-left">
                  <div className="text-[15px] font-bold" style={{ color: 'var(--toss-text)' }}>둘러보기</div>
                  <div className="text-[12px]" style={{ color: 'var(--toss-text-secondary)' }}>마켓 둘러보기</div>
                </div>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/wallet/deposit"
                className="rounded-2xl p-4 flex items-center gap-3 transition active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2"
                style={{ backgroundColor: TOSS.blue, color: TOSS.card, boxShadow: '0 4px 12px rgba(49,130,246,0.35)' }}
              >
                <Download size={29} strokeWidth={2} aria-hidden />
                <div className="text-left">
                  <div className="text-[15px] font-bold">입금</div>
                  <div className="text-[12px] opacity-90">KRW 충전</div>
                </div>
              </Link>
              <Link
                href="/market"
                className="rounded-2xl p-4 flex items-center gap-3 transition active:scale-[0.98] border border-black/5 focus:outline-none focus:ring-2 focus:ring-[var(--toss-blue)] focus:ring-offset-2"
                style={{ backgroundColor: TOSS.card, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              >
                <TrendingUp size={29} strokeWidth={2} aria-hidden />
                <div className="text-left">
                  <div className="text-[15px] font-bold" style={{ color: 'var(--toss-text)' }}>거래하기</div>
                  <div className="text-[12px]" style={{ color: 'var(--toss-text-secondary)' }}>수익권 투자</div>
                </div>
              </Link>
            </>
          )}
        </div>

        {/* Above the fold 3: 짧은 배너 */}
        <HomeHero item={heroItem} />

        {/* 레일들 */}
        {loading ? (
          <section className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <div className="h-5 w-32 rounded bg-black/5 animate-pulse" />
              <div className="h-4 w-16 rounded bg-black/5 animate-pulse" />
            </div>
            <div className="flex gap-4 overflow-hidden pb-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex-shrink-0 w-[140px] rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--toss-card)' }}>
                  <div className="aspect-[4/5] bg-black/5 animate-pulse" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 w-full rounded bg-black/5 animate-pulse" />
                    <div className="h-2.5 w-2/3 rounded bg-black/5 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          displayRails.map((rail, ri) => <RailSection key={rail.key} rail={rail} railIndex={ri} />)
        )}

        <InterestStrip />
        <CurationSection title="신뢰 추천" />
        <div className="h-6" />
      </main>

      {showBottomNav && <BottomNavigation demoMode={demoMode} />}
    </div>
  );
}
