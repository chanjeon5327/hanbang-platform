'use client';

import { useDataTheme } from '@/context/DataThemeContext';
import { THEMES } from '@/lib/design/themes';
import { v3 } from '@/lib/design/tokens';

export default function ThemeToggleV3() {
  const { theme, setTheme } = useDataTheme();

  return (
    <div
      className="flex gap-1 p-1 rounded-xl"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        padding: 4,
      }}
    >
      {(['apple', 'toss'] as const).map((id) => {
        const t = THEMES[id];
        const isActive = theme === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setTheme(id)}
            className="px-4 py-2 rounded-lg font-semibold transition"
            style={{
              fontSize: v3.caption.size,
              backgroundColor: isActive ? 'var(--royal-blue)' : 'transparent',
              color: isActive ? '#fff' : 'var(--text-secondary)',
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
