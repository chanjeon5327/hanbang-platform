"use client";

import { useState } from "react";

export default function InvestorChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [text, setText] = useState("");

  const send = () => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, text]);
    setText("");
  };

  // ✅ [여기] 말풍선 버튼 위치
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-4 w-14 h-14 rounded-full
                   bg-purple-600 text-white shadow-xl
                   flex flex-col items-center justify-center
                   text-[10px] font-bold z-50"
      >
        💬
        <span>Talk</span>
      </button>
    );
  }

  // ✅ [여기] 실제 채팅창 UI
  return (
    <div className="fixed right-4 bottom-4 w-[360px] h-[420px]
                    bg-white border rounded-xl shadow-xl
                    flex flex-col z-50">
      {/* 헤더 */}
      <div className="px-4 py-2 border-b font-bold text-sm flex justify-between">
        투자자 채팅
        <button onClick={() => setOpen(false)}>✕</button>
      </div>

      {/* 메시지 */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
        {messages.map((m, i) => (
          <div key={i} className="bg-gray-100 px-3 py-2 rounded-lg">
            {m}
          </div>
        ))}
      </div>

      {/* 입력 */}
      <div className="p-2 border-t flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          className="flex-1 border rounded px-2 py-1 text-sm"
          placeholder="메시지 입력"
        />
        <button
          onClick={send}
          className="px-3 py-1 bg-purple-600 text-white rounded text-sm"
        >
          전송
        </button>
      </div>
    </div>
  );
}
