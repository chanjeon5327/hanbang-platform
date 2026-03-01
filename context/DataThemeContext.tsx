'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { type DataThemeId, THEME_STORAGE_KEY } from '@/lib/design/themes';

const DEFAULT_THEME: DataThemeId = 'apple';

type DataThemeContextType = {
  theme: DataThemeId;
  setTheme: (theme: DataThemeId) => void;
};

const DataThemeContext = createContext<DataThemeContextType | undefined>(undefined);

function applyTheme(theme: DataThemeId) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
}

export function DataThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<DataThemeId>(DEFAULT_THEME);

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as DataThemeId | null;
    const next = stored && (stored === 'apple' || stored === 'toss') ? stored : DEFAULT_THEME;
    setThemeState(next);
    applyTheme(next);
  }, []);

  const setTheme = (next: DataThemeId) => {
    setThemeState(next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
    applyTheme(next);
  };

  return (
    <DataThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </DataThemeContext.Provider>
  );
}

export function useDataTheme() {
  const ctx = useContext(DataThemeContext);
  if (!ctx) throw new Error('useDataTheme must be used within DataThemeProvider');
  return ctx;
}
