'use client';

import { useState } from 'react';

interface Props {
  roomKey: string;
}

export default function MobileInvestorChat({ roomKey }: Props) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<string[]>([]);

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, input]);
    setInput('');
  };

  return (
    <div style={{ border: '1px solid #333', padding: 12 }}>
      <div style={{ fontSize: 12, marginBottom: 8, color: '#666' }}>
        roomKey: {roomKey}
      </div>

      {/* 메시지 영역 */}
      <div style={{ minHeight: 80, marginBottom: 8 }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ padding: '4px 0' }}>
            {msg}
          </div>
        ))}
      </div>

      {/* 입력 */}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') sendMessage();
        }}
        placeholder="메시지 입력 후 Enter"
        style={{ width: '100%', padding: 8 }}
      />
    </div>
  );
}
