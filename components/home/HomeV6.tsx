'use client';

import HeroCinematic from '@/components/HeroCinematic';
import MarketTickerBar from '@/components/home/MarketTickerBar';
import CurationRail from '@/components/home/CurationRail';
import MyAssetCard from '@/components/home/MyAssetCard';
import MarketMoodStrip from '@/components/home/MarketMoodStrip';
import HallyuIndexSection from '@/components/home/HallyuIndexSection';
import DeadlineRail from '@/components/home/DeadlineRail';
import NewsSection from '@/components/home/NewsSection';
import OverlayRecoCard from '@/components/home/OverlayRecoCard';
import { marketItems } from '@/lib/mock/marketItems';

const HOME_TITLE_MAP: Record<string, string> = {
  '여행가 제이': '블루웨이 시즌3',
  '침착맨': '라운지 나인',
  '먹방연구소': '테이블 로그',
  'K-POP STAGE': '사운드 플로어',
  '영화 블록버스터': '필름 하우스',
};

const HOME_SUBTITLE_MAP: Record<string, string> = {
  '여행가 제이': '핵심 팬층이 안정적인 여행형 IP',
  '침착맨': '체류시간이 긴 토크형 콘텐츠 자산',
  '먹방연구소': '커머스와 협찬 확장이 쉬운 푸드형 채널',
  'K-POP STAGE': '팬덤 반응이 빠른 공연형 콘텐츠 프로젝트',
  '영화 블록버스터': '시리즈 확장성이 높은 영상형 IP 패키지',
};

function normalizeHomeTitle(value?: string | null) {
  if (!value) return value ?? '';
  return HOME_TITLE_MAP[value] ?? value;
}

function normalizeHomeSubtitle(title?: string | null, fallback?: string | null) {
  const safeTitle = title ?? '';
  if (HOME_SUBTITLE_MAP[safeTitle]) return HOME_SUBTITLE_MAP[safeTitle];
  return fallback ?? '';
}

type HomeSectionShellProps = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  tone?: 'default' | 'soft' | 'blue';
  noTopBorder?: boolean;
};

function HomeSectionShell({
  title,
  subtitle,
  children,
  tone = 'default',
  noTopBorder = false,
}: HomeSectionShellProps) {
  const toneClass =
    tone === 'blue'
      ? 'bg-blue-50/30'
      : tone === 'soft'
      ? 'bg-black/[0.015]'
      : 'bg-white';

  return (
    <section
      className={[
        'px-4 sm:px-5 py-7 sm:py-9',
        toneClass,
        noTopBorder ? '' : 'border-t border-black/5',
      ].join(' ')}
    >
      {title || subtitle ? (
        <div className="mb-4 sm:mb-5">
          {title ? (
            <h2 className="text-[18px] font-extrabold tracking-[-0.02em] text-black">
              {title}
            </h2>
          ) : null}
          {subtitle ? (
            <p className="mt-1 text-[13px] leading-6 text-black/55">
              {subtitle}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-4">{children}</div>
    </section>
  );
}

export default function HomeV6() {
  const trending4 = marketItems.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#0B1120]">
      <div className="pb-8 sm:pb-10">
        <section className="px-5 sm:px-6 pt-6 pb-4 max-w-7xl mx-auto">
          <HeroCinematic
            headline={
              <>
                내가 좋아하는 콘텐츠 사고 팔고,
                <br />
                매달 수익을 받습니다.
              </>
            }
            sublineTop="내가 좋아하는 크리에이터와 동업자가 됩니다."
            primaryCta={{ label: '지금 투자 시작', href: '/invest/start' }}
            secondaryCta={{ label: '마켓 둘러보기', href: '/market' }}
          />
        </section>
        <MarketTickerBar />

        <HomeSectionShell noTopBorder tone="default">
          {/* 1) 추천 큐레이팅 */}
          <CurationRail />
        </HomeSectionShell>

        <HomeSectionShell
          title="내 자산 한눈에"
          subtitle="숫자 대신 흐름 중심으로, 내 포지션을 가볍게 확인합니다."
          tone="soft"
        >
          {/* 2) 내 자산 (숫자 금지, 문구 중심) */}
          <MyAssetCard />
        </HomeSectionShell>

        <HomeSectionShell
          title="지금 주목받는 콘텐츠"
          subtitle="팬덤 반응과 체류시간이 높은 콘텐츠를 모았습니다."
          tone="default"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {trending4.map((it) => (
              <OverlayRecoCard key={it.id} item={{ ...it, title: normalizeHomeTitle(it.title) }} />
            ))}
          </div>
        </HomeSectionShell>

        <HomeSectionShell
          title="시장 동향"
          subtitle="지금 어떤 카테고리가 움직이는지 한 번에 봅니다."
          tone="soft"
        >
          {/* 4) 시장 동향(짧고 직관) */}
          <MarketMoodStrip />
        </HomeSectionShell>

        <HomeSectionShell
          title="한류 지수"
          subtitle="업비트형 차트로 한류 콘텐츠 시장 흐름을 살펴봅니다."
          tone="default"
        >
          {/* 5) 한류지수(업비트형: 위 얇은 선 + 아래 띠/바) */}
          <HallyuIndexSection />
        </HomeSectionShell>

        <HomeSectionShell
          title="마감 임박"
          subtitle="관심이 몰리는 종목부터 빠르게 확인하세요."
          tone="blue"
        >
          {/* 6) 마감 임박(썸네일+링크) */}
          <DeadlineRail />
        </HomeSectionShell>

        <HomeSectionShell
          title="뉴스"
          subtitle="투자 판단에 도움이 되는 소식을 짧게 정리했습니다."
          tone="default"
        >
          {/* 7) 뉴스(고객용) */}
          <NewsSection />
        </HomeSectionShell>
      </div>
    </div>
  );
}
