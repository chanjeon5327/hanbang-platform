'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import FloatingSupportBubble from '@/components/common/FloatingSupportBubble';
import UpbitLineBarsChart from '@/components/charts/UpbitLineBarsChart';
import LiveTradesLite from '@/components/market/LiveTradesLite';
import { marketItems, formatKRW } from '@/lib/mock/marketItems';
import { makeRealisticSeries } from '@/lib/mock/series';

type Tab = 'info' | 'price' | 'trade';

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
          className={`px-4 py-3 rounded-xl text-sm font-extrabold transition ${
            value === it.key ? 'bg-[#2563EB] text-white' : 'text-black/60 hover:text-black'
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
    <span className="text-[12px] px-2.5 py-1 rounded-full bg-black/5 border border-black/10 text-black/70">
      {children}
    </span>
  );
}

export default function MarketDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';

  const item = useMemo(() => marketItems.find((x) => x.id === id), [id]);
  const [tab, setTab] = useState<Tab>('info');

  const title = item?.title ?? `알 수 없는 종목 (${id})`;
  const category = item?.category ?? '카테고리';
  const price = item?.price ?? 12300;
  const chgPct = item?.chgPct ?? 0.0;
  const up = chgPct >= 0;

  // 1분 기준(60포인트) 리얼리티 더미
  const series = useMemo(() => {
    const vals = makeRealisticSeries({
      seed: `m1:${id}`,
      points: 60,
      start: 80,
      drift: (up ? 0.03 : -0.02),
      vol: 0.9,
      spikeEvery: 13,
    });
    // 보기 좋게 정수화
    return vals.map(v => Math.round(v));
  }, [id, up]);

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#0B1120]">
      <header className="max-w-7xl mx-auto px-5 sm:px-6 pt-8 pb-6">
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

        {/* 현재가 + 소개(옆 공간에) */}
        <div className="mt-5 rounded-2xl border border-black/10 bg-white p-5 shadow-[0_6px_20px_rgba(0,0,0,0.05)]">
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
                청약으로 참여한 뒤, <span className="font-bold">2차 거래</span>가 가능하며, 콘텐츠가 벌어들이는 수익을 <span className="font-bold">정기적으로 배분</span>받는 구조입니다.
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Chip>청약 + 거래형</Chip>
                <Chip>수익 배분형</Chip>
                <Chip>거래소 UI</Chip>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <SegTabs<Tab>
            value={tab}
            onChange={setTab}
            items={[
              { key: 'info', label: '정보' },
              { key: 'price', label: '시세' },
              { key: 'trade', label: '거래' },
            ]}
          />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 sm:px-6 pb-14">
        {!item && (
          <div className="mb-5 rounded-2xl border border-amber-300/40 bg-amber-100 p-5 text-amber-900">
            이 종목은 아직 목데이터에 없습니다. (id: <span className="font-bold">{id}</span>)<br />
            <Link className="underline" href="/market">마켓으로 돌아가기</Link>
          </div>
        )}

        {tab === 'info' && (
          <div className="grid lg:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-black/10 bg-white overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.05)]">
              <div className="h-[240px] bg-cover bg-center" style={{ backgroundImage: `url('${item?.thumbnail ?? ''}')` }} />
              <div className="p-5">
                <div className="text-sm font-extrabold">소개</div>
                <div className="mt-2 text-black/65 leading-relaxed">
                  &quot;청약 참여 → 보유 → 수익 배분 → (가능하면) 2차 거래&quot;를 한 문단으로 이해시키는 소개가 들어갑니다.
                </div>

                <div className="mt-4 rounded-xl border border-black/10 bg-black/5 p-4">
                  <div className="text-sm font-extrabold">핵심 요약(샘플)</div>
                  <ul className="mt-2 space-y-1 text-sm text-black/65">
                    <li>• 보유 기간: (예) 최소 30일</li>
                    <li>• 수익 배분: (예) 월 1회 정산</li>
                    <li>• 출구: (예) 거래 탭에서 매도 가능</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-[0_6px_20px_rgba(0,0,0,0.05)]">
                <div className="text-sm font-extrabold">자료</div>
                <div className="mt-2 text-sm text-black/65">
                  사업설명서/운영지표/계약 요약을 PDF로 제공합니다.
                </div>
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
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'price' && (
          <div className="grid lg:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-[0_6px_20px_rgba(0,0,0,0.05)]">
              <UpbitLineBarsChart
                values={series}
                theme="light"
                mode="minute"
                title="가격 차트"
                subtitle="1분 기준 · 위(얇은 선) + 아래(빨/파 띠/바)"
              />
            </div>
            <LiveTradesLite symbolId={id} basePrice={price} />
          </div>
        )}

        {tab === 'trade' && (
          <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-[0_6px_20px_rgba(0,0,0,0.05)]">
            <div className="text-sm font-extrabold">거래</div>
            <div className="mt-2 text-sm text-black/65">
              다음 단계에서 &quot;구매/판매/주문수정/체결내역 4버튼 + 호가 5개씩 + 버튼 크게&quot;를 업비트 톤으로 고정합니다.
            </div>
          </div>
        )}
      </main>

      <FloatingSupportBubble />
    </div>
  );
}
