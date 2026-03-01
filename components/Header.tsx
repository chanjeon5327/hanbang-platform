'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, LogOut, LogIn, UserPlus, ChevronDown, Wallet } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import LogoutButton from '@/components/auth/LogoutButton';

export default function Header() {
  const pathname = usePathname();
  const isLegacy = pathname === '/login';
  const { user, profile, loading, openLoginModal } = useAuth();
  const displayName = profile?.display_name || user?.email || '사용자';
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLegacy) {
    return (
      <header
        className="z-50"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 64,
          backgroundColor: 'var(--legacy-bg)',
          borderBottom: '1px solid var(--legacy-border)',
        }}
      >
        <div className="flex items-center justify-between h-full px-4 max-w-[1320px] mx-auto">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="font-black text-xl tracking-tight" style={{ color: 'var(--legacy-text)' }}>
              HANBANG
            </span>
            <span
              className="rounded-full px-2.5 py-1 text-xs font-bold"
              style={{ backgroundColor: 'var(--legacy-pill-bg)', color: 'var(--legacy-pill-text)' }}
            >
              베타
            </span>
          </Link>
          <div className="flex items-center gap-2">
            {loading ? (
              <span className="px-3 py-2 text-sm animate-pulse" style={{ color: 'var(--legacy-text-muted)' }} aria-hidden>
                ⋯
              </span>
            ) : user ? (
              <div
                ref={dropdownRef}
                className="relative"
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-2 pl-2 pr-3 py-2 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-[var(--legacy-point)]"
                  style={{ color: 'var(--legacy-text)' }}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                  aria-label="프로필 메뉴"
                >
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-full shrink-0"
                    style={{ backgroundColor: 'var(--legacy-point)' }}
                  >
                    <User size={16} strokeWidth={2.5} className="text-white" />
                  </div>
                  <span className="text-sm font-semibold truncate max-w-[120px]" title={displayName}>
                    {displayName}
                  </span>
                  <ChevronDown size={14} strokeWidth={2.5} style={{ color: 'var(--legacy-text-muted)' }} />
                </button>
                {dropdownOpen && (
                  <div
                    className="absolute right-0 top-full mt-1 py-1.5 min-w-[160px] rounded-xl shadow-xl z-[60] animate-[headerDropdownIn_0.15s_ease-out]"
                    style={{
                      backgroundColor: 'var(--legacy-card)',
                      border: '1px solid var(--legacy-border)',
                      backdropFilter: 'blur(12px)',
                    }}
                  >
                    <Link
                      href="/mypage"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition"
                      style={{ color: 'var(--legacy-text)' }}
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User size={18} strokeWidth={2} />
                      마이페이지
                    </Link>
                    <LogoutButton
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm font-medium transition text-left"
                      style={{ color: 'var(--legacy-text)' }}
                      redirectTo="/"
                    >
                      <LogOut size={18} strokeWidth={2} />
                      로그아웃
                    </LogoutButton>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={openLoginModal}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    color: 'var(--legacy-text)',
                    border: '1px solid var(--legacy-border)',
                  }}
                  aria-label="지갑 연결"
                >
                  <Wallet size={18} strokeWidth={2} />
                  지갑연결
                </button>
                <button
                  type="button"
                  onClick={openLoginModal}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition"
                  style={{ color: 'var(--legacy-text-muted)' }}
                  aria-label="로그인"
                >
                  <LogIn size={18} strokeWidth={2} />
                  로그인
                </button>
                <Link
                  href="/signup"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition"
                  style={{
                    backgroundColor: 'var(--legacy-point)',
                    color: '#fff',
                  }}
                  aria-label="가입하기"
                >
                  <UserPlus size={18} strokeWidth={2} />
                  가입하기
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
    );
  }

  /* 비레거시(기존 토스형) 헤더 - 다른 페이지용 */
  return (
    <header
      className="border-b border-black/5 z-50 bg-[var(--toss-card)]"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 64 }}
    >
      <div className="flex items-center justify-between h-full px-4 max-w-[1320px] mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <span className="h3 font-black tracking-tight text-[var(--toss-text)]">HANBANG</span>
          <span className="rounded-full px-2 py-0.5 caption font-bold text-white bg-[var(--toss-blue)]">베타</span>
        </Link>
        <div className="flex items-center gap-2">
          {loading ? (
            <span className="p-2.5 text-[var(--toss-text-secondary)] animate-pulse" aria-hidden>⋯</span>
          ) : user ? (
            <Link
              href="/mypage"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-[var(--toss-text)] hover:bg-[var(--toss-bg)] transition"
            >
              <User size={20} strokeWidth={2} />
              <span className="text-sm font-medium truncate max-w-[120px]">{displayName}</span>
            </Link>
          ) : (
            <>
              <button
                type="button"
                onClick={openLoginModal}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[var(--toss-text-secondary)] hover:bg-[var(--toss-bg)] transition"
                aria-label="로그인"
              >
                <LogIn size={20} strokeWidth={2} />
                <span className="text-sm font-medium">로그인</span>
              </button>
              <Link
                href="/signup"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white bg-[var(--toss-blue)] hover:opacity-90 transition"
                aria-label="회원가입"
              >
                <UserPlus size={20} strokeWidth={2} />
                <span className="text-sm font-medium">회원가입</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
