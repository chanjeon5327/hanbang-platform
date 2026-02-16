'use client';

type Tab = { id: string; label: string };
type Props = {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
};

export default function ChipTabs({ tabs, active, onChange }: Props) {
  return (
    <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className="flex-1 py-2 px-4 rounded-lg body-sm font-semibold transition-all tap-scale"
          style={{
            backgroundColor: active === t.id ? 'var(--royal-blue)' : 'transparent',
            color: active === t.id ? '#fff' : 'var(--text-secondary)',
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
