'use client';

type Props = {
  title: string;
  sub?: string;
  action?: React.ReactNode;
};

export default function SectionHeader({ title, sub, action }: Props) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="body-lg font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
        {sub && <p className="body-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{sub}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
