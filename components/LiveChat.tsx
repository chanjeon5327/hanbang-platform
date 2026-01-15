"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  time: string;
}

const dummyMessages: string[] = [
  '이거 지금 사도 되나요?',
  '가즈아! 🚀',
  '3층에 사람 있어요',
  '수익률 몇 퍼센트예요?',
  '오늘도 상승세네요',
  '매수 타이밍인가요?',
  '화이팅! 💪',
  '다음 목표가 어디인가요?',
  '롱으로 가는 게 맞나요?',
  '지금이 기회인 것 같은데',
];

const dummyUsers: string[] = [
  '투자왕123',
  '웹툰러버',
  '드라마매니아',
  '수익실현',
  '콘텐츠킹',
  '투자고수',
  '차트분석가',
  '익명의투자자',
];

export function LiveChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      user: '시스템',
      text: '투자자들과 실시간으로 소통하세요!',
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // 자동 스크롤 (scrollTop 직접 제어 - 전체 화면 스크롤 영향 0%)
  useEffect(() => {
    if (scrollRef.current) {
      // 채팅 컨테이너 내부만 스크롤을 맨 아래로 내림 (전체 화면 영향 0%)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]); // 메시지가 바뀔 때마다 실행

  // 가짜 메시지 자동 추가
  useEffect(() => {
    const interval = setInterval(() => {
      const randomMessage = dummyMessages[Math.floor(Math.random() * dummyMessages.length)];
      const randomUser = dummyUsers[Math.floor(Math.random() * dummyUsers.length)];
      
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}-${Math.random()}`,
          user: randomUser,
          text: randomMessage,
          time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 3000 + Math.random() * 5000); // 3~8초 간격

    return () => clearInterval(interval);
  }, []);

  const handleSend = () => {
    if (!inputText.trim()) return;

    setMessages(prev => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        user: '나',
        text: inputText,
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setInputText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: 'var(--card-bg)',
      borderRadius: '12px',
      border: '1px solid var(--border-color)',
      overflow: 'hidden',
    }}>
      {/* 헤더 */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: 'bold',
          color: 'var(--text-primary)',
          margin: 0,
        }}>
          💬 투자자들과 실시간 토론
        </h3>
      </div>

      {/* 메시지 영역 */}
      <div 
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          height: '500px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          overscrollBehavior: 'contain',
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.user === '나' ? 'flex-end' : 'flex-start',
            }}
          >
            {msg.user !== '나' && msg.user !== '시스템' && (
              <span style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                marginBottom: '4px',
              }}>
                {msg.user}
              </span>
            )}
            <div style={{
              maxWidth: '80%',
              padding: '8px 12px',
              borderRadius: '12px',
              backgroundColor: msg.user === '나' 
                ? 'var(--accent-color)' 
                : msg.user === '시스템'
                ? 'rgba(124, 58, 237, 0.2)'
                : 'var(--bg-secondary)',
              color: msg.user === '나' ? 'white' : 'var(--text-primary)',
              fontSize: '13px',
              wordBreak: 'break-word',
            }}>
              {msg.text}
            </div>
            <span style={{
              fontSize: '10px',
              color: 'var(--text-muted)',
              marginTop: '4px',
            }}>
              {msg.time}
            </span>
          </div>
        ))}
      </div>

      {/* 입력 영역 */}
      <div style={{
        padding: '12px',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        gap: '8px',
      }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="메시지를 입력하세요..."
          style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            fontSize: '13px',
            outline: 'none',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!inputText.trim()}
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            backgroundColor: inputText.trim() ? 'var(--accent-color)' : 'var(--text-muted)',
            color: 'white',
            border: 'none',
            cursor: inputText.trim() ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

