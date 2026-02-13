'use client';

import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { logAdminAction } from '@/lib/admin/auditLog';

type ReportItem = {
  id: string;
  type: 'chat' | 'user' | 'content';
  targetId: string;
  reporterName: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
};

const MOCK_REPORTS: ReportItem[] = [
  { id: '1', type: 'chat', targetId: 'msg-1', reporterName: '유저A', reason: '욕설', status: 'pending', createdAt: '2024-01-15 14:30' },
  { id: '2', type: 'chat', targetId: 'msg-2', reporterName: '유저B', reason: '광고성', status: 'pending', createdAt: '2024-01-15 13:20' },
];

export default function AdminReportsPage() {
  const { adminUser } = useAuth();
  const [items, setItems] = useState<ReportItem[]>(MOCK_REPORTS);

  const adminId = adminUser?.email ?? 'unknown';

  const handleResolve = async (id: string) => {
    if (!confirm('이 신고를 처리완료 하시겠습니까?')) return;
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'resolved' as const } : r)));
    await logAdminAction({ adminId, action: 'REPORT_RESOLVE', targetType: 'report', targetId: id });
  };

  const handleDismiss = async (id: string) => {
    if (!confirm('이 신고를 기각하시겠습니까?')) return;
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'dismissed' as const } : r)));
    await logAdminAction({ adminId, action: 'REPORT_RESOLVE', targetType: 'report', targetId: id, metadata: { dismissed: true } });
  };

  const pending = items.filter((r) => r.status === 'pending');

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>신고 처리</h1>

      <div className="space-y-4">
        {pending.map((r) => (
          <div
            key={r.id}
            className="p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
          >
            <div>
              <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>유형: {r.type} · 신고자: {r.reporterName}</p>
              <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>사유: {r.reason}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.createdAt}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleResolve(r.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700"
              >
                <CheckCircle size={16} />처리완료
              </button>
              <button
                onClick={() => handleDismiss(r.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-400 text-gray-600 font-bold hover:bg-gray-50"
              >
                <XCircle size={16} />기각
              </button>
            </div>
          </div>
        ))}
      </div>

      {pending.length === 0 && (
        <p className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>처리 대기 중인 신고가 없습니다.</p>
      )}
    </div>
  );
}
