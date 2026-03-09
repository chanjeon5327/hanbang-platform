'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import UpbitLineBarsChart from '@/components/charts/UpbitLineBarsChart';
import LiveTradesLite from '@/components/market/LiveTradesLite';
import TradePanelUpbit from '@/components/market/TradePanelUpbit';
import { marketItems, formatKRW } from '@/lib/mock/marketItems';
import { makeRealisticSeries } from '@/lib/mock/series';

type Tab = 'decide' | 'price' | 'trade';
type TF = 'tick60' | 's30' | 'm1' | 'h1' | 'd1' | 'w1';

const TF_LABEL: Record<TF, string> = {
  tick60: '60틱',
  s30: '30초',
  m1: '1분',
  h1: '1시간',
  d1: '1일',
  w1: '1주',
};

function SegTabs<T extends string>({
  value,
  onChange,
  items,
}: {
  value: T;
  onChange: (v: T) => void;
  items: { key: T; label: string }[];
}) {
  return (
    <div className="inline-flex rounded-2xl border border-black/10 bg-white p-1 shadow-[0_6px_20px_rgba(0,0,0,0.04)]">
      {items.map((it) => (
        <button
          key={it.key}
          onClick={() => onChange(it.key)}
          className={`px-5 py-3 rounded-xl text-sm font-extrabold transition ${
            value === it.key ? 'bg-[#2563EB] text-white' : 'text-black/60 hover:text-black'
          }`}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

function TimeTabs({ value, onChange }: { value: TF; onChange: (v: TF) => void }) {
  const items: TF[] = ['tick60', 's30', 'm1', 'h1', 'd1', 'w1'];
  return (
    <div className="inline-flex rounded-xl border border-black/10 bg-white p-1">
      {items.map((k) => (
        <button
          key={k}
          onClick={() => onChange(k)}
          className={`px-3 py-2 rounded-lg text-sm font-extrabold transition ${
            value === k ? 'bg-[#2563EB] text-white' : 'text-black/60 hover:text-black'
          }`}
        >
          {TF_LABEL[k]}
        </button>
      ))}
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[12px] px-2.5 py-1 rounded-full bg-black/5 border border-black/10 text-black/70">
      {children}
    </span>
  );
}

type SectionCardProps = {
  title: string;
  subtitle?: string;
  tone?: 'default' | 'blue' | 'sky' | 'slate' | 'amber';
  children: React.ReactNode;
};

function SectionCard({ title, subtitle, tone = 'default', children }: SectionCardProps) {
  const toneMap = {
    default: {
      wrap: 'border-black/10 bg-white shadow-[0_8px_32px_rgba(0,0,0,0.08)]',
      head: 'border-black/5 bg-black/[0.02]',
      title: 'text-black',
      sub: 'text-black/55',
    },
    blue: {
      wrap: 'border-blue-200/60 bg-blue-50/40 shadow-[0_8px_32px_rgba(37,99,235,0.08)]',
      head: 'border-blue-200/50 bg-white/70',
      title: 'text-blue-950',
      sub: 'text-blue-950/60',
    },
    sky: {
      wrap: 'border-sky-200/60 bg-sky-50/50 shadow-[0_8px_32px_rgba(14,165,233,0.08)]',
      head: 'border-sky-200/50 bg-white/70',
      title: 'text-sky-950',
      sub: 'text-sky-950/60',
    },
    slate: {
      wrap: 'border-slate-200/70 bg-slate-50/80 shadow-[0_8px_32px_rgba(15,23,42,0.08)]',
      head: 'border-slate-200/60 bg-white/80',
      title: 'text-slate-950',
      sub: 'text-slate-950/60',
    },
    amber: {
      wrap: 'border-amber-200/70 bg-amber-50/70 shadow-[0_8px_32px_rgba(245,158,11,0.10)]',
      head: 'border-amber-200/60 bg-white/80',
      title: 'text-amber-950',
      sub: 'text-amber-950/60',
    },
  } as const;

  const ui = toneMap[tone];

  return (
    <section className={`overflow-hidden rounded-3xl border ${ui.wrap}`}>
      <div className={`border-b px-5 py-4 ${ui.head}`}>
        <h3 className={`text-[15px] font-extrabold tracking-[-0.02em] ${ui.title}`}>{title}</h3>
        {subtitle ? <p className={`mt-1 text-[12px] ${ui.sub}`}>{subtitle}</p> : null}
      </div>
      <div className="px-5 py-5">{children}</div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-[84px_1fr] gap-3 py-2">
      <div className="text-[12px] font-bold text-black/45">{label}</div>
      <div className="text-[14px] leading-6 text-black/80">{value}</div>
    </div>
  );
}

function BulletList({
  items,
  tone = 'default',
}: {
  items?: string[];
  tone?: 'default' | 'good' | 'warn' | 'roadmap';
}) {
  const safeItems = (items ?? []).filter(Boolean);
  if (!safeItems.length) return null;

  const toneClass =
    tone === 'good'
      ? 'border-blue-200/60 bg-blue-50/60 text-blue-950'
      : tone === 'warn'
      ? 'border-amber-200/70 bg-amber-50/70 text-amber-950'
      : tone === 'roadmap'
      ? 'border-slate-200/70 bg-slate-50/80 text-slate-950'
      : 'border-black/10 bg-white text-black';

  return (
    <div className="space-y-2">
      {safeItems.map((item, idx) => (
        <div
          key={`${item}-${idx}`}
          className={`rounded-2xl border px-4 py-3 text-[13px] leading-6 ${toneClass}`}
        >
          {tone === 'roadmap' ? (
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black/85 text-[11px] font-bold text-white">
                {idx + 1}
              </div>
              <div>{item}</div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <div className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-70" />
              <div>{item}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

type DetailTemplate = {
  oneLiner: string;
  revenueDescription: string;
  investmentPoints: string[];
  riskPoints: string[];
  roadmap: string[];
};

const DEFAULT_DETAIL_TEMPLATE: DetailTemplate = {
  oneLiner: '핵심 팬층이 이미 형성된 한류 콘텐츠 자산입니다.',
  revenueDescription: '콘텐츠에서 발생하는 수익을 정기적으로 모아 투자자와 나눕니다.',
  investmentPoints: [
    '초기 팬덤이 탄탄해 신규 유입 없이도 일정 수준의 수요가 유지됩니다.',
    '콘텐츠 특성상 시즌·에피소드 단위로 반복 소비가 발생합니다.',
  ],
  riskPoints: [
    '조회수·매출이 외부 플랫폼 알고리즘과 시장 상황에 따라 변동될 수 있습니다.',
    '초기 가정과 다른 성장 속도를 보일 수 있습니다.',
  ],
  roadmap: ['런칭 이후 6~12개월 동안 어떤 방식으로 확장·고도화할지에 대한 계획을 단계별로 제시합니다.'],
};

function resolveList(...candidates: unknown[]): string[] {
  for (const cand of candidates) {
    if (Array.isArray(cand) && cand.length) {
      return (cand as unknown[]).map((v) => String(v)).filter(Boolean);
    }
  }
  return [];
}

export default function MarketDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  const item = useMemo(() => marketItems.find((x) => x.id === id), [id]);

  const [tab, setTab] = useState<Tab>('decide');
  const [tf, setTf] = useState<TF>('tick60');

  const title = item?.title ?? `알 수 없는 종목 (${id})`;
  const category = item?.category ?? '카테고리';
  const price = item?.price ?? 12300;
  const chgPct = item?.chgPct ?? 0.0;
  const up = chgPct >= 0;

  const template = DEFAULT_DETAIL_TEMPLATE;
  const raw: any = item ?? {};
  const plan: any = raw.creator_plan ?? {};

  const overview: string | undefined = plan.overview ?? raw.overview;
  const targetAudience: string | undefined = plan.targetAudience ?? raw.target_audience;
  const revenueModel: string | undefined =
    plan.revenueModel ?? raw.revenue_model ?? template.revenueDescription;

  const investmentPoints = resolveList(
    plan.investment_points,
    raw.investment_points,
    template.investmentPoints,
  );
  const riskPoints = resolveList(plan.risk_points, raw.risk_points, template.riskPoints);
  const roadmapItems = resolveList(plan.roadmap_items, raw.roadmap_items, template.roadmap);

  const { series, mode } = useMemo(() => {
    if (tf === 'tick60') {
      return {
        mode: 'tick' as const,
        series: makeRealisticSeries({ seed: `tick60:${id}`, points: 60, start: 80, drift: up ? 0.02 : -0.02, vol: 1.1, spikeEvery: 11 }).map((v) => Math.round(v)),
      };
    }
    if (tf === 's30') {
      return {
        mode: 'sec' as const,
        series: makeRealisticSeries({ seed: `s30:${id}`, points: 30, start: 80, drift: up ? 0.04 : -0.03, vol: 1.2, spikeEvery: 7 }).map((v) => Math.round(v)),
      };
    }
    if (tf === 'm1') {
      return {
        mode: 'minute' as const,
        series: makeRealisticSeries({ seed: `m1:${id}`, points: 60, start: 80, drift: up ? 0.03 : -0.02, vol: 1.0, spikeEvery: 13 }).map((v) => Math.round(v)),
      };
    }
    if (tf === 'h1') {
      return {
        mode: 'hour' as const,
        series: makeRealisticSeries({ seed: `h1:${id}`, points: 60, start: 80, drift: up ? 0.01 : -0.01, vol: 0.9, spikeEvery: 17 }).map((v) => Math.round(v)),
      };
    }
    if (tf === 'd1') {
      return {
        mode: 'day' as const,
        series: makeRealisticSeries({ seed: `d1:${id}`, points: 30, start: 80, drift: up ? 0.05 : -0.03, vol: 1.0, spikeEvery: 9 }).map((v) => Math.round(v)),
      };
    }
    return {
      mode: 'week' as const,
      series: makeRealisticSeries({ seed: `w1:${id}`, points: 26, start: 80, drift: up ? 0.08 : -0.05, vol: 1.1, spikeEvery: 6 }).map((v) => Math.round(v)),
    };
  }, [tf, id, up]);

  const infoIntroBlock = (
    <SectionCard title="정보/소개" subtitle="프로젝트 개요와 핵심 정보" tone="default">
      <div className="space-y-5">
        {raw.thumbnail ? (
          <div
            className="h-[180px] rounded-2xl bg-cover bg-center"
            style={{ backgroundImage: `url('${raw.thumbnail}')` }}
          />
        ) : null}

        {template.oneLiner ? (
          <div className="rounded-2xl border border-black/10 bg-black/[0.02] px-4 py-4">
            <div className="text-[12px] font-bold text-black/45">한 줄 소개</div>
            <div className="mt-2 text-[15px] font-bold leading-6 tracking-[-0.02em] text-black">
              {template.oneLiner}
            </div>
          </div>
        ) : null}

        <div className="rounded-2xl border border-black/10 bg-white px-4 py-4">
          <div className="space-y-1 divide-y divide-black/5">
            <InfoRow label="프로젝트 개요" value={overview} />
            <InfoRow label="타깃 팬층" value={targetAudience} />
            <InfoRow label="수익 구조" value={revenueModel} />
          </div>
        </div>
      </div>
    </SectionCard>
  );

  const decideBlock = (
    <SectionCard
      title="살까말까"
      subtitle="투자 포인트와 리스크를 한눈에 정리"
      tone="blue"
    >
      <div className="space-y-5">
        {!!investmentPoints.length && (
          <div className="space-y-2">
            <div className="text-[13px] font-extrabold text-blue-950">투자 포인트</div>
            <BulletList items={investmentPoints} tone="good" />
          </div>
        )}

        {!!riskPoints.length && (
          <div className="space-y-2">
            <div className="text-[13px] font-extrabold text-amber-950">리스크</div>
            <BulletList items={riskPoints} tone="warn" />
          </div>
        )}

        {!!roadmapItems.length && (
          <div className="space-y-2">
            <div className="text-[13px] font-extrabold text-slate-950">로드맵</div>
            <BulletList items={roadmapItems} tone="roadmap" />
          </div>
        )}
      </div>
    </SectionCard>
  );

  const priceBlock = (
    <SectionCard title="지금얼마" subtitle="가격 · 시세 · 체결 흐름" tone="sky">
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-sky-200/60 bg-white/80 px-4 py-4">
            <div className="text-[11px] font-bold text-sky-900/45">현재가</div>
            <div className="mt-2 text-[18px] font-extrabold tracking-[-0.02em] text-sky-950">
              {formatKRW(price)}
            </div>
          </div>
          <div className="rounded-2xl border border-sky-200/60 bg-white/80 px-4 py-4">
            <div className="text-[11px] font-bold text-sky-900/45">변동</div>
            <div className="mt-2 text-[18px] font-extrabold tracking-[-0.02em] text-sky-950">
              {up ? '+' : ''}
              {chgPct.toFixed(1)}%
            </div>
          </div>
          <div className="rounded-2xl border border-sky-200/60 bg-white/80 px-4 py-4">
            <div className="text-[11px] font-bold text-sky-900/45">체결 흐름</div>
            <div className="mt-2 text-[13px] font-extrabold tracking-[-0.02em] text-sky-950">
              실시간 체결 데이터
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <div className="text-sm font-extrabold">가격 차트</div>
                <div className="mt-1 text-xs text-black/55">기본 60틱 (가장 즉각적인 움직임)</div>
              </div>
              <TimeTabs value={tf} onChange={setTf} />
            </div>
            <UpbitLineBarsChart values={series} theme="light" mode={mode} />
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
            <LiveTradesLite symbolId={id} basePrice={price} />
          </div>
        </div>
      </div>
    </SectionCard>
  );

  const tradeBlock = (
    <SectionCard title="거래하기" subtitle="매수 · 매도 주문 입력" tone="slate">
      <div className="space-y-5">
        <div className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-4">
          <div className="text-[12px] font-bold text-slate-900/45">주문 안내</div>
          <div className="mt-2 text-[13px] leading-6 text-slate-900/70">
            수량과 가격을 입력한 뒤 주문 버튼을 눌러 진행합니다.
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 px-4 py-4">
          <TradePanelUpbit assetId={id} basePrice={price} />
        </div>
      </div>
    </SectionCard>
  );

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#0B1120]">
      <header className="max-w-7xl mx-auto px-5 sm:px-6 pt-8 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs text-black/55">{category} · 콘텐츠 자산</div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-[-0.4px]">{title}</h1>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`/api/market/${id}/prospectus`}
              className="px-4 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-extrabold transition"
            >
              자료 PDF 다운로드
            </a>
            <Link
              href="/market"
              className="px-4 py-3 rounded-xl bg-white hover:bg-black/5 border border-black/10 text-sm font-bold transition"
            >
              마켓으로 →
            </Link>
          </div>
        </div>

        {/* 현재가 카드: 말풍선 위치 계산용 id */}
        <div id="market-price-card" className="mt-5 rounded-2xl border border-black/10 bg-white p-5 shadow-[0_6px_20px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <div className="text-xs text-black/50">현재가</div>
              <div className="mt-1 text-3xl font-extrabold tabular-nums">{formatKRW(price)}</div>
              <div className={`mt-1 text-sm font-extrabold tabular-nums ${up ? 'text-emerald-600' : 'text-red-500'}`}>
                {up ? '+' : ''}{chgPct.toFixed(1)}%
              </div>
            </div>

            <div className="flex-1">
              <div className="text-sm font-extrabold">이 자산은 무엇인가요?</div>
              <div className="mt-1 text-sm text-black/65 leading-relaxed">
                청약으로 참여한 뒤, <span className="font-bold">2차 거래</span>가 가능하며, 콘텐츠 수익을 <span className="font-bold">정기적으로 배분</span>받는 구조입니다.
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Chip>청약 + 거래형</Chip>
                <Chip>수익 배분형</Chip>
                <Chip>거래소 UI</Chip>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 sm:px-6 pb-14">
        {/* 스티키 탭: 데스크톱 전용 */}
        <div id="market-sticky-tabs" className="hidden lg:block sticky top-3 z-40 mb-6">
          <div className="inline-block rounded-2xl bg-[#F7F8FA]/90 backdrop-blur border border-black/10 p-2 shadow-[0_10px_24px_rgba(0,0,0,0.08)]">
            <SegTabs<Tab>
              value={tab}
              onChange={setTab}
              items={[
                { key: 'decide', label: '살까말까' },
                { key: 'price', label: '지금얼마' },
                { key: 'trade', label: '거래하기' },
              ]}
            />
          </div>
        </div>

        {!item && (
          <div className="mb-5 rounded-2xl border border-amber-300/40 bg-amber-100 p-5 text-amber-900">
            이 종목은 아직 목데이터에 없습니다. (id: <span className="font-bold">{id}</span>)
            <br />
            <Link className="underline" href="/market">
              마켓으로 돌아가기
            </Link>
          </div>
        )}

        {item && (
          <>
            {/* 모바일: 버튼형 탭 + 단일 카드 노출 */}
            <div className="lg:hidden space-y-6 pb-[calc(88px+env(safe-area-inset-bottom,0px))]">
              <div className="flex gap-2 rounded-2xl border border-black/10 bg-white p-1">
                <button
                  type="button"
                  onClick={() => setTab('decide')}
                  className={`flex-1 rounded-2xl py-3 text-sm font-extrabold transition border border-black/10 ${
                    tab === 'decide'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-black/70 hover:text-black'
                  }`}
                >
                  살까말까
                </button>
                <button
                  type="button"
                  onClick={() => setTab('price')}
                  className={`flex-1 rounded-2xl py-3 text-sm font-extrabold transition border border-black/10 ${
                    tab === 'price'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-black/70 hover:text-black'
                  }`}
                >
                  지금얼마
                </button>
                <button
                  type="button"
                  onClick={() => setTab('trade')}
                  className={`flex-1 rounded-2xl py-3 text-sm font-extrabold transition border border-black/10 ${
                    tab === 'trade'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-black/70 hover:text-black'
                  }`}
                >
                  거래하기
                </button>
              </div>

              {tab === 'decide' && (
                <div className="space-y-6">
                  {infoIntroBlock}
                  {decideBlock}
                </div>
              )}
              {tab === 'price' && priceBlock}
              {tab === 'trade' && tradeBlock}
            </div>

            {/* 데스크톱: 탭별 세로 스택 */}
            <div className="hidden lg:block">
              {tab === 'decide' && (
                <div className="space-y-8">
                  {infoIntroBlock}
                  {decideBlock}
                </div>
              )}
              {tab === 'price' && <div className="space-y-8">{priceBlock}</div>}
              {tab === 'trade' && <div className="space-y-8">{tradeBlock}</div>}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
