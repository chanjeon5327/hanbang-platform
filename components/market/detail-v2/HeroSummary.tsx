import { buildDetailTemplate, type MarketDetailLike } from '@/lib/market/detailTemplates'

type Props = {
  item: MarketDetailLike | null
}

function pickText(...values: Array<unknown>) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
    if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  }
  return ''
}

export default function HeroSummary({ item }: Props) {
  const safeItem = item ?? {}
  const template = buildDetailTemplate(safeItem)

  const title = pickText(safeItem.title, safeItem.name, '대표 IP 자산')
  const creator = pickText(
    safeItem.creator_name,
    safeItem.creator,
    safeItem.channel_name,
    safeItem.artist_name,
    safeItem.team_name,
    '운영팀'
  )
  const thumbnail = pickText((safeItem as Record<string, unknown>).thumbnail_url)
  const spotlight = template.spotlightItems.slice(0, 4)
  const points = template.investmentPoints.slice(0, 2)

  return (
    <section className="px-4 pt-4">
      <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.28),transparent_28%),linear-gradient(135deg,#111827_0%,#0b1220_45%,#05070c_100%)] shadow-[0_18px_60px_rgba(0,0,0,0.38)]">
        <div className="relative">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_36%)]" />
          <div className="relative p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="inline-flex rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1 text-[11px] font-medium tracking-[0.02em] text-sky-100">
                {template.categoryLabel}
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] text-zinc-300">
                HANBANG 상세 요약
              </div>
            </div>

            <div className="mt-4 flex gap-4">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.06] shadow-[0_8px_24px_rgba(0,0,0,0.26)]">
                {thumbnail ? (
                  <img src={thumbnail} alt={title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center px-3 text-center text-[11px] text-zinc-300">
                    대표 썸네일
                  </div>
                )}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.35))]" />
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="text-[24px] font-semibold leading-[1.2] tracking-[-0.02em] text-white">
                  {title}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[12px] text-zinc-200">
                    운영 주체 {creator}
                  </span>
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[12px] text-emerald-200">
                    성장형 IP 자산
                  </span>
                </div>
                <p className="mt-3 text-[13px] leading-6 text-zinc-200">
                  {template.oneLiner}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {spotlight.map((metric) => (
                <div
                  key={`${metric.label}-${metric.value}`}
                  className="rounded-[22px] border border-white/10 bg-white/[0.05] px-4 py-3 backdrop-blur-0"
                >
                  <div className="text-[11px] tracking-[0.02em] text-zinc-400">
                    {metric.label}
                  </div>
                  <div className="mt-1 text-[14px] font-semibold leading-5 text-white">
                    {metric.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-[14px] font-semibold text-white">
                  지금 이 자산을 보는 이유
                </h3>
                <span className="text-[11px] text-zinc-400">핵심 요약 2가지</span>
              </div>

              <div className="mt-3 grid gap-2">
                {points.map((point, idx) => (
                  <div
                    key={idx}
                    className="flex gap-2 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3"
                  >
                    <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-sky-300" />
                    <p className="text-[13px] leading-6 text-zinc-200">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
