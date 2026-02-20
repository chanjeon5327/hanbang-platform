'use client';

import { useRef, useEffect } from 'react';

type Message = {
  id: string;
  text: string;
  isMe: boolean;
  time: string;
};

const MOCK_MESSAGES: Message[] = [
  { id: '1', text: '이 종목 배당 일정 언제인가요?', isMe: false, time: '14:32' },
  { id: '2', text: '3월 15일 예정입니다. 공지 확인해보세요.', isMe: true, time: '14:33' },
  { id: '3', text: '청약 마감이 얼마 안 남았네요', isMe: false, time: '14:35' },
  { id: '4', text: '네, 4월 30일까지입니다.', isMe: true, time: '14:36' },
  { id: '5', text: '2차 시장 거래량이 많이 늘었어요', isMe: false, time: '14:38' },
  { id: '6', text: 'K-POP 투자 열기 때문인 것 같아요', isMe: false, time: '14:39' },
];

export default function LiveChatMock() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, []);

  return (
    <div style={{ minHeight: 280, display: 'flex', flexDirection: 'column' }}>
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {MOCK_MESSAGES.map((m) => (
          <div
            key={m.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: m.isMe ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                maxWidth: '75%',
                padding: '10px 14px',
                borderRadius: m.isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: m.isMe ? '#2563EB' : '#F3F4F6',
                color: m.isMe ? '#fff' : '#111827',
                fontSize: 14,
                lineHeight: 1.5,
              }}
            >
              {m.text}
            </div>
            <span
              style={{
                fontSize: 11,
                color: '#9CA3AF',
                marginTop: 4,
                marginRight: m.isMe ? 4 : 0,
                marginLeft: m.isMe ? 0 : 4,
              }}
            >
              {m.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
