export type CreatorPlanFormValues = {
  summary: string
  overview: string
  targetAudience: string
  revenueModel: string
  investmentPoint1: string
  investmentPoint2: string
  investmentPoint3: string
  riskPoint1: string
  riskPoint2: string
  riskPoint3: string
  roadmap1: string
  roadmap2: string
  roadmap3: string
}

export const creatorPlanInitialValues: CreatorPlanFormValues = {
  summary: '',
  overview: '',
  targetAudience: '',
  revenueModel: '',
  investmentPoint1: '',
  investmentPoint2: '',
  investmentPoint3: '',
  riskPoint1: '',
  riskPoint2: '',
  riskPoint3: '',
  roadmap1: '',
  roadmap2: '',
  roadmap3: '',
}

export function toNonEmptyList(values: Array<string | undefined | null>): string[] {
  return values.map((v) => (v ?? '').trim()).filter(Boolean)
}

export type CreatorPlanPayload = ReturnType<typeof buildCreatorPlanPayload>

export function buildCreatorPlanPayload(values: CreatorPlanFormValues) {
  return {
    summary: values.summary.trim(),
    overview: values.overview.trim(),
    target_audience: values.targetAudience.trim(),
    revenue_model: values.revenueModel.trim(),
    investment_points: toNonEmptyList([
      values.investmentPoint1,
      values.investmentPoint2,
      values.investmentPoint3,
    ]),
    risk_points: toNonEmptyList([
      values.riskPoint1,
      values.riskPoint2,
      values.riskPoint3,
    ]),
    roadmap_items: toNonEmptyList([
      values.roadmap1,
      values.roadmap2,
      values.roadmap3,
    ]),
  }
}

/** 저장된 creator_plan payload를 폼 값으로 복원 (수정/재진입용) */
export function creatorPlanPayloadToFormValues(payload: CreatorPlanPayload | null | undefined): CreatorPlanFormValues {
  if (!payload) return creatorPlanInitialValues
  const inv = payload.investment_points ?? []
  const risk = payload.risk_points ?? []
  const road = payload.roadmap_items ?? []
  return {
    summary: (payload.summary ?? '').trim(),
    overview: (payload.overview ?? '').trim(),
    targetAudience: (payload.target_audience ?? '').trim(),
    revenueModel: (payload.revenue_model ?? '').trim(),
    investmentPoint1: inv[0] ?? '',
    investmentPoint2: inv[1] ?? '',
    investmentPoint3: inv[2] ?? '',
    riskPoint1: risk[0] ?? '',
    riskPoint2: risk[1] ?? '',
    riskPoint3: risk[2] ?? '',
    roadmap1: road[0] ?? '',
    roadmap2: road[1] ?? '',
    roadmap3: road[2] ?? '',
  }
}
