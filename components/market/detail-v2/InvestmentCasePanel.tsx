import { buildDetailTemplate, type MarketDetailLike } from '@/lib/market/detailTemplates'
import { getDetailTone } from '@/components/market/detail-v2/detailTone'

type Props = {
  item: MarketDetailLike | null
}

export default function InvestmentCasePanel({ item }: Props) {
  const safeItem = item ?? {}
  const template = buildDetailTemplate(safeItem)
  const tone = getDetailTone(safeItem)

  const investmentPoints = template.investmentPoints.filter(Boolean).slice(0, 3)
  const riskPoints = template.riskPoints.filter(Boolean).slice(0, 3)
  const revenueDesc = template.revenueDescription.trim()
  const quickVerdict = [
    template.categoryLabel,
    template.revenueTitle,
    tone.marketHint,
  ].filter(Boolean)

  return (
    <section className="px-4 pt-4">
      <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,#11131b_0%,#0c1017_52%,#080a10_100%)] shadow-[0_18px_60px_rgba(0,0,0,0.34)]">
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-medium tracking-[0.02em] ${tone.panelBadgeClass}`}>
              왜 사야 하나
            </div>
            <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] text-zinc-300">
              투자 판단 패널
            </div>
          </div>

          <h3 className="mt-4 text-[21px] font-semibold leading-[1.25] tracking-[-0.02em] text-white">
            이 자산의 매력과 주의점을 한 번에 보세요
          </h3>
          <p className="mt-2 text-[13px] leading-6 text-zinc-300">
            가격만 보는 것이 아니라, 성장 동력과 리스크를 함께 봐야 제대로 판단할 수 있습니다.
          </p>

          {revenueDesc.length > 0 && (
            <div className="mt-5 rounded-[26px] border border-sky-500/20 bg-sky-500/[0.07] p-4">
              <h4 className="text-[14px] font-semibold text-sky-200">수익 구조</h4>
              <p className="mt-2 text-[13px] leading-6 text-zinc-200 whitespace-pre-line">{revenueDesc}</p>
            </div>
          )}

          {(investmentPoints.length > 0 || riskPoints.length > 0) && (
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {investmentPoints.length > 0 && (
              <div className="rounded-[26px] border border-emerald-500/20 bg-emerald-500/[0.07] p-4">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-[15px] font-semibold text-white">매력 포인트</h4>
                  <span className="text-[11px] text-emerald-100/80">상승 요인</span>
                </div>

                <ul className="mt-3 space-y-2">
                  {investmentPoints.map((point, idx) => (
                    <li key={idx} className="flex gap-2 text-[13px] leading-6 text-zinc-200">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {riskPoints.length > 0 && (
              <div className="rounded-[26px] border border-amber-500/20 bg-amber-500/[0.07] p-4">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-[15px] font-semibold text-white">주의 포인트</h4>
                  <span className="text-[11px] text-amber-100/80">체크 항목</span>
                </div>

                <ul className="mt-3 space-y-2">
                  {riskPoints.map((point, idx) => (
                    <li key={idx} className="flex gap-2 text-[13px] leading-6 text-zinc-200">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          )}

          {quickVerdict.length > 0 && (
            <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-[14px] font-semibold text-white">빠른 판단 메모</h4>
                <span className="text-[11px] text-zinc-400">요약</span>
              </div>

              <div className="mt-3 grid gap-2">
                {quickVerdict.map((line, idx) => (
                  <div
                    key={idx}
                    className="flex gap-2 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3"
                  >
                    <span className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${tone.dotClass}`} />
                    <p className="text-[13px] leading-6 text-zinc-200">{line}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
