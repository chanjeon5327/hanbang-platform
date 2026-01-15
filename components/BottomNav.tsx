"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, Search, Wallet, Settings, Sun, Moon, Mic2, MessageCircle, X } from 'lucide-react';

export default function BottomNav() {
  const [isDark, setIsDark] = useState(true);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    // 라이트 모드가 기본값이므로 dark 클래스 제거
    document.documentElement.classList.remove('dark');
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    setIsDark(!isDark);
  };

  const handleInquiry = () => {
    setShowChat(true);
  };

  return (
    <>
      <div style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', zIndex: 50 }}>
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '20px', padding: '12px 30px', 
          borderRadius: '999px', backgroundColor: 'rgba(255, 255, 255, 0.9)', 
          backdropFilter: 'blur(20px)', border: 'none',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
        }}>
          <Link href="/" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"><Home size={24} strokeWidth={2.5} /></Link>
          <Link href="/active-invest" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><Search size={24} /></Link>
          <Link href="/wallet" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><Wallet size={24} /></Link>
          <Link href="/active-invest/product" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><Settings size={24} /></Link>
          
          <button onClick={toggleTheme} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" style={{ background: 'none', border: 'none', cursor: 'pointer', paddingLeft: '15px', borderLeft: '1px solid var(--border-color)', display: 'flex' }}>
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: '30px', right: '20px', zIndex: 50, display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <button onClick={() => alert('🪄 내 응원봉(KCP)이 돈이 된다고요?\n\n단순한 포인트가 아닙니다. 매시간 충전되는 응원봉은 미래의 자산입니다. 모은 KCP로 공모주 청약 수수료를 내거나, 특별 굿즈 경매에 참여하세요. 켜두기만 해도 팬심이 자산으로 변하는 마법, 지금 충전 중입니다!')} className="animate-pulse-custom" style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: '#ff4081', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 4px 15px rgba(255,64,129,0.5)' }}>
            <Mic2 size={24} fill="white" style={{ color: '#ec4899' }} />
        </button>
        <button onClick={handleInquiry} style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 4px 15px rgba(139,92,246,0.4)' }}>
            <MessageCircle size={24} />
        </button>
      </div>

      {/* 채팅 모달 */}
      {showChat && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          right: '20px',
          width: '380px',
          height: '500px',
          backgroundColor: 'var(--card-bg)',
          borderRadius: '20px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* 헤더 */}
          <div style={{
            padding: '20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--bg-secondary)'
          }}>
            <div>
              <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '4px' }}>👩‍💻 상담원 연결 중...</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>예상 대기시간: 1분</div>
            </div>
            <button onClick={() => setShowChat(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <X size={20} />
            </button>
          </div>

          {/* 채팅 내역 */}
          <div style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ padding: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', maxWidth: '80%', fontSize: '14px', color: 'var(--text-primary)' }}>
                안녕하세요! HANBANG 상담원입니다. 무엇을 도와드릴까요?
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', paddingLeft: '8px' }}>방금 전</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
              <div style={{ padding: '10px', backgroundColor: 'var(--accent-color)', borderRadius: '12px', maxWidth: '80%', fontSize: '14px', color: 'white' }}>
                투자 상품에 대해 궁금한 게 있어요
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', paddingRight: '8px' }}>방금 전</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ padding: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', maxWidth: '80%', fontSize: '14px', color: 'var(--text-primary)' }}>
                네, 어떤 상품이 궁금하신가요? 오징어게임2 펀드, 세븐틴 투어 등 다양한 상품이 있습니다.
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', paddingLeft: '8px' }}>방금 전</div>
            </div>
          </div>

          {/* 입력창 */}
          <div style={{
            padding: '15px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            gap: '10px',
            backgroundColor: 'var(--bg-secondary)'
          }}>
            <input
              type="text"
              placeholder="메시지를 입력하세요..."
              style={{
                flex: 1,
                padding: '10px 15px',
                borderRadius: '20px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <button style={{
              padding: '10px 20px',
              backgroundColor: 'var(--accent-color)',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}>
              전송
            </button>
          </div>
        </div>
      )}
    </>
  );
}
