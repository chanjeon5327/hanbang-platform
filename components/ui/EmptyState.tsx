'use client';

type Props = {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  cta?: { label: string; onClick: () => void };
};

export default function EmptyState({ icon, title, description, cta }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && <div className="mb-4 opacity-60">{icon}</div>}
      <h3 className="body font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      {description && <p className="body-sm mb-4 max-w-[280px]" style={{ color: 'var(--text-secondary)' }}>{description}</p>}
      {cta && (
        <button
          onClick={cta.onClick}
          className="tap-scale rounded-xl px-6 py-2.5 font-semibold body-sm"
          style={{ backgroundColor: 'var(--royal-blue)', color: '#fff' }}
        >
          {cta.label}
        </button>
      )}
    </div>
  );
}
