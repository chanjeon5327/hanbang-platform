'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import type { NotificationType } from '@/lib/notifications/constants';

type NotificationItem = {
  id: string;
  type: NotificationType;
  reference_id?: string;
  title: string;
  content?: string;
  is_read: boolean;
  created_at: string;
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return '방금';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`;
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

export default function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    fetch('/api/notifications', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.notifications) {
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount ?? data.notifications.filter((n: NotificationItem) => !n.is_read).length);
        }
      })
      .catch(() => {});
  }, [user]);

  const displayList = notifications.slice(0, 10);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative p-2.5 rounded-xl text-[var(--toss-text-secondary)] hover:bg-[var(--toss-bg)] transition focus:outline-none focus:ring-2 focus:ring-[var(--toss-blue)] focus:ring-offset-1"
        aria-label="알림"
        aria-expanded={open}
      >
        <Bell size={22} strokeWidth={2} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white"
            style={{ backgroundColor: 'var(--toss-negative, #eb4d3d)' }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div
            className="absolute right-0 top-full mt-1 z-50 w-[320px] max-h-[400px] overflow-hidden rounded-xl border shadow-lg"
            style={{ backgroundColor: 'var(--toss-card)', borderColor: 'var(--toss-border)' }}
          >
            <div className="flex justify-between items-center px-4 py-3 border-b" style={{ borderColor: 'var(--toss-border)' }}>
              <h3 className="font-bold text-[15px]" style={{ color: 'var(--toss-text)' }}>알림</h3>
              {displayList.length > 0 && (
                <Link
                  href="/notifications"
                  className="text-[13px] font-semibold"
                  style={{ color: 'var(--toss-blue)' }}
                  onClick={() => setOpen(false)}
                >
                  전체보기
                </Link>
              )}
            </div>
            <div className="max-h-[320px] overflow-y-auto">
              {displayList.length === 0 ? (
                <div className="px-4 py-8 text-center text-[14px]" style={{ color: 'var(--toss-text-secondary)' }}>
                  {user ? '알림이 없습니다' : '로그인 후 알림을 확인하세요'}
                </div>
              ) : (
                displayList.map((n) => (
                  <Link
                    key={n.id}
                    href={n.reference_id ? `/market/${n.reference_id}` : '/notifications'}
                    className="block px-4 py-3 border-b hover:bg-black/[0.02] transition"
                    style={{ borderColor: 'var(--toss-border)' }}
                    onClick={async () => {
                      setOpen(false);
                      if (!n.is_read) {
                        await fetch(`/api/notifications/${n.id}/read`, { method: 'PATCH' }).catch(() => {});
                        setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
                        setUnreadCount((c) => Math.max(0, c - 1));
                      }
                    }}
                  >
                    <div className="flex items-start gap-2">
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: 'var(--toss-blue)' }} />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-[14px] font-medium ${!n.is_read ? 'font-semibold' : ''}`} style={{ color: 'var(--toss-text)' }}>{n.title}</p>
                        {n.content && (
                          <p className="text-[12px] mt-0.5 truncate" style={{ color: 'var(--toss-text-secondary)' }}>{n.content}</p>
                        )}
                        <span className="text-[11px] mt-1 block" style={{ color: 'var(--toss-text-dim)' }}>{formatTime(n.created_at)}</span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
