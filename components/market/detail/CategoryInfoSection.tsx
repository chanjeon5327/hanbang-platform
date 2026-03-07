'use client';

import { buildDetailTemplate, type MarketDetailLike } from '@/lib/market/detailTemplates';

type Props = {
  item: MarketDetailLike;
};

function SectionCard({
  title,
  children,
  tone = 'default',
}: {
  title: string;
  children: React.ReactNode;
  tone?: 'default' | 'positive' | 'risk';
}) {
  const toneClass =
    tone === 'positive'
      ? 'border-emerald-500/20 bg-emerald-500/[0.08]'
      : tone === 'risk'
        ? 'border-amber-500/20 bg-amber-500/[0.08]'
        : 'border-white/10 bg-white/[0.04]';

  return (
    <section className={`rounded-3xl border p-4 ${toneClass}`}>
      <h3 className="text-[15px] font-semibold text-white">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default function CategoryInfoSection({ item }: Props) {
  const template = buildDetailTemplate(item);

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.03] p-5">
        <div className="inline-flex rounded-full border border-sky-400/25 bg-sky-400/10 px-3 py-1 text-[11px] font-medium text-sky-200">
          {template.categoryLabel}
        </div>
        <h2 className="mt-3 text-[18px] font-semibold leading-snug text-white">
          이 자산은 왜 주목해야 하는가
        </h2>
        <p className="mt-2 text-[13px] leading-6 text-zinc-300">
          {template.oneLiner}
        </p>
      </section>

      <SectionCard title={template.spotlightTitle}>
        <div className="grid grid-cols-2 gap-3">
          {template.spotlightItems.map((metric) => (
            <div
              key={`${metric.label}-${metric.value}`}
              className="rounded-2xl border border-white/10 bg-black/20 p-3"
            >
              <div className="text-[11px] text-zinc-400">{metric.label}</div>
              <div className="mt-1 text-[13px] font-semibold leading-5 text-white">
                {metric.value}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="투자 포인트" tone="positive">
        <ul className="space-y-2">
          {template.investmentPoints.map((point, idx) => (
            <li key={idx} className="flex gap-2 text-[13px] leading-6 text-zinc-200">
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title="리스크 체크" tone="risk">
        <ul className="space-y-2">
          {template.riskPoints.map((point, idx) => (
            <li key={idx} className="flex gap-2 text-[13px] leading-6 text-zinc-200">
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title={template.revenueTitle}>
        <p className="text-[13px] leading-6 text-zinc-300">
          {template.revenueDescription}
        </p>
      </SectionCard>

      <SectionCard title="최근 성과 해석">
        <ul className="space-y-2">
          {template.recentPerformance.map((point, idx) => (
            <li key={idx} className="text-[13px] leading-6 text-zinc-300">
              {point}
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title="향후 로드맵">
        <ol className="space-y-2">
          {template.roadmap.map((point, idx) => (
            <li key={idx} className="flex gap-3 text-[13px] leading-6 text-zinc-200">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-[11px] font-semibold text-white">
                {idx + 1}
              </span>
              <span>{point}</span>
            </li>
          ))}
        </ol>
      </SectionCard>
    </div>
  );
}
