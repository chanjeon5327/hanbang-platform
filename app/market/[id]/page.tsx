'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ConditionalTabPanel from '@/components/common/ConditionalTabPanel';
import MarketCandleChart from '@/components/charts/MarketCandleChart';
import LiveTradesLite from '@/components/market/LiveTradesLite';
import TradePanelUpbit from '@/components/market/TradePanelUpbit';
import { marketItems, formatKRW } from '@/lib/mock/marketItems';

type Tab = 'decide' | 'price' | 'trade';

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
    <div className="inline-flex rounded-xl border border-black/10 bg-white p-1 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
      {items.map((it) => (
        <button
          key={it.key}
          type="button"
          onClick={() => onChange(it.key)}
          className={`px-5 py-2 rounded-lg text-[13px] font-extrabold transition ${
            value === it.key ? 'bg-[#2563EB] text-white shadow-sm' : 'text-black/60 hover:text-black'
          }`}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-black/[0.04] border border-black/[0.08] text-black/60">
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
      wrap: 'border-black/10 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.06)]',
      head: 'border-black/5 bg-black/[0.018]',
      title: 'text-black',
      sub: 'text-black/50',
    },
    blue: {
      wrap: 'border-blue-200/60 bg-blue-50/40 shadow-[0_4px_16px_rgba(37,99,235,0.06)]',
      head: 'border-blue-200/50 bg-white/70',
      title: 'text-blue-950',
      sub: 'text-blue-950/55',
    },
    sky: {
      wrap: 'border-sky-200/60 bg-sky-50/50 shadow-[0_4px_16px_rgba(14,165,233,0.06)]',
      head: 'border-sky-200/50 bg-white/70',
      title: 'text-sky-950',
      sub: 'text-sky-950/55',
    },
    slate: {
      wrap: 'border-slate-200/70 bg-slate-50/80 shadow-[0_4px_16px_rgba(15,23,42,0.06)]',
      head: 'border-slate-200/60 bg-white/80',
      title: 'text-slate-950',
      sub: 'text-slate-950/55',
    },
    amber: {
      wrap: 'border-amber-200/70 bg-amber-50/70 shadow-[0_4px_16px_rgba(245,158,11,0.08)]',
      head: 'border-amber-200/60 bg-white/80',
      title: 'text-amber-950',
      sub: 'text-amber-950/55',
    },
  } as const;

  const ui = toneMap[tone];

  return (
    <section className={`overflow-hidden rounded-2xl border ${ui.wrap}`}>
      <div className={`border-b px-4 sm:px-5 py-3.5 ${ui.head}`}>
        <h3 className={`text-[14px] font-extrabold tracking-[-0.02em] ${ui.title}`}>{title}</h3>
        {subtitle ? <p className={`mt-0.5 text-[11px] ${ui.sub}`}>{subtitle}</p> : null}
      </div>
      <div className="px-4 sm:px-5 py-5">{children}</div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-[96px_1fr] gap-3 py-2.5">
      <div className="text-[11px] font-bold text-black/40 pt-[1px]">{label}</div>
      <div className="text-[13px] leading-[1.6] text-black/75">{value}</div>
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
      ? 'border-blue-200/50 bg-blue-50/50 text-blue-950'
      : tone === 'warn'
      ? 'border-amber-200/60 bg-amber-50/60 text-amber-950'
      : tone === 'roadmap'
      ? 'border-slate-200/60 bg-slate-50/70 text-slate-950'
      : 'border-black/10 bg-white text-black';

  return (
    <div className="space-y-2">
      {safeItems.map((item, idx) => (
        <div
          key={`${item}-${idx}`}
          className={`rounded-xl border px-3.5 py-2.5 text-[13px] leading-[1.65] ${toneClass}`}
        >
          {tone === 'roadmap' ? (
            <div className="flex items-start gap-3">
              <div className="mt-[1px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black/80 text-[10px] font-extrabold text-white">
                {idx + 1}
              </div>
              <div>{item}</div>
            </div>
          ) : (
            <div className="flex items-start gap-2.5">
              <div className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-60 flex-shrink-0" />
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

  const infoIntroBlock = (
    <SectionCard title="정보/소개" subtitle="프로젝트 개요와 핵심 정보" tone="default">
      <div className="space-y-3">
        {raw.thumbnail ? (
          <div
            className="h-[160px] rounded-xl bg-cover bg-center"
            style={{ backgroundImage: `url('${raw.thumbnail}')` }}
          />
        ) : null}

        {/* 한 줄 소개 */}
        <div className="rounded-xl border border-black/[0.08] bg-black/[0.02] px-3.5 py-3">
          <div className="text-[10px] font-bold text-black/40 tracking-wide uppercase mb-1">한 줄 소개</div>
          <div className="text-[14px] font-bold leading-[1.55] tracking-[-0.01em] text-black/85">
            {raw.overview
              ? raw.overview.split('. ')[0] + '.'
              : template.oneLiner}
          </div>
        </div>

        <div className="rounded-xl border border-black/[0.08] bg-white">
          <div className="divide-y divide-black/[0.05] px-3.5">
            <InfoRow label="프로젝트 개요" value={overview} />
            <InfoRow label="타깃 팬층" value={targetAudience} />
            <InfoRow label="수익 구조" value={revenueModel} />
          </div>
        </div>

        {/* 수익률 + 판매율 지표 */}
        {(item?.annualReturn || item?.soldPct !== undefined) && (
          <div className="grid grid-cols-2 gap-2">
            {item?.annualReturn && (
              <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/60 px-3.5 py-3">
                <div className="text-[10px] font-bold text-emerald-900/50 uppercase tracking-wide">예상 연수익률</div>
                <div className="mt-1 text-[20px] font-extrabold text-emerald-700 tabular-nums">
                  +{item.annualReturn}%
                </div>
              </div>
            )}
            {item?.soldPct !== undefined && (
              <div className="rounded-xl border border-black/10 bg-black/[0.02] px-3.5 py-3">
                <div className="text-[10px] font-bold text-black/40 uppercase tracking-wide">판매 진행률</div>
                <div className="mt-1 text-[20px] font-extrabold tabular-nums">{item.soldPct}%</div>
                <div className="mt-1.5 w-full h-[3px] rounded-full bg-black/10 overflow-hidden">
                  <div className="h-full rounded-full bg-[#2563EB]" style={{ width: `${item.soldPct}%` }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* PDF 투자설명서 CTA */}
        <a
          href={`/api/market/${id}/prospectus`}
          className="group flex items-center gap-4 w-full rounded-2xl border border-blue-200/70 bg-gradient-to-r from-blue-50/80 to-indigo-50/60 px-5 py-4 hover:from-blue-100/80 hover:to-indigo-100/60 transition"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#2563EB] shadow-[0_4px_12px_rgba(37,99,235,0.30)] group-hover:bg-[#1D4ED8] transition">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-extrabold text-blue-950 tracking-[-0.02em]">투자설명서 PDF</div>
            <div className="mt-0.5 text-[12px] text-blue-950/55">수익 구조 · 리스크 · 로드맵 전문 확인</div>
          </div>
          <div className="shrink-0 flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-[13px] font-extrabold text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)] group-hover:bg-[#1D4ED8] transition">
            다운로드
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </div>
        </a>
      </div>
    </SectionCard>
  );

  const decideBlock = (
    <SectionCard
      title="살까말까"
      subtitle="투자 포인트와 리스크를 한눈에 정리"
      tone="blue"
    >
      <div className="space-y-4">
        {!!investmentPoints.length && (
          <div className="space-y-2">
            <div className="text-[12px] font-extrabold text-blue-700 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              투자 포인트
            </div>
            <BulletList items={investmentPoints} tone="good" />
          </div>
        )}

        {!!riskPoints.length && (
          <div className="space-y-2">
            <div className="text-[12px] font-extrabold text-amber-700 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2l10 18H2L12 2z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <circle cx="12" cy="17" r="0.5" fill="currentColor"/>
              </svg>
              리스크
            </div>
            <BulletList items={riskPoints} tone="warn" />
          </div>
        )}

        {!!roadmapItems.length && (
          <div className="space-y-2">
            <div className="text-[12px] font-extrabold text-slate-700 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
              로드맵
            </div>
            <BulletList items={roadmapItems} tone="roadmap" />
          </div>
        )}
      </div>
    </SectionCard>
  );

  const priceBlock = (
    <SectionCard title="지금얼마" subtitle="가격 · 캔들차트 · 실시간 체결" tone="sky">
      <div className="space-y-3">
        {/* 가격 요약 3칸 */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-sky-200/60 bg-white/80 px-3 py-3">
            <div className="text-[10px] font-bold text-sky-900/45 uppercase tracking-wide">현재가</div>
            <div className="mt-1.5 text-[14px] sm:text-[15px] font-extrabold tracking-[-0.02em] text-sky-950 tabular-nums">
              {formatKRW(price)}
            </div>
          </div>
          <div className="rounded-xl border border-sky-200/60 bg-white/80 px-3 py-3">
            <div className="text-[10px] font-bold text-sky-900/45 uppercase tracking-wide">등락률</div>
            <div className={`mt-1.5 text-[14px] sm:text-[15px] font-extrabold tracking-[-0.02em] tabular-nums ${up ? 'text-[#1565C0]' : 'text-[#C62828]'}`}>
              {up ? '▲' : '▼'} {Math.abs(chgPct).toFixed(2)}%
            </div>
          </div>
          <div className="rounded-xl border border-sky-200/60 bg-white/80 px-3 py-3">
            <div className="text-[10px] font-bold text-sky-900/45 uppercase tracking-wide">
              {item?.annualReturn ? '예상 수익률' : '24h 거래량'}
            </div>
            <div className="mt-1.5 text-[14px] sm:text-[15px] font-extrabold tracking-[-0.02em] text-emerald-700">
              {item?.annualReturn ? `+${item.annualReturn}%` : formatKRW(Math.round(price * 184.7))}
            </div>
          </div>
        </div>

        {/* 메인 캔들차트 */}
        <div className="rounded-xl border border-black/10 bg-white overflow-hidden shadow-sm">
          <MarketCandleChart
            seed={id}
            basePrice={price}
            chgPct={chgPct}
            height={380}
          />
        </div>

        {/* 실시간 체결 */}
        <div className="rounded-xl border border-black/10 bg-white p-4 shadow-sm">
          <LiveTradesLite symbolId={id} basePrice={price} />
        </div>
      </div>
    </SectionCard>
  );

  const tradeBlock = (
    <div>
      {/* 거래 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-[16px] font-extrabold tracking-[-0.025em]">거래하기</h3>
          <span className="text-[12px] text-black/45">매수 · 매도 주문</span>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 rounded-full px-2.5 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
          실시간
        </span>
      </div>
      <TradePanelUpbit assetId={id} basePrice={price} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#0B1120]">
      {/* 헤더 */}
      <header className="max-w-7xl mx-auto px-5 sm:px-6 pt-6 pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-black/45">{category} · 콘텐츠 자산</span>
              {item?.tagMain && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2563EB]/8 border border-[#2563EB]/15 text-[#2563EB]">
                  {item.tagMain}
                </span>
              )}
            </div>
            <h1 className="mt-1 text-[20px] sm:text-[26px] font-extrabold tracking-[-0.4px]">{title}</h1>
            <div className="mt-0.5 text-[13px] text-black/50 font-medium">{item?.creator}</div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/market"
              className="px-3 py-2 rounded-xl bg-white hover:bg-black/5 border border-black/10 text-xs font-bold transition"
            >
              마켓 →
            </Link>
          </div>
        </div>

        {/* 현재가 카드 */}
        <div id="market-price-card" className="mt-3 rounded-2xl border border-black/10 bg-white px-4 py-3.5 shadow-[0_4px_14px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            {/* 좌: 가격 + 등락 */}
            <div className="flex items-baseline gap-3">
              <div>
                <div className="text-[10px] text-black/45 mb-0.5 tracking-wide uppercase">현재가</div>
                <div className="text-[26px] sm:text-[32px] font-extrabold tabular-nums tracking-tight">{formatKRW(price)}</div>
              </div>
              <div className={`text-[16px] font-extrabold tabular-nums ${up ? 'text-emerald-600' : 'text-red-500'}`}>
                {up ? '▲' : '▼'} {Math.abs(chgPct).toFixed(1)}%
              </div>
            </div>

            {/* 우: 보조 지표 */}
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <div>
                <div className="text-[10px] text-black/40 uppercase tracking-wide">24h 고가</div>
                <div className="text-[13px] font-extrabold tabular-nums">{formatKRW(Math.round(price * 1.04))}</div>
              </div>
              <div>
                <div className="text-[10px] text-black/40 uppercase tracking-wide">24h 저가</div>
                <div className="text-[13px] font-extrabold tabular-nums">{formatKRW(Math.round(price * 0.96))}</div>
              </div>
              <div>
                <div className="text-[10px] text-black/40 uppercase tracking-wide">24h 거래량</div>
                <div className="text-[13px] font-extrabold tabular-nums">{formatKRW(Math.round(price * 212))}</div>
              </div>
              {item?.annualReturn && (
                <div className="hidden sm:block">
                  <div className="text-[10px] text-black/40 uppercase tracking-wide">예상 연수익률</div>
                  <div className="text-[13px] font-extrabold text-emerald-700">+{item.annualReturn}%</div>
                </div>
              )}
            </div>
          </div>

          {/* 속성 칩 */}
          <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-black/[0.05] pt-2.5">
            <Chip>청약 + 거래형</Chip>
            <Chip>수익 배분형</Chip>
            <Chip>2차 유통 가능</Chip>
            {item?.tagMain && <Chip>{item.tagMain}</Chip>}
            {item?.momentum && (
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                item.momentum === '급상승' ? 'bg-blue-50 border-blue-200/60 text-blue-700' :
                item.momentum === '상승' ? 'bg-emerald-50 border-emerald-200/60 text-emerald-700' :
                item.momentum === '급락주의' ? 'bg-red-50 border-red-200/60 text-red-600' :
                item.momentum === '하락' ? 'bg-orange-50 border-orange-200/60 text-orange-700' :
                'bg-black/[0.04] border-black/[0.08] text-black/60'
              }`}>
                {item.momentum}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 sm:px-6 pb-10">
        {/* 스티키 탭: 데스크톱 */}
        <div id="market-sticky-tabs" className="hidden lg:flex sticky top-3 z-40 mb-4">
          <div className="inline-block rounded-2xl bg-[#F7F8FA]/92 backdrop-blur-sm border border-black/10 p-1.5 shadow-[0_10px_28px_rgba(0,0,0,0.08)]">
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
          <div className="mb-5 rounded-2xl border border-amber-300/40 bg-amber-50 p-5 text-amber-900 text-sm">
            이 종목은 아직 목데이터에 없습니다. (id: <span className="font-bold">{id}</span>)
            <br />
            <Link className="underline font-bold" href="/market">
              마켓으로 돌아가기
            </Link>
          </div>
        )}

        {item && (
          <>
            {/* 모바일: 버튼형 탭 */}
            <div className="lg:hidden space-y-4 pb-[calc(88px+env(safe-area-inset-bottom,0px))]">
              <div className="flex gap-1 rounded-xl border border-black/10 bg-white p-1 shadow-sm">
                {(['decide', 'price', 'trade'] as Tab[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className={`flex-1 rounded-lg py-2.5 text-[13px] font-extrabold transition ${
                      tab === t ? 'bg-[#2563EB] text-white shadow-sm' : 'text-black/55 hover:text-black'
                    }`}
                  >
                    {t === 'decide' ? '살까말까' : t === 'price' ? '지금얼마' : '거래하기'}
                  </button>
                ))}
              </div>

              <ConditionalTabPanel active={tab === 'decide'} className="space-y-4">
                {infoIntroBlock}
                {decideBlock}
                <button
                  type="button"
                  onClick={() => setTab('trade')}
                  className="w-full py-4 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[15px] font-extrabold shadow-[0_8px_24px_rgba(37,99,235,0.42)] transition active:scale-[0.98]"
                >
                  지금 거래하기 →
                </button>
              </ConditionalTabPanel>
              <ConditionalTabPanel active={tab === 'price'}>{priceBlock}</ConditionalTabPanel>
              <ConditionalTabPanel active={tab === 'trade'}>{tradeBlock}</ConditionalTabPanel>
            </div>

            {/* 데스크톱: 살까말까 2열, 나머지 1열 */}
            <div className="hidden lg:block">
              <ConditionalTabPanel active={tab === 'decide'}>
                <div className="grid lg:grid-cols-2 gap-4">
                  <div>{infoIntroBlock}</div>
                  <div>{decideBlock}</div>
                </div>
              </ConditionalTabPanel>
              <ConditionalTabPanel active={tab === 'price'}>{priceBlock}</ConditionalTabPanel>
              <ConditionalTabPanel active={tab === 'trade'}>{tradeBlock}</ConditionalTabPanel>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
