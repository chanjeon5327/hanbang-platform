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

  const { series, mode } = useMemo(() => {
    if (tf === 'tick60') {
      return {
        mode: 'tick' as const,
        series: makeRealisticSeries({ seed: `tick60:${id}`, points: 60, start: 80, drift: up ? 0.02 : -0.02, vol: 1.1, spikeEvery: 11 }).map(v => Math.round(v)),
      };
    }
    if (tf === 's30') {
      return {
        mode: 'sec' as const,
        series: makeRealisticSeries({ seed: `s30:${id}`, points: 30, start: 80, drift: up ? 0.04 : -0.03, vol: 1.2, spikeEvery: 7 }).map(v => Math.round(v)),
      };
    }
    if (tf === 'm1') {
      return {
        mode: 'minute' as const,
        series: makeRealisticSeries({ seed: `m1:${id}`, points: 60, start: 80, drift: up ? 0.03 : -0.02, vol: 1.0, spikeEvery: 13 }).map(v => Math.round(v)),
      };
    }
    if (tf === 'h1') {
      return {
        mode: 'hour' as const,
        series: makeRealisticSeries({ seed: `h1:${id}`, points: 60, start: 80, drift: up ? 0.01 : -0.01, vol: 0.9, spikeEvery: 17 }).map(v => Math.round(v)),
      };
    }
    if (tf === 'd1') {
      return {
        mode: 'day' as const,
        series: makeRealisticSeries({ seed: `d1:${id}`, points: 30, start: 80, drift: up ? 0.05 : -0.03, vol: 1.0, spikeEvery: 9 }).map(v => Math.round(v)),
      };
    }
    return {
      mode: 'week' as const,
      series: makeRealisticSeries({ seed: `w1:${id}`, points: 26, start: 80, drift: up ? 0.08 : -0.05, vol: 1.1, spikeEvery: 6 }).map(v => Math.round(v)),
    };
  }, [tf, id, up]);

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
        {/* 스티키 탭: 말풍선 위치 계산용 id */}
        <div id="market-sticky-tabs" className="sticky top-3 z-40 mb-5">
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
            이 종목은 아직 목데이터에 없습니다. (id: <span className="font-bold">{id}</span>)<br />
            <Link className="underline" href="/market">마켓으로 돌아가기</Link>
          </div>
        )}

        {/* ✅ 살까말까: 공란 제거(2컬럼 풀) */}
        {tab === 'decide' && (
          <div className="grid lg:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-black/10 bg-white overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.05)]">
              <div className="h-[240px] bg-cover bg-center" style={{ backgroundImage: `url('${item?.thumbnail ?? ''}')` }} />
              <div className="p-5">
                <div className="text-sm font-extrabold">소개</div>
                <div className="mt-2 text-black/65 leading-relaxed">
                  청약 참여 → 보유 → 수익 배분 → (가능하면) 2차 거래까지, 한 번에 이해되는 구조입니다.
                </div>

                <div className="mt-4 rounded-xl border border-black/10 bg-black/5 p-4">
                  <div className="text-sm font-extrabold">핵심 요약(샘플)</div>
                  <ul className="mt-2 space-y-1 text-sm text-black/65">
                    <li>• 보유 기간: (예) 최소 30일</li>
                    <li>• 수익 배분: (예) 월 1회 정산</li>
                    <li>• 출구: (예) 거래하기에서 매도 가능</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-[0_6px_20px_rgba(0,0,0,0.05)]">
                <div className="text-sm font-extrabold">자료</div>
                <div className="mt-2 text-sm text-black/65">사업설명서/운영지표/계약 요약을 PDF로 제공합니다.</div>
                <a
                  href={`/api/market/${id}/prospectus`}
                  className="mt-4 inline-flex px-4 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-extrabold transition"
                >
                  자료 PDF 다운로드
                </a>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-[0_6px_20px_rgba(0,0,0,0.05)]">
                <div className="text-sm font-extrabold">예상(샘플)</div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-black/10 bg-black/5 p-4">
                    <div className="text-xs text-black/55">예상 월 매출</div>
                    <div className="mt-1 font-extrabold tabular-nums">₩ 12,500,000</div>
                  </div>
                  <div className="rounded-xl border border-black/10 bg-black/5 p-4">
                    <div className="text-xs text-black/55">예상 배분율</div>
                    <div className="mt-1 font-extrabold tabular-nums">3.2%</div>
                  </div>
                  <div className="rounded-xl border border-black/10 bg-black/5 p-4 col-span-2">
                    <div className="text-xs text-black/55">예상 수익(샘플)</div>
                    <div className="mt-1 font-extrabold tabular-nums">₩ 400,000 / 월</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'price' && (
          <div className="grid lg:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-[0_6px_20px_rgba(0,0,0,0.05)]">
              <div className="flex items-end justify-between gap-3 mb-4">
                <div>
                  <div className="text-sm font-extrabold">가격 차트</div>
                  <div className="text-xs text-black/55 mt-1">기본 60틱 (가장 즉각적인 움직임)</div>
                </div>
                <TimeTabs value={tf} onChange={setTf} />
              </div>

              <UpbitLineBarsChart values={series} theme="light" mode={mode} />
            </div>

            <LiveTradesLite symbolId={id} basePrice={price} />
          </div>
        )}

        {tab === 'trade' && (
          <TradePanelUpbit assetId={id} basePrice={price} />
        )}
      </main>
    </div>
  );
}
