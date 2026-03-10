'use client';

type Props = {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  cta?: { label: string; onClick: () => void };
};

export default function EmptyState({ icon, title, description, cta }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      {icon && <div className="mb-3 opacity-60">{icon}</div>}
      <h3 className="text-[14px] font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      {description && <p className="text-[12px] mb-3 max-w-[260px]" style={{ color: 'var(--text-secondary)' }}>{description}</p>}
      {cta && (
        <button
          onClick={cta.onClick}
          className="tap-scale rounded-xl px-5 py-2 font-semibold text-[13px]"
          style={{ backgroundColor: 'var(--royal-blue)', color: '#fff' }}
        >
          {cta.label}
        </button>
      )}
    </div>
  );
}
