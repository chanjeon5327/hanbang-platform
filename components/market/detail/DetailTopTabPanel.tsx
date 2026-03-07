import CategoryInfoSection from '@/components/market/detail/CategoryInfoSection'
import { buildDetailTemplate, type MarketDetailLike } from '@/lib/market/detailTemplates'

type TopTabKey = 'thesis' | 'price' | 'info'

type Props = {
  tab: TopTabKey
  item: MarketDetailLike | null
}

function MiniCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <div className="text-[11px] text-zinc-400">{label}</div>
      <div className="mt-1 text-[14px] font-semibold text-white">{value}</div>
    </div>
  )
}

export default function DetailTopTabPanel({ tab, item }: Props) {
  const safeItem = item ?? {}
  const template = buildDetailTemplate(safeItem)

  if (tab === 'thesis') {
    return (
      <section className="px-4 py-4">
        <div className="rounded-3xl border border-white/10 bg-[#11141b] p-4">
          <div className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-medium text-emerald-200">
            살까말까
          </div>
          <h3 className="mt-3 text-[18px] font-semibold text-white">
            이 자산을 왜 주목해야 하나
          </h3>
          <p className="mt-2 text-[13px] leading-6 text-zinc-300">
            {template.oneLiner}
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.07] p-4">
              <div className="text-[13px] font-semibold text-white">투자 포인트</div>
              <ul className="mt-3 space-y-2">
                {template.investmentPoints.slice(0, 3).map((point, idx) => (
                  <li key={idx} className="flex gap-2 text-[13px] leading-6 text-zinc-200">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.07] p-4">
              <div className="text-[13px] font-semibold text-white">리스크 체크</div>
              <ul className="mt-3 space-y-2">
                {template.riskPoints.slice(0, 3).map((point, idx) => (
                  <li key={idx} className="flex gap-2 text-[13px] leading-6 text-zinc-200">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (tab === 'price') {
    const spotlight = template.spotlightItems.slice(0, 4)

    return (
      <section className="px-4 py-4">
        <div className="rounded-3xl border border-white/10 bg-[#11141b] p-4">
          <div className="inline-flex rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-[11px] font-medium text-sky-200">
            지금얼마
          </div>
          <h3 className="mt-3 text-[18px] font-semibold text-white">
            지금 확인해야 할 핵심 지표
          </h3>
          <p className="mt-2 text-[13px] leading-6 text-zinc-300">
            시장 가격만 보지 말고, 운영 주체·플랫폼·성과 흐름까지 함께 보셔야 합니다.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {spotlight.map((metric) => (
              <MiniCard
                key={`${metric.label}-${metric.value}`}
                label={metric.label}
                value={metric.value}
              />
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-[13px] font-semibold text-white">최근 성과 해석</div>
            <ul className="mt-3 space-y-2">
              {template.recentPerformance.slice(0, 3).map((point, idx) => (
                <li key={idx} className="text-[13px] leading-6 text-zinc-300">
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="px-4 py-4">
      <div className="rounded-3xl border border-white/10 bg-[#11141b] p-4">
        <div className="inline-flex rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-[11px] font-medium text-violet-200">
          정보
        </div>
        <h3 className="mt-3 text-[18px] font-semibold text-white">
          자산 정보 요약
        </h3>
        <p className="mt-2 text-[13px] leading-6 text-zinc-300">
          작품·채널 소개, 수익 구조, 로드맵을 먼저 요약해서 보여드립니다.
        </p>

        <div className="mt-4">
          <CategoryInfoSection item={safeItem} />
        </div>
      </div>
    </section>
  )
}
