'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

/* 업비트 사용법 레퍼런스: 단계형 스텝퍼 + 상태 배지 + CTA */
const UPBIT = { bg: '#0d0d0d', panel: '#161616', border: '#2b2b2b', bid: '#1e88e5', text: '#e0e0e0', dim: '#8e8e8e' };

type LoginModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) throw err;
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '로그인 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-[360px] rounded-[16px] overflow-hidden" style={{ backgroundColor: UPBIT.panel, border: `1px solid ${UPBIT.border}` }}>
        <div className="px-4 py-3 border-b flex justify-between items-center" style={{ borderColor: UPBIT.border }}>
          <h2 className="font-bold text-[16px]" style={{ color: UPBIT.text }}>로그인</h2>
          <button onClick={() => onOpenChange(false)} className="text-[14px]" style={{ color: UPBIT.dim }}>닫기</button>
        </div>

        <div className="p-4">
          <div className="flex gap-2 mb-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className="flex-1 h-1 rounded-full transition"
                style={{ backgroundColor: step >= s ? UPBIT.bid : UPBIT.border }}
              />
            ))}
          </div>
          <p className="text-[13px] mb-4" style={{ color: UPBIT.dim }}>1. 로그인 → 2. 고객확인 → 3. 원화입금</p>

          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일"
              required
              className="w-full rounded-lg px-4 py-3 text-[15px] focus:outline-none border"
              style={{ backgroundColor: UPBIT.bg, borderColor: UPBIT.border, color: UPBIT.text }}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              required
              className="w-full rounded-lg px-4 py-3 text-[15px] focus:outline-none border"
              style={{ backgroundColor: UPBIT.bg, borderColor: UPBIT.border, color: UPBIT.text }}
            />
            {error && <p className="text-[13px]" style={{ color: '#e53935' }}>{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-lg text-white text-[16px] font-bold transition disabled:opacity-50"
              style={{ backgroundColor: UPBIT.bid }}
            >
              {loading ? '처리 중…' : '이메일로 로그인'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
