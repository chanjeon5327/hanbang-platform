'use client';

import { useState } from 'react';
import { Trash2, Ban, Flag } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { logAdminAction } from '@/lib/admin/auditLog';

type ReportedMessage = {
  id: string;
  marketId: string;
  marketTitle: string;
  userId: string;
  userName: string;
  message: string;
  reportedCount: number;
  createdAt: string;
};

const MOCK_REPORTED: ReportedMessage[] = [
  { id: '1', marketId: 'sample-1', marketTitle: '여행가 제이', userId: 'u1', userName: '투자자A', message: '부적절한 메시지 예시', reportedCount: 5, createdAt: '2024-01-15 14:30' },
  { id: '2', marketId: 'sample-2', marketTitle: '먹방 로드', userId: 'u2', userName: '크리에이터', message: '광고성 메시지', reportedCount: 3, createdAt: '2024-01-15 13:20' },
  { id: '3', marketId: 'sample-1', marketTitle: '여행가 제이', userId: 'u3', userName: '투자자B', message: '욕설 포함 메시지', reportedCount: 8, createdAt: '2024-01-15 12:00' },
];

export default function AdminChatModerationPage() {
  const { adminUser } = useAuth();
  const [items, setItems] = useState<ReportedMessage[]>(MOCK_REPORTED);

  const adminId = adminUser?.email ?? 'unknown';

  const handleDelete = async (msg: ReportedMessage) => {
    if (!confirm(`메시지를 삭제하시겠습니까? (${msg.message})`)) return;
    setItems((prev) => prev.filter((i) => i.id !== msg.id));
    await logAdminAction({ adminId, action: 'CHAT_DELETE', targetType: 'chat_message', targetId: msg.id, metadata: { marketId: msg.marketId } });
  };

  const handleSuspend = async (msg: ReportedMessage) => {
    if (!confirm(`${msg.userName} (${msg.userId}) 사용자를 정지하시겠습니까?`)) return;
    setItems((prev) => prev.filter((i) => i.userId !== msg.userId));
    await logAdminAction({ adminId, action: 'CHAT_USER_SUSPEND', targetType: 'user', targetId: msg.userId, metadata: { messageId: msg.id } });
  };

  const sorted = [...items].sort((a, b) => b.reportedCount - a.reportedCount);

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>채팅 모더레이션</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>신고 누적 상위 메시지입니다. 삭제 또는 유저 정지를 선택하세요.</p>

      <div className="space-y-4">
        {sorted.map((msg) => (
          <div
            key={msg.id}
            className="p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700 flex items-center gap-1">
                  <Flag size={12} />신고 {msg.reportedCount}건
                </span>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{msg.marketTitle}</span>
              </div>
              <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>{msg.userName} ({msg.userId})</p>
              <p className="text-base" style={{ color: 'var(--text-primary)' }}>{msg.message}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{msg.createdAt}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => handleDelete(msg)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500 text-red-600 font-bold hover:bg-red-50"
              >
                <Trash2 size={16} />삭제
              </button>
              <button
                onClick={() => handleSuspend(msg)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 text-white font-bold hover:bg-amber-700"
              >
                <Ban size={16} />유저 정지
              </button>
            </div>
          </div>
        ))}
      </div>

      {sorted.length === 0 && (
        <p className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>처리 대기 중인 신고가 없습니다.</p>
      )}
    </div>
  );
}
