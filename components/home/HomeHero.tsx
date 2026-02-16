'use client';

import Link from 'next/link';
import YouTubeEmbed from '@/components/common/YouTubeEmbed';

export type HeroItem = {
  id: string;
  title: string;
  subtitle?: string;
  thumbUrl?: string;
  score?: number;
};

type Props = { item?: HeroItem | null };

const DEFAULT_HERO: HeroItem = {
  id: 'hero-default',
  title: '디지털 IP 수익권',
  subtitle: '수익을 조각으로 투자·거래',
};

const TOSS = { card: '#ffffff', border: '#e5e8eb', blue: '#3182f6', text: '#191f28', dim: '#6b7684' } as const;

/** 내 자산 카드 높이(~200px) 대비 1.7배 ≈ 338px — 쿠팡플레이형 영상 추천 배너 (관리자 설정) */
const HERO_H = 338;

const YT_VIDEO_ID = 'HosW0gulISQ';
const YT_START_SEC = 25;

export default function HomeHero({ item }: Props) {
  const hero = item ?? DEFAULT_HERO;
  const href = hero.id !== 'hero-default' ? `/market/${hero.id}` : '/';

  return (
    <section>
      <Link
        href={href}
        className="block relative w-full overflow-hidden rounded-2xl border border-black/5 active:opacity-95 transition-transform duration-200"
        style={{ height: HERO_H, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
      >
        <div className="absolute inset-0">
          <YouTubeEmbed
            videoId={YT_VIDEO_ID}
            className="!rounded-none h-full w-full"
            title={hero.title}
            autoplay
            mute
            controls={false}
            loop
            start={YT_START_SEC}
            fill
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 flex items-end pb-5 px-5 pointer-events-none">
          <div className="pointer-events-auto">
            <h1 className="h3 font-bold leading-tight text-white ">{hero.title}</h1>
            {hero.subtitle && <p className="mt-1 body-sm text-white/90">{hero.subtitle}</p>}
            <div className="mt-3 inline-flex items-center gap-1 rounded-lg px-5 py-2.5 body-sm font-bold text-white" style={{ backgroundColor: TOSS.blue }}>
              지금투자 추천
            </div>
          </div>
        </div>
      </Link>
    </section>
  );
}
