'use client';

import { useState } from 'react';
import { MessageCircle, Flag, Send, Ban } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { filterProfanity, containsProfanity } from '@/lib/chat/profanityFilter';

const MAX_MESSAGE_LENGTH = 300;

/**
 * 채팅 영역
 * - 로그인 유저만 작성 가능
 * - 비로그인: 읽기만
 * - 관리자 공지 고정 메시지 (pinned)
 * - 메시지 timestamp 표시
 * - 본인 메시지 우측 정렬
 * - 신고 버튼 클릭 시 confirm UI
 * - 차단 기능 UI 준비
 * - 메시지 길이 제한 (300자)
 * - 욕설 필터 placeholder
 */
type ChatMessage = {
  id: string;
  userId: string;
  user: string;
  text: string;
  timestamp: string;
  isPinned?: boolean;
};

const MOCK_PINNED: ChatMessage = {
  id: 'pinned-1',
  userId: 'admin',
  user: '관리자',
  text: '본 수익권은 유튜브 광고 수익에 기반한 정산 구조입니다. 투자 전 이용약관을 확인해주세요.',
  timestamp: '2024-01-15 09:00',
  isPinned: true,
};

const MOCK_MESSAGES: ChatMessage[] = [
  { id: '1', userId: 'u1', user: '투자자A', text: '수익 예상 어떻게 보시나요?', timestamp: '14:30' },
  { id: '2', userId: 'u2', user: '크리에이터', text: '이번 달 광고 수익 괜찮았어요', timestamp: '14:31' },
  { id: '3', userId: 'u3', user: '투자자B', text: '청약 마감 언제까지인가요?', timestamp: '14:32' },
];

type Props = {
  marketId?: string;
};

export default function MarketChatSection({ marketId }: Props) {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [reportConfirm, setReportConfirm] = useState<string | null>(null);
  const [blockTarget, setBlockTarget] = useState<string | null>(null);
  const canWrite = !!user;
  const currentUserId = user?.id ?? '';

  const handleSend = () => {
    if (!canWrite || !input.trim()) return;
    if (containsProfanity(input.trim())) {
      alert('부적절한 표현이 포함되어 있습니다.');
      return;
    }
    const filtered = filterProfanity(input.trim());
    // TODO: API로 전송
    // 채팅 답변 시 알림 트리거: 답장 대상(원 메시지 작성자)이 있으면 notifyChatReply(원작성자_id, message_id, marketId) 호출
    setInput('');
  };

  const handleReportClick = (messageId: string) => {
    setReportConfirm(messageId);
  };

  const handleReportConfirm = () => {
    if (reportConfirm) {
      // TODO: POST /api/chat/report { message_id, reason }
      setReportConfirm(null);
    }
  };

  const handleBlockClick = (userId: string) => {
    setBlockTarget(userId);
  };

  const handleBlockConfirm = () => {
    if (blockTarget) {
      // TODO: POST /api/chat/block { user_id }
      setBlockTarget(null);
    }
  };

  return (
    <section className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--upbit-panel)', borderColor: 'var(--upbit-border)' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--upbit-border)' }}>
        <div className="flex items-center gap-2">
          <MessageCircle size={18} strokeWidth={2} style={{ color: 'var(--upbit-bid)' }} />
          <span className="font-bold text-[15px]" style={{ color: 'var(--upbit-text)' }}>투자자 채팅</span>
        </div>
      </div>

      {/* 관리자 공지 고정 (pinned) */}
      <div className="px-4 py-3" style={{ backgroundColor: 'rgba(30, 136, 229, 0.08)', borderBottom: '1px solid var(--upbit-border)' }}>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--upbit-bid)', color: '#fff' }}>공지</span>
        <p className="text-[13px] mt-2" style={{ color: 'var(--upbit-text)' }}>{MOCK_PINNED.text}</p>
        <span className="text-[11px] mt-1 block" style={{ color: 'var(--upbit-text-dim)' }}>{MOCK_PINNED.timestamp}</span>
      </div>

      {/* 메시지 목록 */}
      <div className="max-h-[200px] overflow-y-auto px-4 py-3 space-y-3">
        {MOCK_MESSAGES.map((m) => {
          const isOwn = m.userId === currentUserId;
          return (
            <div
              key={m.id}
              className={`flex items-start gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}
            >
              <div className={`flex-1 min-w-0 ${isOwn ? 'text-right' : ''}`}>
                <div className={`flex items-center gap-2 ${isOwn ? 'justify-end' : ''}`}>
                  <span className="text-[12px] font-medium" style={{ color: 'var(--upbit-text)' }}>{m.user}</span>
                  <span className="text-[11px]" style={{ color: 'var(--upbit-text-dim)' }}>{m.timestamp}</span>
                </div>
                <p className={`text-[13px] mt-0.5 ${isOwn ? 'ml-auto' : ''}`} style={{ color: 'var(--upbit-text)', maxWidth: '85%' }}>{m.text}</p>
              </div>
              {!isOwn && (
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => handleReportClick(m.id)}
                    className="p-1 rounded hover:bg-black/5 transition"
                    aria-label="신고"
                    title="신고"
                  >
                    <Flag size={14} strokeWidth={2} style={{ color: 'var(--upbit-text-dim)' }} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBlockClick(m.userId)}
                    className="p-1 rounded hover:bg-black/5 transition"
                    aria-label="차단"
                    title="차단"
                  >
                    <Ban size={14} strokeWidth={2} style={{ color: 'var(--upbit-text-dim)' }} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 입력 영역 */}
      <div className="px-4 py-3 border-t flex gap-2" style={{ borderColor: 'var(--upbit-border)' }}>
        <div className="flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
            placeholder={canWrite ? `메시지를 입력하세요 (${MAX_MESSAGE_LENGTH}자 이내)` : '로그인 후 작성 가능합니다'}
            disabled={!canWrite}
            maxLength={MAX_MESSAGE_LENGTH}
            className="w-full rounded-lg px-4 py-2.5 text-[14px] focus:outline-none border"
            style={{
              backgroundColor: canWrite ? 'var(--upbit-bg)' : 'var(--upbit-border)',
              borderColor: 'var(--upbit-border)',
              color: 'var(--upbit-text)',
              opacity: canWrite ? 1 : 0.7,
            }}
          />
          {canWrite && input.length > 0 && (
            <span className="text-[11px] mt-0.5 block" style={{ color: 'var(--upbit-text-dim)' }}>{input.length}/{MAX_MESSAGE_LENGTH}</span>
          )}
        </div>
        <button
          type="button"
          onClick={handleSend}
          disabled={!canWrite || !input.trim()}
          className="p-2.5 rounded-lg disabled:opacity-50 transition shrink-0"
          style={{ backgroundColor: canWrite ? 'var(--upbit-bid)' : 'var(--upbit-border)', color: '#fff' }}
        >
          <Send size={18} strokeWidth={2} />
        </button>
      </div>

      {/* 신고 확인 모달 */}
      {reportConfirm && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-xl p-4 max-w-sm w-full" style={{ color: 'var(--upbit-text)' }}>
            <h3 className="font-bold text-[16px] mb-2">메시지 신고</h3>
            <p className="text-[14px] mb-4" style={{ color: 'var(--upbit-text-dim)' }}>해당 메시지를 신고하시겠습니까? 검토 후 조치됩니다.</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setReportConfirm(null)}
                className="flex-1 py-2.5 rounded-lg border"
                style={{ borderColor: 'var(--upbit-border)', color: 'var(--upbit-text)' }}
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleReportConfirm}
                className="flex-1 py-2.5 rounded-lg text-white"
                style={{ backgroundColor: 'var(--upbit-ask)' }}
              >
                신고
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 차단 확인 모달 */}
      {blockTarget && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-xl p-4 max-w-sm w-full" style={{ color: 'var(--upbit-text)' }}>
            <h3 className="font-bold text-[16px] mb-2">사용자 차단</h3>
            <p className="text-[14px] mb-4" style={{ color: 'var(--upbit-text-dim)' }}>해당 사용자를 차단하시겠습니까? 차단 시 해당 사용자의 메시지가 보이지 않습니다.</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setBlockTarget(null)}
                className="flex-1 py-2.5 rounded-lg border"
                style={{ borderColor: 'var(--upbit-border)', color: 'var(--upbit-text)' }}
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleBlockConfirm}
                className="flex-1 py-2.5 rounded-lg text-white"
                style={{ backgroundColor: 'var(--upbit-ask)' }}
              >
                차단
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
