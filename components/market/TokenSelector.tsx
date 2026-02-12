'use client';

import { useState, useRef, useEffect } from 'react';
import { useToken } from '@/context/TokenContext';
import { TOKENS, TokenId } from '@/lib/tokens';

export default function TokenSelector() {
  const { quoteToken, setQuoteToken } = useToken();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const current = TOKENS.find((t) => t.id === quoteToken);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition"
        style={{
          backgroundColor: 'var(--upbit-panel)',
          borderColor: 'var(--upbit-border)',
          color: 'var(--upbit-text)',
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="text-[14px]">{current?.icon ?? '₩'}</span>
        <span className="text-[13px] font-semibold">{current?.symbol ?? 'KRW'}</span>
        <span className="text-[10px]" style={{ color: 'var(--upbit-text-dim)' }}>▾</span>
      </button>

      {open && (
        <ul
          className="absolute top-full right-0 mt-1 py-2 rounded-xl border overflow-hidden z-50 min-w-[140px]"
          style={{
            backgroundColor: 'var(--upbit-panel)',
            borderColor: 'var(--upbit-border)',
          }}
          role="listbox"
        >
          {TOKENS.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                role="option"
                aria-selected={quoteToken === t.id}
                onClick={() => {
                  setQuoteToken(t.id as TokenId);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-[14px] transition hover:bg-black/5"
                style={{
                  color: quoteToken === t.id ? 'var(--upbit-bid)' : 'var(--upbit-text)',
                  fontWeight: quoteToken === t.id ? 600 : 400,
                }}
              >
                <span>{t.icon}</span>
                <span>{t.symbol}</span>
                <span className="text-[11px]" style={{ color: 'var(--upbit-text-dim)' }}>
                  {t.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
