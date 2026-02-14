'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import { MessageCircle, Send, User } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { filterProfanity, containsProfanity } from '@/lib/chat/profanityFilter';
import { createClient } from '@/utils/supabase/client';

const MAX_MESSAGE_LENGTH = 300;
const POLL_INTERVAL_MS = 10_000;

const SEED_NICKNAMES = [
  '활발한튤립',
  '하늘거북이',
  '달빛고래',
  '새벽라디오',
  '금빛모래',
  '초록펭귄',
  '블루폭스',
  '별수집가',
];

const SEED_MESSAGES = [
  '월 수익 얼마지?',
  '오늘도 참여 늘었네',
  'D-Day 얼마 남음?',
  '배당 기준 말일이네',
  '가즈아',
  '이거 거래도 되나요?',
  '스프레드 괜찮다',
  '3일 정산 맞죠?',
];

type ChatMessage = {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  is_pinned: boolean;
  nickname: string;
  avatar_url: string | null;
};

type Props = {
  productId: string;
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

function showToast(msg: string) {
  if (typeof window !== "undefined" && (window as unknown as { toast?: (m: string) => void }).toast) {
    (window as unknown as { toast: (m: string) => void }).toast(msg);
  } else {
    alert(msg);
  }
}

export default function ProductChat({ productId }: Props) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [realtimeStatus, setRealtimeStatus] = useState<'realtime' | 'polling'>('realtime');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const canWrite = !!user;

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat/${productId}`, { cache: 'no-store' });
      const json = await res.json();
      setMessages(json?.messages ?? []);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`product_chat:${productId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'product_chat_messages', filter: `product_id=eq.${productId}` }, () => {
        fetchMessages();
      })
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeStatus('realtime');
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setRealtimeStatus('polling');
          if (!pollRef.current) {
            pollRef.current = setInterval(fetchMessages, POLL_INTERVAL_MS);
          }
        }
      });
    return () => {
      supabase.removeChannel(channel);
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [productId, fetchMessages]);

  const handleSend = async () => {
    if (!canWrite || !input.trim()) return;
    if (containsProfanity(input.trim())) {
      showToast('부적절한 표현이 포함되어 있습니다.');
      return;
    }
    const filtered = filterProfanity(input.trim());
    try {
      const res = await fetch(`/api/chat/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: filtered }),
      });
      const json = await res.json();
      if (json?.ok) {
        setInput('');
        fetchMessages();
      } else {
        const err = json?.error ?? '전송 실패';
        showToast(err === 'RATE_LIMIT' ? '잠시 후 다시 시도해 주세요.' : err);
      }
    } catch {
      showToast('전송 실패');
    }
  };

  const pinned = messages.filter((m) => m.is_pinned);
  const normal = messages.filter((m) => !m.is_pinned);

  const showSeed = !loading && normal.length === 0;
  const seedList = useMemo(() => {
    const shuffledMsgs = [...SEED_MESSAGES].sort(() => Math.random() - 0.5);
    const shuffledNicks = [...SEED_NICKNAMES].sort(() => Math.random() - 0.5);
    return shuffledMsgs.map((msg, i) => ({
      id: `seed-${i}`,
      user_id: 'seed',
      message: msg,
      created_at: new Date(Date.now() - (shuffledMsgs.length - i) * 60000).toISOString(),
      is_pinned: false,
      nickname: shuffledNicks[i] ?? '봇',
      avatar_url: null,
    }));
  }, []);

  const displayMessages = showSeed ? seedList : normal;

  return (
    <section className="rounded-3xl overflow-hidden p-4" style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--upbit-border)' }}>
        <div className="flex items-center gap-2">
          <MessageCircle size={18} strokeWidth={2} style={{ color: 'var(--upbit-bid)' }} />
          <span className="font-bold text-[15px]" style={{ color: 'var(--upbit-text)' }}>투자자 채팅</span>
        </div>
      </div>

      {/* 관리자 공지 고정 (pinned) */}
      {pinned.length > 0 && (
        <div className="px-4 py-3" style={{ backgroundColor: 'rgba(30, 136, 229, 0.08)', borderBottom: '1px solid var(--upbit-border)' }}>
          {pinned.map((m) => (
            <div key={m.id}>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--upbit-bid)', color: '#fff' }}>공지</span>
              <p className="text-[13px] mt-2" style={{ color: 'var(--upbit-text)' }}>{m.message}</p>
              <span className="text-[11px] mt-1 block" style={{ color: 'var(--upbit-text-dim)' }}>{formatTime(m.created_at)}</span>
            </div>
          ))}
        </div>
      )}

      {/* 메시지 목록 */}
      <div className="max-h-[200px] overflow-y-auto px-4 py-3 space-y-3">
        {loading ? (
          <p className="text-[13px]" style={{ color: 'var(--upbit-text-dim)' }}>로딩 중...</p>
        ) : displayMessages.length === 0 ? (
          <p className="text-[13px]" style={{ color: 'var(--upbit-text-dim)' }}>아직 메시지가 없습니다.</p>
        ) : (
          displayMessages.map((m) => (
            <div key={m.id} className="flex items-start gap-2">
              {m.user_id === 'seed' ? (
                <div className="shrink-0 flex flex-col items-center gap-0.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--upbit-border)' }}>
                    <User size={14} style={{ color: 'var(--upbit-text-dim)' }} />
                  </div>
                </div>
              ) : (
                <Link
                  href={`/profile/${m.user_id}`}
                  className="shrink-0 flex flex-col items-center gap-0.5"
                  aria-label={`${m.nickname} 프로필`}
                >
                  {m.avatar_url ? (
                    <img src={m.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--upbit-border)' }}>
                      <User size={14} style={{ color: 'var(--upbit-text-dim)' }} />
                    </div>
                  )}
                </Link>
              )}
              <div className="flex-1 min-w-0">
                {m.user_id === 'seed' ? (
                  <span className="text-[12px] font-medium inline-flex items-center gap-1.5" style={{ color: 'var(--upbit-text-dim)' }}>
                    {m.nickname}
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--upbit-border)', color: 'var(--upbit-text-dim)' }}>봇</span>
                  </span>
                ) : (
                  <Link href={`/profile/${m.user_id}`} className="text-[12px] font-medium hover:underline" style={{ color: 'var(--upbit-text)' }}>
                    {m.nickname}
                  </Link>
                )}
                <span className="text-[11px] ml-2" style={{ color: 'var(--upbit-text-dim)' }}>{formatTime(m.created_at)}</span>
                <p className="text-[13px] mt-0.5" style={{ color: 'var(--upbit-text)' }}>{m.message}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 입력 영역 */}
      <div className="px-4 py-3 border-t flex gap-2" style={{ borderColor: 'var(--upbit-border)' }}>
        {canWrite ? (
          <>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
              placeholder={`메시지를 입력하세요 (${MAX_MESSAGE_LENGTH}자 이내)`}
              maxLength={MAX_MESSAGE_LENGTH}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              className="flex-1 rounded-lg px-4 py-2.5 text-[14px] focus:outline-none border"
              style={{ backgroundColor: 'var(--upbit-bg)', borderColor: 'var(--upbit-border)', color: 'var(--upbit-text)' }}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-2.5 rounded-lg disabled:opacity-50 transition shrink-0"
              style={{ backgroundColor: 'var(--upbit-bid)', color: '#fff' }}
            >
              <Send size={18} strokeWidth={2} />
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="flex-1 py-2.5 rounded-lg text-center text-[14px] font-medium"
            style={{ backgroundColor: 'var(--upbit-border)', color: 'var(--upbit-text-dim)' }}
          >
            로그인 후 참여
          </Link>
        )}
      </div>
    </section>
  );
}
