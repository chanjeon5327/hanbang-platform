'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Trash2, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { logAdminAction } from '@/lib/admin/auditLog';

type ContentStatus = 'pending' | 'approved' | 'rejected' | 'force_deleted';

type ContentItem = {
  id: string;
  title: string;
  creator: string;
  category: string;
  targetAmount: number;
  submitDate: string;
  status: ContentStatus;
};

const MOCK_CONTENTS: ContentItem[] = [
  { id: '1', title: '웹툰 <나 혼자 만렙> 지분', creator: '김창작자', category: '웹툰', targetAmount: 100000000, submitDate: '2024-01-15', status: 'pending' },
  { id: '2', title: '드라마 <한방의 추억> OST', creator: '이드라마', category: '드라마', targetAmount: 50000000, submitDate: '2024-01-14', status: 'pending' },
  { id: '3', title: 'K-POP <Sparkle> 데뷔', creator: '박케이팝', category: 'K-POP', targetAmount: 200000000, submitDate: '2024-01-13', status: 'approved' },
];

export default function AdminContentPage() {
  const { adminUser } = useAuth();
  const [items, setItems] = useState<ContentItem[]>(MOCK_CONTENTS);

  const adminId = adminUser?.email ?? 'unknown';

  const handleApprove = async (id: string) => {
    if (!confirm('이 작품을 승인하시겠습니까?')) return;
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'approved' as const } : p)));
    await logAdminAction({ adminId, action: 'CONTENT_APPROVE', targetType: 'content', targetId: id });
  };

  const handleReject = async (id: string) => {
    if (!confirm('이 작품을 거절하시겠습니까?')) return;
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'rejected' as const } : p)));
    await logAdminAction({ adminId, action: 'CONTENT_REJECT', targetType: 'content', targetId: id });
  };

  const handleForceDelete = async (id: string) => {
    if (!confirm('강제 삭제합니다. 복구할 수 없습니다. 계속하시겠습니까?')) return;
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'force_deleted' as const } : p)));
    await logAdminAction({ adminId, action: 'CONTENT_FORCE_DELETE', targetType: 'content', targetId: id });
  };

  const getStatusBadge = (status: ContentStatus) => {
    switch (status) {
      case 'approved':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-green-100 text-green-700 text-sm font-bold"><CheckCircle size={14} />승인됨</span>;
      case 'rejected':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-100 text-red-700 text-sm font-bold"><XCircle size={14} />거절됨</span>;
      case 'force_deleted':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-200 text-gray-700 text-sm font-bold"><Trash2 size={14} />강제삭제</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-100 text-amber-700 text-sm font-bold"><Clock size={14} />심사중</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>작품 승인/강제삭제</h1>

      <div className="space-y-4">
        {items.filter((p) => p.status !== 'force_deleted').map((project) => (
          <div
            key={project.id}
            className="p-6 rounded-2xl border"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{project.title}</h3>
                <div className="flex gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span>출품자: {project.creator}</span>
                  <span>카테고리: {project.category}</span>
                  <span>목표액: {project.targetAmount.toLocaleString()}원</span>
                  <span>제출일: {project.submitDate}</span>
                </div>
              </div>
              {getStatusBadge(project.status)}
            </div>

            {project.status === 'pending' && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(project.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700"
                >
                  <CheckCircle size={16} />승인
                </button>
                <button
                  onClick={() => handleReject(project.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700"
                >
                  <XCircle size={16} />거절
                </button>
              </div>
            )}

            {(project.status === 'approved' || project.status === 'rejected') && (
              <button
                onClick={() => handleForceDelete(project.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500 text-red-600 font-bold hover:bg-red-50"
              >
                <Trash2 size={16} />강제 삭제
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
