'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function WalletPage() {
  const supabase = createClient();

  const [userId, setUserId] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // 1️⃣ 현재 세션 확인
      const {
        data: { session },
      } = await supabase.auth.getSession();

      console.log('[wallet] session', session);

      if (!session?.user) {
        setUserId(null);
        setLoading(false);
        return;
      }

      setUserId(session.user.id);
    };

    initAuth();

    // 2️⃣ 이후 로그인/로그아웃 변화 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[wallet] auth change', session);

      setUserId(session?.user?.id ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!userId) return;

    const loadWallet = async () => {
      setLoading(true);

      console.log('[wallet] load ledger for', userId);

      const { data: rows, error } = await supabase
        .from('ledger_entries')
        .select('entry_type, amount, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[wallet] ledger error', error);
        setLoading(false);
        return;
      }

      let sum = 0;
      rows?.forEach((r) => {
        if (r.entry_type === 'CASH_CREDIT') sum += r.amount;
        if (r.entry_type === 'CASH_DEBIT') sum -= r.amount;
      });

      setBalance(sum);
      setEntries(rows ?? []);
      setLoading(false);
    };

    loadWallet();
  }, [userId]);

  if (loading) {
    return <div className="p-6">로딩중…</div>;
  }

  if (!userId) {
    return (
      <div className="p-6 text-center text-gray-500">
        로그인이 필요합니다.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="rounded-xl border p-6">
        <div className="text-gray-500 text-sm">보유 현금</div>
        <div className="text-2xl font-bold">
          {balance.toLocaleString()} 원
        </div>
      </div>

      <div className="rounded-xl border p-6">
        <div className="font-semibold mb-4">최근 거래</div>

        {entries.length === 0 ? (
          <div className="text-gray-400 text-sm">
            거래 내역이 없습니다.
          </div>
        ) : (
          <ul className="space-y-2 text-sm">
            {entries.slice(0, 5).map((e, i) => (
              <li key={i} className="flex justify-between">
                <span>{e.entry_type}</span>
                <span>{e.amount.toLocaleString()} 원</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
