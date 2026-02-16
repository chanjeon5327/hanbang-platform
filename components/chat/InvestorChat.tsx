"use client";

import { useState } from "react";

export default function InvestorChat() {
    const [open, setOpen] = useState(false);
  
    return (
      <>
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="fixed right-4 bottom-4 w-14 h-14 rounded-full
                       bg-purple-600 text-white shadow-xl
                       flex flex-col items-center justify-center
                       caption font-bold z-50"
          >
            💬
            <span>Talk</span>
          </button>
        )}
  
        {open && (
          <div className="fixed right-4 bottom-4 w-[360px] h-[420px]
                          bg-white border rounded-xl shadow-xl
                          flex flex-col z-50">
            <div className="px-4 py-2 border-b font-bold text-sm flex justify-between">
              종목 채팅
              <button onClick={() => setOpen(false)}>✕</button>
            </div>
  
            {/* 메시지 영역 */}
          </div>
        )}
      </>
    );
  }
  
