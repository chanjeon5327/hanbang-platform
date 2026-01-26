'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useUserAuth } from '@/context/UserAuthContext';

type WalletState = {
  balanceKRW: number;
  loading: boolean;
  refresh: () => Promise<void>;
};

const WalletContext = createContext<WalletState | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUserAuth();
  const [balanceKRW, setBalanceKRW] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchWallet = async () => {
    if (!user) {
      setBalanceKRW(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('wallets')
      .select('balance_krw')
      .eq('user_id', user.id)
      .single();

    if (!error && data) {
      setBalanceKRW(Number(data.balance_krw ?? 0));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWallet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return (
    <WalletContext.Provider
      value={{
        balanceKRW,
        loading,
        refresh: fetchWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return ctx;
}
