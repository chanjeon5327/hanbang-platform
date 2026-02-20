'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

type Message = {
  id: string;
  text: string;
  isMe: boolean;
  time: string;
  initials: string;
};

const MOCK_MESSAGES: Message[] = [
  { id: '1', text: '이 종목 배당 일정 언제인가요?', isMe: false, time: '14:32', initials: '김' },
  { id: '2', text: '3월 15일 예정입니다. 공지 확인해보세요.', isMe: true, time: '14:33', initials: '나' },
  { id: '3', text: '청약 마감이 얼마 안 남았네요', isMe: false, time: '14:35', initials: '이' },
  { id: '4', text: '네, 4월 30일까지입니다.', isMe: true, time: '14:36', initials: '나' },
  { id: '5', text: '2차 시장 거래량이 많이 늘었어요', isMe: false, time: '14:38', initials: '박' },
  { id: '6', text: 'K-POP 투자 열기 때문인 것 같아요', isMe: false, time: '14:39', initials: '박' },
];

export default function LiveChatMock() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [input, setInput] = useState('');

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setMessages((prev) => [
      ...prev,
      { id: String(Date.now()), text: input.trim(), isMe: true, time: timeStr, initials: '나' },
    ]);
    setInput('');
  }, [input]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div
      style={{
        minHeight: 280,
        display: 'flex',
        flexDirection: 'column',
        background: '#FBF8F5',
        borderRadius: 12,
        padding: 16,
        fontFamily: 'var(--font-inter), Inter, sans-serif',
        fontWeight: 450,
        letterSpacing: '0.02em',
        lineHeight: 1.55,
      }}
    >
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              display: 'flex',
              flexDirection: m.isMe ? 'row-reverse' : 'row',
              alignItems: 'flex-end',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: m.isMe ? '#2563EB' : '#E5E7EB',
                color: m.isMe ? '#fff' : '#6B7280',
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {m.initials}
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: m.isMe ? 'flex-end' : 'flex-start',
                maxWidth: '70%',
              }}
            >
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: m.isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: m.isMe ? '#2563EB' : '#fff',
                  color: m.isMe ? '#fff' : '#111827',
                  fontSize: 15,
                  lineHeight: 1.55,
                  letterSpacing: '0.02em',
                  fontWeight: 450,
                  boxShadow: m.isMe ? 'none' : '0 1px 2px rgba(0,0,0,0.05)',
                }}
              >
                {m.text}
              </div>
              <span
                style={{
                  fontSize: 11,
                  color: '#9CA3AF',
                  marginTop: 4,
                }}
              >
                {m.time}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          gap: 8,
          marginTop: 12,
          paddingTop: 12,
          borderTop: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하세요..."
          style={{
            flex: 1,
            padding: '12px 16px',
            fontSize: 15,
            fontWeight: 450,
            letterSpacing: '0.02em',
            lineHeight: 1.55,
            border: '1px solid #E5E7EB',
            borderRadius: 24,
            background: '#fff',
            outline: 'none',
          }}
          onFocus={(e) => { e.target.style.borderColor = '#2563EB'; }}
          onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; }}
        />
        <button
          type="button"
          onClick={handleSend}
          style={{
            padding: '12px 20px',
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: '0.02em',
            background: '#2563EB',
            color: '#fff',
            border: 'none',
            borderRadius: 24,
            cursor: 'pointer',
          }}
        >
          전송
        </button>
      </div>
    </div>
  );
}
