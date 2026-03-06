'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, LogOut, LogIn, UserPlus, ChevronDown, Wallet } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import LogoutButton from '@/components/auth/LogoutButton';

export default function AppHeader() {
  const pathname = usePathname();
  const isLogin = pathname === '/login';
  const { user, profile, loading } = useAuth();
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

  if (isLogin) {
    return (
      <header
        className="z-[200]"
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
                    className="absolute right-0 top-full mt-1 py-1.5 min-w-[160px] rounded-xl shadow-xl z-[300] animate-[headerDropdownIn_0.15s_ease-out]"
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
                <Link
                  href="/login"
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
                </Link>
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition"
                  style={{ color: 'var(--legacy-text-muted)' }}
                  aria-label="로그인"
                >
                  <LogIn size={18} strokeWidth={2} />
                  로그인
                </Link>
                <Link
                  href="/login?mode=signup"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition"
                  style={{
                    backgroundColor: 'var(--legacy-point)',
                    color: '#fff',
                  }}
                  aria-label="회원가입"
                >
                  <UserPlus size={18} strokeWidth={2} />
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className="border-b z-[200]"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 64,
        backgroundColor: 'var(--hb-card, var(--toss-card))',
        borderColor: 'var(--hb-border, rgba(0,0,0,0.05))',
      }}
    >
      <div className="flex items-center justify-between h-full px-4 max-w-[1320px] mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <span className="h3 font-black tracking-tight" style={{ color: 'var(--hb-text, var(--toss-text))' }}>
            HANBANG
          </span>
          <span
            className="rounded-full px-2 py-0.5 caption font-bold text-white"
            style={{ backgroundColor: 'var(--hb-primary, var(--toss-blue))' }}
          >
            베타
          </span>
        </Link>
        <div className="flex items-center gap-2">
          {loading ? (
            <span className="p-2.5 animate-pulse" style={{ color: 'var(--hb-muted, var(--toss-text-secondary))' }} aria-hidden>
              ⋯
            </span>
          ) : user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/wallet"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition"
                style={{ color: 'var(--hb-muted, var(--toss-text-secondary))' }}
                aria-label="지갑"
              >
                <Wallet size={20} strokeWidth={2} />
                <span className="text-sm font-medium hidden sm:inline">지갑</span>
              </Link>
              <Link
                href="/mypage"
                className="flex items-center gap-2 px-3 py-2 rounded-xl transition"
                style={{ color: 'var(--hb-text, var(--toss-text))' }}
                aria-label="마이페이지"
              >
                <User size={20} strokeWidth={2} />
                <span className="text-sm font-medium truncate max-w-[120px]">{displayName}</span>
              </Link>
              <LogoutButton
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition"
                style={{ color: 'var(--hb-muted, var(--toss-text-secondary))' }}
                redirectTo="/"
              >
                <LogOut size={20} strokeWidth={2} />
                <span className="text-sm font-medium hidden sm:inline">로그아웃</span>
              </LogoutButton>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition"
                style={{ color: 'var(--hb-muted, var(--toss-text-secondary))' }}
                aria-label="로그인"
              >
                <LogIn size={20} strokeWidth={2} />
                <span className="text-sm font-medium">로그인</span>
              </Link>
              <Link
                href="/login?mode=signup"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white transition"
                style={{ backgroundColor: 'var(--hb-primary, var(--toss-blue))' }}
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
