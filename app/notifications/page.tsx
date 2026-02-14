'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bell } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import BottomNavigation from '@/components/home/BottomNavigation';

type NotificationItem = {
  id: string;
  type: string;
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

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }
    fetch('/api/notifications', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.notifications) setNotifications(data.notifications);
      })
      .catch(() => {});
  }, [user]);

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--toss-bg)' }}>
      <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b" style={{ backgroundColor: 'var(--toss-card)', borderColor: 'var(--toss-border)' }}>
        <Link href="/" className="p-2 -ml-2 rounded-lg hover:bg-black/5 transition" aria-label="뒤로">
          <ArrowLeft size={22} strokeWidth={2} style={{ color: 'var(--toss-text)' }} />
        </Link>
        <h1 className="text-[18px] font-bold flex-1" style={{ color: 'var(--toss-text)' }}>알림</h1>
        <Bell size={22} strokeWidth={2} style={{ color: 'var(--toss-text-secondary)' }} />
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        {!user ? (
          <div className="py-12 text-center">
            <p className="text-[15px]" style={{ color: 'var(--toss-text-secondary)' }}>로그인 후 알림을 확인하세요</p>
            <Link href="/login" className="inline-block mt-4 px-6 py-2.5 rounded-xl text-[14px] font-semibold" style={{ backgroundColor: 'var(--toss-blue)', color: '#fff' }}>
              로그인
            </Link>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-[15px]" style={{ color: 'var(--toss-text-secondary)' }}>알림이 없습니다</p>
          </div>
        ) : (
          <ul className="space-y-0">
            {notifications.map((n) => (
              <li key={n.id}>
                <Link
                  href={n.reference_id ? `/market/${n.reference_id}` : '#'}
                  className="block px-4 py-4 border-b hover:bg-black/[0.02] transition"
                  style={{ borderColor: 'var(--toss-border)', backgroundColor: 'var(--toss-card)' }}
                  onClick={async () => {
                    if (!n.is_read) {
                      await fetch(`/api/notifications/${n.id}/read`, { method: 'PATCH' }).catch(() => {});
                      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full shrink-0 mt-2" style={{ backgroundColor: 'var(--toss-blue)' }} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-[15px] ${!n.is_read ? 'font-semibold' : 'font-medium'}`} style={{ color: 'var(--toss-text)' }}>{n.title}</p>
                      {n.content && (
                        <p className="text-[13px] mt-0.5" style={{ color: 'var(--toss-text-secondary)' }}>{n.content}</p>
                      )}
                      <span className="text-[12px] mt-1 block" style={{ color: 'var(--toss-text-dim)' }}>{formatTime(n.created_at)}</span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}
