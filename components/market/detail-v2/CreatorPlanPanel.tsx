import { buildDetailTemplate, type MarketDetailLike } from '@/lib/market/detailTemplates'
import { getDetailTone } from '@/components/market/detail-v2/detailTone'

type Props = {
  item: MarketDetailLike | null
}

function safeStr(v: unknown): string {
  if (typeof v === 'string') return v.trim()
  return ''
}

function hasCreatorPlanContent(item: MarketDetailLike | null): boolean {
  if (!item?.creator_plan) return false
  const p = item.creator_plan
  if (safeStr(p.summary).length > 0) return true
  if (safeStr(p.overview).length > 0) return true
  if (safeStr(p.target_audience).length > 0) return true
  if (safeStr(p.revenue_model).length > 0) return true
  if (Array.isArray(p.investment_points) && p.investment_points.some((x) => safeStr(x).length > 0)) return true
  if (Array.isArray(p.risk_points) && p.risk_points.some((x) => safeStr(x).length > 0)) return true
  if (Array.isArray(p.roadmap_items) && p.roadmap_items.some((x) => safeStr(x).length > 0)) return true
  return false
}

export default function CreatorPlanPanel({ item }: Props) {
  const safeItem = item ?? {}
  const template = buildDetailTemplate(safeItem)
  const tone = getDetailTone(safeItem)
  const roadmap = template.roadmap.filter(Boolean).slice(0, 3)
  const investmentPoints = template.investmentPoints.filter(Boolean).slice(0, 3)
  const riskPoints = template.riskPoints.filter(Boolean).slice(0, 3)
  const revenueDesc = template.revenueDescription.trim()
  const targetAudience = template.spotlightItems.find((m) =>
    ['타깃층', '주독자층', '팬 특성', '팬덤 성격', '팬 반응'].includes(m.label)
  )?.value?.trim() ?? ''
  const showInputSection = hasCreatorPlanContent(safeItem)

  return (
    <section className="px-4 pt-4">
      <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,#16121f_0%,#111827_55%,#090b11_100%)] shadow-[0_18px_60px_rgba(0,0,0,0.34)]">
        <div className="relative">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_28%)]" />

          <div className="relative p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="inline-flex rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-[11px] font-medium tracking-[0.02em] text-violet-200">
                작가 사업계획서
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] text-zinc-300">
                {showInputSection ? '출품자 입력 반영' : '출품 준비 자료'}
              </div>
            </div>

            {showInputSection && (
              <>
                <h3 className="mt-4 text-[21px] font-semibold leading-[1.25] tracking-[-0.02em] text-white">
                  출품자가 직접 쓴 설득 정보
                </h3>
                <p className="mt-2 text-[13px] leading-6 text-zinc-300">
                  한 줄 소개, 개요, 타깃 팬층, 수익 구조, 투자 포인트, 리스크, 로드맵을 투자자 관점에서 정리했습니다.
                </p>

                {template.oneLiner.length > 0 && (
                  <div className="mt-5 rounded-[26px] border border-white/10 bg-white/[0.04] p-4">
                    <h4 className="text-[13px] font-semibold text-zinc-300">한 줄 소개</h4>
                    <p className="mt-2 text-[14px] leading-6 text-white">{template.oneLiner}</p>
                  </div>
                )}

                {targetAudience.length > 0 && (
                  <div className="mt-4 rounded-[26px] border border-white/10 bg-white/[0.04] p-4">
                    <h4 className="text-[13px] font-semibold text-zinc-300">타깃 팬층</h4>
                    <p className="mt-2 text-[14px] leading-6 text-white">{targetAudience}</p>
                  </div>
                )}

                {revenueDesc.length > 0 && (
                  <div className="mt-4 rounded-[26px] border border-sky-500/20 bg-sky-500/[0.07] p-4">
                    <h4 className="text-[13px] font-semibold text-sky-200">현재 수익 구조</h4>
                    <p className="mt-2 text-[14px] leading-6 text-zinc-200 whitespace-pre-line">{revenueDesc}</p>
                  </div>
                )}

                {investmentPoints.length > 0 && (
                  <div className="mt-5 rounded-[26px] border border-emerald-500/20 bg-emerald-500/[0.07] p-4">
                    <h4 className="text-[14px] font-semibold text-white">투자 포인트</h4>
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
                  <div className="mt-4 rounded-[26px] border border-amber-500/20 bg-amber-500/[0.07] p-4">
                    <h4 className="text-[14px] font-semibold text-white">주의·리스크</h4>
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

                {roadmap.length > 0 && (
                  <div className="mt-4 rounded-[26px] border border-white/10 bg-black/20 p-4">
                    <h4 className="text-[14px] font-semibold text-white">향후 로드맵</h4>
                    <ol className="mt-3 space-y-2">
                      {roadmap.map((point, idx) => (
                        <li key={idx} className="flex gap-3 text-[13px] leading-6 text-zinc-300">
                          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 text-[11px] font-semibold text-white bg-white/[0.06]">
                            {idx + 1}
                          </span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-3">
                  <p className="text-[12px] leading-5 text-zinc-400">
                    아래에서 사업계획서 템플릿을 다운로드하거나, 출품 등록 페이지에서 수정할 수 있습니다.
                  </p>
                </div>
              </>
            )}

            {!showInputSection && (
              <>
                <h3 className="mt-4 text-[21px] font-semibold leading-[1.25] tracking-[-0.02em] text-white">
                  출품자는 사업계획서를 함께 준비해야 합니다
                </h3>
                <p className="mt-2 text-[13px] leading-6 text-zinc-300">
                  프로젝트 개요, 팬층, 수익 구조, 자금 사용 계획, 로드맵을 한 번에 설명하는 문서입니다.
                  투자자에게는 설득 자료이고, 출품자에게는 실행 계획서입니다.
                </p>
              </>
            )}

            <div className="mt-5 rounded-[26px] border border-violet-400/20 bg-violet-400/[0.08] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[16px] font-semibold text-white">
                    사업계획서 템플릿 다운로드
                  </div>
                  <div className="mt-1 text-[12px] leading-5 text-violet-100/80">
                    프로젝트 개요 · 팬덤 · 수익 구조 · 자금 사용 계획 · 6개월 로드맵 포함
                  </div>
                </div>
                <div className="hidden rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-[11px] text-white sm:block">
                  기본 양식
                </div>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <a
                  href="/templates/HANBANG_작가용_사업계획서_템플릿.md"
                  download
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 transition hover:bg-white/[0.12]"
                >
                  <div>
                    <div className="text-[14px] font-semibold text-white">
                      템플릿 다운로드
                    </div>
                    <div className="mt-1 text-[12px] text-zinc-300">
                      Markdown 작성본
                    </div>
                  </div>
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[12px] text-white">
                    다운로드
                  </span>
                </a>

                <a
                  href="/creator/register"
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 transition hover:bg-white/[0.05]"
                >
                  <div>
                    <div className="text-[14px] font-semibold text-white">
                      출품 등록하러 가기
                    </div>
                    <div className="mt-1 text-[12px] text-zinc-400">
                      자료 준비 후 출품 흐름 연결
                    </div>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[12px] text-white">
                    이동
                  </span>
                </a>
              </div>
            </div>

            {!showInputSection && (
              <>
                {investmentPoints.length > 0 || riskPoints.length > 0 ? (
                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    {investmentPoints.length > 0 && (
                      <div className="rounded-[26px] border border-emerald-500/20 bg-emerald-500/[0.07] p-4">
                        <div className="text-[14px] font-semibold text-white">
                          투자자가 이 문서를 보는 이유
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
                        <div className="text-[14px] font-semibold text-white">
                          출품자가 미리 써야 할 내용
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
                ) : null}

                {roadmap.length > 0 && (
                  <div className="mt-5 grid gap-3 md:grid-cols-[1.1fr,0.9fr]">
                    <div className="rounded-[26px] border border-white/10 bg-black/20 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="text-[14px] font-semibold text-white">
                          사업계획서에 꼭 들어갈 실행 항목
                        </h4>
                        <span className="text-[11px] text-zinc-400">핵심 3단계</span>
                      </div>

                      <ol className="mt-3 space-y-2">
                        {roadmap.map((point, idx) => (
                          <li key={idx} className="flex gap-3 text-[13px] leading-6 text-zinc-300">
                            <span className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 text-[11px] font-semibold text-white ${tone.softClass}`}>
                              {idx + 1}
                            </span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className={`rounded-[26px] border p-4 ${tone.softClass}`}>
                      <div className="text-[14px] font-semibold text-white">이 문서가 필요한 이유</div>
                      <p className="mt-3 text-[13px] leading-6 text-zinc-200">
                        좋은 출품은 감으로 설명하는 것이 아니라, 팬층과 수익 구조와 실행 계획을 문서로 보여줄 수 있어야 합니다.
                      </p>
                      <div className="mt-4 rounded-2xl border border-white/10 bg-black/15 px-3 py-3">
                        <div className="text-[11px] text-zinc-400">카테고리 힌트</div>
                        <div className="mt-1 text-[13px] leading-5 text-white">
                          {tone.marketHint}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-3">
                  <p className="text-[12px] leading-5 text-zinc-400">
                    템플릿은 기본 양식입니다. 실제 출품 단계에서는 프로젝트 개요, 팬층, 수익 구조,
                    최근 성과, 자금 사용 계획, 향후 6개월 로드맵을 가능한 구체적으로 작성해야 합니다.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
