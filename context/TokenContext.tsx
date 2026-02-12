'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { TokenId, TOKENS, formatAmount, krwToToken, tokenToKrw } from '@/lib/tokens';

type TokenContextType = {
  quoteToken: TokenId;
  setQuoteToken: (id: TokenId) => void;
  formatPrice: (krw: number) => string;
  krwToQuote: (krw: number) => number;
  quoteToKrw: (amount: number) => number;
};

const TokenContext = createContext<TokenContextType | undefined>(undefined);

const STORAGE_KEY = 'hanbang_quote_token';

export function TokenProvider({ children }: { children: ReactNode }) {
  const [quoteToken, setQuoteTokenState] = useState<TokenId>('KRW');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as TokenId | null;
    if (stored && TOKENS.some((t) => t.id === stored)) {
      setQuoteTokenState(stored);
    }
  }, []);

  const setQuoteToken = useCallback((id: TokenId) => {
    setQuoteTokenState(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, id);
    }
  }, []);

  const formatPrice = useCallback(
    (krw: number) => formatAmount(krwToToken(krw, quoteToken), quoteToken),
    [quoteToken]
  );

  const krwToQuote = useCallback((krw: number) => krwToToken(krw, quoteToken), [quoteToken]);
  const quoteToKrw = useCallback((amount: number) => tokenToKrw(amount, quoteToken), [quoteToken]);

  return (
    <TokenContext.Provider
      value={{
        quoteToken,
        setQuoteToken,
        formatPrice,
        krwToQuote,
        quoteToKrw,
      }}
    >
      {children}
    </TokenContext.Provider>
  );
}

export function useToken() {
  const ctx = useContext(TokenContext);
  if (!ctx) throw new Error('useToken must be used within TokenProvider');
  return ctx;
}
