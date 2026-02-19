'use client';

import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

type KycUser = {
  id: string;
  email: string;
  real_name?: string;
  phone?: string | null;
  birth_date?: string | null;
  submitted_at?: string | null;
  kyc_status: string;
};

function maskPhone(phone: string | null | undefined): string {
  if (!phone || phone.length < 4) return '—';
  const last4 = phone.slice(-4);
  return `***-****-${last4}`;
}

function maskBirth(birth: string | null | undefined): string {
  if (!birth) return '—';
  if (birth.length >= 8) return `${birth.slice(0, 4)}-**-**`;
  return '—';
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  } catch {
    return '—';
  }
}

export default function KycReviewTable() {
  const [users, setUsers] = useState<KycUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectUserId, setRejectUserId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const loadUsers = () => {
    setLoading(true);
    fetch('/api/admin/kyc/users', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { users: [] }))
      .then((d) => setUsers(d.users ?? []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/kyc/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kyc_status: 'APPROVED' }),
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        setToast('승인 완료');
      } else {
        const json = await res.json();
        setToast(json.error ?? '승인 실패');
      }
    } catch {
      setToast('승인 실패');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) {
      setToast('반려 사유를 입력해주세요.');
      return;
    }
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/kyc/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kyc_status: 'REJECTED', rejection_reason: rejectReason.trim() }),
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        setRejectUserId(null);
        setRejectReason('');
        setToast('반려 완료');
      } else {
        const json = await res.json();
        setToast(json.error ?? '반려 실패');
      }
    } catch {
      setToast('반려 실패');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div
        className="rounded-2xl p-4"
        style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <p className="body-sm" style={{ color: 'var(--text-secondary)' }}>
          로딩 중…
        </p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div
        className="rounded-2xl p-4"
        style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <p className="body-sm" style={{ color: 'var(--text-secondary)' }}>
          대기 중인 KYC 신청이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
              <th className="text-left p-3 body-sm font-semibold" style={{ color: 'var(--text)' }}>
                신청자
              </th>
              <th className="text-left p-3 body-sm font-semibold" style={{ color: 'var(--text)' }}>
                휴대폰
              </th>
              <th className="text-left p-3 body-sm font-semibold" style={{ color: 'var(--text)' }}>
                생년월일
              </th>
              <th className="text-left p-3 body-sm font-semibold" style={{ color: 'var(--text)' }}>
                제출일
              </th>
              <th className="text-left p-3 body-sm font-semibold" style={{ color: 'var(--text)' }}>
                액션
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b" style={{ borderColor: 'var(--border)' }}>
                <td className="p-3">
                  <p className="body-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                    {u.real_name ?? '-'}
                  </p>
                  <p className="caption truncate" style={{ color: 'var(--text-secondary)' }}>
                    {u.id.slice(0, 8)}…
                  </p>
                </td>
                <td className="p-3">
                  <p className="caption" style={{ color: 'var(--text-secondary)' }}>
                    {maskPhone(u.phone)}
                  </p>
                </td>
                <td className="p-3">
                  <p className="caption" style={{ color: 'var(--text-secondary)' }}>
                    {maskBirth(u.birth_date)}
                  </p>
                </td>
                <td className="p-3">
                  <p className="caption" style={{ color: 'var(--text-secondary)' }}>
                    {formatDate(u.submitted_at)}
                  </p>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleApprove(u.id)}
                      disabled={!!actionLoading}
                      className="px-2 py-1 rounded-xl caption font-semibold flex items-center gap-1 transition disabled:opacity-50"
                      style={{ backgroundColor: 'var(--emerald)', color: '#fff' }}
                    >
                      <Check size={14} /> 승인
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejectUserId(rejectUserId === u.id ? null : u.id)}
                      disabled={!!actionLoading}
                      className="px-2 py-1 rounded-xl caption font-semibold flex items-center gap-1 transition disabled:opacity-50"
                      style={{ backgroundColor: 'var(--accent-loss)', color: '#fff' }}
                    >
                      <X size={14} /> 반려
                    </button>
                  </div>
                  {rejectUserId === u.id && (
                    <div className="mt-2 flex flex-col gap-2">
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="반려 사유"
                        rows={2}
                        className="w-full px-2 py-1 rounded border body-sm textarea-resize-none"
                        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text)' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleReject(u.id)}
                        disabled={actionLoading === u.id || !rejectReason.trim()}
                        className="px-2 py-1 rounded caption font-semibold"
                        style={{ backgroundColor: 'var(--accent-loss)', color: '#fff' }}
                      >
                        반려 확정
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {toast && (
        <div
          className="fixed bottom-4 left-4 right-4 max-w-md mx-auto py-2 px-4 rounded-xl text-center body-sm font-medium z-50"
          style={{ backgroundColor: 'var(--royal-blue)', color: '#fff' }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
