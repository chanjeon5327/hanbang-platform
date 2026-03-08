'use client'

import type { CreatorPlanFormValues } from '@/lib/creator/creatorPlanFields'

type Props = {
  values: CreatorPlanFormValues
  onChange: (key: keyof CreatorPlanFormValues, value: string) => void
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
  helper,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  multiline?: boolean
  helper?: string
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,#121722_0%,#0d1219_100%)] p-4 shadow-[0_10px_28px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between gap-3">
        <label className="text-[14px] font-semibold text-white">{label}</label>
        {helper ? <span className="text-[11px] text-zinc-400">{helper}</span> : null}
      </div>

      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="mt-3 w-full rounded-[20px] border border-white/10 bg-white/[0.05] px-4 py-3 text-[14px] text-white outline-none placeholder:text-zinc-500"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-3 w-full rounded-[20px] border border-white/10 bg-white/[0.05] px-4 py-3 text-[14px] text-white outline-none placeholder:text-zinc-500"
        />
      )}
    </div>
  )
}

export default function CreatorPlanFormSection({ values, onChange }: Props) {
  return (
    <section className="space-y-4">
      <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,#151326_0%,#101521_52%,#090b12_100%)] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
        <div className="flex items-start justify-between gap-3">
          <div className="inline-flex rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-[11px] font-medium text-violet-200">
            출품 설득 정보
          </div>
          <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] text-zinc-300">
            상세페이지 연결 준비
          </div>
        </div>

        <h3 className="mt-4 text-[20px] font-semibold tracking-[-0.02em] text-white">
          출품자가 직접 써야 할 핵심 설명
        </h3>
        <p className="mt-2 text-[13px] leading-6 text-zinc-300">
          이 정보는 나중에 상세페이지의 &quot;왜 사야 하나 / 수익 구조 / 로드맵&quot; 같은 설득 영역으로 연결됩니다.
        </p>
      </div>

      <TextInput
        label="한 줄 소개"
        helper="상세 상단 요약"
        value={values.summary}
        onChange={(value) => onChange('summary', value)}
        placeholder="예: 20대 팬덤 중심의 성장형 유튜브 IP 자산"
      />

      <TextInput
        label="프로젝트 개요"
        helper="상세 설명 문장"
        value={values.overview}
        onChange={(value) => onChange('overview', value)}
        placeholder="이 프로젝트가 어떤 콘텐츠인지, 왜 성장 가능성이 있는지 설명해 주세요."
        multiline
      />

      <TextInput
        label="타깃 팬층"
        helper="시장성 설명"
        value={values.targetAudience}
        onChange={(value) => onChange('targetAudience', value)}
        placeholder="예: 10대 후반~20대 초반, K콘텐츠 팬덤 중심"
      />

      <TextInput
        label="현재 수익 구조"
        helper="상세 수익 구조"
        value={values.revenueModel}
        onChange={(value) => onChange('revenueModel', value)}
        placeholder="예: 광고, 협찬, 굿즈, 멤버십, 유료회차 등"
        multiline
      />

      <div className="grid gap-4 md:grid-cols-3">
        <TextInput
          label="투자 포인트 1"
          value={values.investmentPoint1}
          onChange={(value) => onChange('investmentPoint1', value)}
          placeholder="핵심 매력 1"
        />
        <TextInput
          label="투자 포인트 2"
          value={values.investmentPoint2}
          onChange={(value) => onChange('investmentPoint2', value)}
          placeholder="핵심 매력 2"
        />
        <TextInput
          label="투자 포인트 3"
          value={values.investmentPoint3}
          onChange={(value) => onChange('investmentPoint3', value)}
          placeholder="핵심 매력 3"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <TextInput
          label="리스크 1"
          value={values.riskPoint1}
          onChange={(value) => onChange('riskPoint1', value)}
          placeholder="리스크/주의점 1"
        />
        <TextInput
          label="리스크 2"
          value={values.riskPoint2}
          onChange={(value) => onChange('riskPoint2', value)}
          placeholder="리스크/주의점 2"
        />
        <TextInput
          label="리스크 3"
          value={values.riskPoint3}
          onChange={(value) => onChange('riskPoint3', value)}
          placeholder="리스크/주의점 3"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <TextInput
          label="로드맵 1"
          value={values.roadmap1}
          onChange={(value) => onChange('roadmap1', value)}
          placeholder="예: 대표 포맷 강화"
        />
        <TextInput
          label="로드맵 2"
          value={values.roadmap2}
          onChange={(value) => onChange('roadmap2', value)}
          placeholder="예: 팬 접점 확대"
        />
        <TextInput
          label="로드맵 3"
          value={values.roadmap3}
          onChange={(value) => onChange('roadmap3', value)}
          placeholder="예: 수익화 채널 확장"
        />
      </div>
    </section>
  )
}
