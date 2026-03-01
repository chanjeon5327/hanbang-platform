'use client';

import { useEffect, useState } from 'react';
import { FileDown } from 'lucide-react';
import { formatKrw, formatRate } from '@/lib/utils/format';
import { FALLBACK_PREVIEW_IMAGE } from '@/lib/thumbnails';

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function AnimatedNumber({
  value,
  duration = 800,
  format = (n) => n.toLocaleString('ko-KR'),
}: {
  value: number;
  duration?: number;
  format?: (n: number) => string;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      setDisplay(Math.round(start + (value - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [value, duration]);

  return <span className="tabular-nums" style={{ letterSpacing: '-0.5px' }}>{format(display)}</span>;
}

type Props = { item: Record<string, unknown> | null };

export default function MarketHeroHybrid({ item }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const title = (item?.title as string) ?? '—';
  const fxRate = Number(item?.fx_rate) || 1350;
  const sharePriceUsd = Number(item?.share_price_usd) || 10;
  const sharePriceKrw = sharePriceUsd * fxRate;
  const prevCloseUsd = sharePriceUsd * 0.98;
  const changeRate = ((sharePriceUsd - prevCloseUsd) / prevCloseUsd) * 100;
  const isUp = changeRate > 0;
  const category = (item?.category_name as string) ?? (item?.category as string) ?? (Array.isArray(item?.tags) ? item.tags[0] : null) ?? '웹툰';
  const yieldRate = Number(item?.expected_yield_rate ?? item?.yield_rate ?? item?.expectedAnnualYield) || 15.5;
  const planPdfUrl = (item?.plan_pdf_url as string) ?? (item?.creator_plan_pdf as string) ?? '/sample-plan.pdf';
  const thumbnailUrl = (item?.thumbnail_url as string) || FALLBACK_PREVIEW_IMAGE;
  const buyRatio = 0.62;

  return (
    <section
      className="w-full px-4 py-6 md:py-8"
      style={{
        background: 'linear-gradient(180deg, #0f1220 0%, #1a1f35 100%)',
      }}
    >
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {/* 좌측: OTT 영역 */}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900">
          <img
            src={thumbnailUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              const el = e.currentTarget;
              if (!el.src.includes('placeholders/')) el.src = FALLBACK_PREVIEW_IMAGE;
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.7) 100%)',
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
            <h1 className="text-xl md:text-[2rem] font-bold text-white mb-2" style={{ letterSpacing: '-0.5px' }}>
              {title}
            </h1>
            <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-white/20 text-white/90 mb-3">
              {String(category)}
            </span>
            <a
              href={String(planPdfUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/15 hover:bg-white/25 text-white text-sm font-medium transition-colors"
            >
              <FileDown size={16} />
              작가의 기획 PDF 다운로드
            </a>
          </div>
        </div>

        {/* 우측: 금융 패널 */}
        <div className="flex flex-col justify-center">
          <div className="text-2xl md:text-[3rem] font-bold text-white mb-1" style={{ fontWeight: 700, letterSpacing: '-0.5px' }}>
            {mounted ? (
              <AnimatedNumber
                value={Math.round(sharePriceKrw)}
                duration={800}
                format={(n) => formatKrw(n)}
              />
            ) : (
              formatKrw(sharePriceKrw)
            )}
          </div>
          <div className="flex items-center gap-2 mb-4">
            <span
              className={`text-base font-semibold ${isUp ? 'text-red-400' : 'text-blue-400'}`}
              style={{ fontSize: '1.2em' }}
            >
              {changeRate !== 0 ? `${isUp ? '+' : ''}${formatRate(changeRate)}` : '0.00%'}
            </span>
            <span className="text-white/60 text-sm">전일 대비</span>
          </div>

          <div className="mb-4">
            <div className="text-white/70 text-sm mb-1">수익 배분율</div>
            <div className="flex gap-4 text-sm">
              <span><span className="text-violet-400 font-medium">창작자 50%</span></span>
              <span><span className="text-blue-400 font-medium">투자자 47%</span></span>
              <span><span className="text-gray-400">수수료 3%</span></span>
            </div>
          </div>

          <div>
            <div className="text-white/70 text-sm mb-1.5">체결 흐름</div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{
                background: `linear-gradient(90deg, #ef4444 0%, #ef4444 ${buyRatio * 100}%, #3b82f6 ${buyRatio * 100}%, #3b82f6 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-white/50 mt-1">
              <span>매수 {Math.round(buyRatio * 100)}%</span>
              <span>매도 {Math.round((1 - buyRatio) * 100)}%</span>
            </div>
          </div>

          <div className="mt-4 text-white/60 text-sm">
            예상 수익률 <span className="text-white font-semibold" style={{ fontSize: '1.2em' }}>{Number(yieldRate)}%</span>
          </div>
        </div>
      </div>
    </section>
  );
}
