'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

type LedgerEntry = {
  entry_type: 'CASH_CREDIT' | 'CASH_DEBIT';
  amount: number;
  created_at: string;
};

export default function WalletPage() {
  const supabase = createClient();

  const [userId, setUserId] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWallet = async () => {
      // 1️⃣ 로그인 유저 확인
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.warn('❌ 로그인 유저 없음');
        setLoading(false);
        return;
      }

      // 🔥 결정타: 로그인 유저 ID 고정 출력
      console.log('🔥 로그인 유저 ID:', user.id);
      setUserId(user.id);

      // 2️⃣ 원장 조회 (RLS: user_id = auth.uid())
      const { data, error } = await supabase
        .from('ledger_entries')
        .select('entry_type, amount, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ ledger fetch error', error);
        setLoading(false);
        return;
      }

      // 3️⃣ 잔액 계산
      let sum = 0;
      data?.forEach((row) => {
        if (row.entry_type === 'CASH_CREDIT') sum += Number(row.amount);
        if (row.entry_type === 'CASH_DEBIT') sum -= Number(row.amount);
      });

      setEntries(data ?? []);
      setBalance(sum);
      setLoading(false);
    };

    loadWallet();
  }, [supabase]);

  if (loading) return <div className="p-4">로딩 중…</div>;

  return (
    <div className="p-4 space-y-6">
      {/* 🔎 디버그용 로그인 유저 ID */}
      <div className="text-xs text-gray-500">
        로그인 유저 ID: {userId}
      </div>

      {/* 잔액 카드 */}
      <div className="rounded-xl bg-black text-white p-6">
        <div className="text-sm opacity-70">내 자산 (KRW)</div>
        <div className="text-2xl font-bold">
          {balance.toLocaleString()} 원
        </div>
      </div>

      {/* 원장 내역 */}
      <div>
        <h2 className="font-semibold mb-2">원장 내역</h2>

        {entries.length === 0 && (
          <div className="text-sm text-gray-500">
            거래 내역이 없습니다.
          </div>
        )}

        <ul className="space-y-2">
          {entries.map((e, i) => (
            <li
              key={i}
              className="flex justify-between text-sm border-b pb-1"
            >
              <span>
                {e.entry_type === 'CASH_CREDIT' ? '충전' : '차감'}
              </span>
              <span>
                {e.entry_type === 'CASH_CREDIT' ? '+' : '-'}
                {Number(e.amount).toLocaleString()} 원
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
