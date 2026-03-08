import { buildDetailTemplate, type MarketDetailLike } from '@/lib/market/detailTemplates'
import { getDetailTone } from '@/components/market/detail-v2/detailTone'

type Props = {
  item: MarketDetailLike | null
}

export default function PriceSnapshotPanel({ item }: Props) {
  const safeItem = item ?? {}
  const template = buildDetailTemplate(safeItem)
  const tone = getDetailTone(safeItem)
  const spotlight = template.spotlightItems.filter((m) => (m.value ?? '').toString().trim().length > 0).slice(0, 4)
  const recent = template.recentPerformance.filter(Boolean).slice(0, 3)

  return (
    <section className="px-4 pt-4">
      <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,#10151d_0%,#0d1118_55%,#080a10_100%)] shadow-[0_18px_60px_rgba(0,0,0,0.34)]">
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-medium tracking-[0.02em] ${tone.panelBadgeClass}`}>
              지금 얼마 / 핵심 지표
            </div>
            <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] text-zinc-300">
              가격 해석 패널
            </div>
          </div>

          <h3 className="mt-4 text-[21px] font-semibold leading-[1.25] tracking-[-0.02em] text-white">
            가격만이 아니라 맥락을 같이 보셔야 합니다
          </h3>
          <p className="mt-2 text-[13px] leading-6 text-zinc-300">
            기준 가격, 운영 주체, 플랫폼, 최근 성과를 함께 보면서 판단할 수 있도록 정리했습니다.
          </p>

          {spotlight.length > 0 && (
          <div className="mt-5 grid grid-cols-2 gap-3">
            {spotlight.map((metric) => (
              <div
                key={`${metric.label}-${metric.value}`}
                className="rounded-[24px] border border-white/10 bg-white/[0.05] px-4 py-4"
              >
                <div className="text-[11px] tracking-[0.02em] text-zinc-400">
                  {metric.label}
                </div>
                <div className="mt-2 text-[14px] font-semibold leading-5 text-white">
                  {metric.value}
                </div>
              </div>
            ))}
          </div>
          )}

          <div className="mt-5 grid gap-3 md:grid-cols-[1.1fr,0.9fr]">
            <div className="rounded-[26px] border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-[14px] font-semibold text-white">최근 성과 해석</h4>
                <span className="text-[11px] text-zinc-400">시장 메모</span>
              </div>

              <ul className="mt-3 space-y-2">
                {recent.length > 0 ? recent.map((point, idx) => (
                  <li key={idx} className="text-[13px] leading-6 text-zinc-300">
                    {point}
                  </li>
                )) : null}
              </ul>
            </div>

            <div className={`rounded-[26px] border p-4 ${tone.softClass}`}>
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-[14px] font-semibold text-white">판단 포인트</h4>
                <span className="text-[11px] text-zinc-300">{tone.summaryTag}</span>
              </div>

              <div className="mt-3 grid gap-2">
                <div className="rounded-2xl border border-white/10 bg-black/15 px-3 py-3">
                  <div className="text-[11px] text-zinc-400">카테고리 해석</div>
                  <div className="mt-1 text-[13px] leading-5 text-white">{tone.marketHint}</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/15 px-3 py-3">
                  <div className="text-[11px] text-zinc-400">수익 축</div>
                  <div className="mt-1 text-[13px] leading-5 text-white">{template.revenueTitle}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
