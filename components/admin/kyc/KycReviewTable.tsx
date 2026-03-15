'use client';

import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

type KycStatus = 'NOT_STARTED' | 'PENDING' | 'APPROVED' | 'REJECTED';

type KycUser = {
  id: string;
  email: string;
  real_name?: string;
  phone?: string | null;
  birth_date?: string | null;
  submitted_at?: string | null;
  rejection_reason?: string | null;
  kyc_status: KycStatus;
};

const STATUS_LABEL: Record<KycStatus, string> = {
  NOT_STARTED: '시작 전',
  PENDING: '확인 중',
  APPROVED: '완료',
  REJECTED: '보완 필요',
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

function StatusBadge({ status }: { status: KycStatus }) {
  const styles: Record<KycStatus, React.CSSProperties> = {
    NOT_STARTED: { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' },
    PENDING: { backgroundColor: 'rgba(234, 179, 8, 0.15)', color: 'rgb(234, 179, 8)' },
    APPROVED: { backgroundColor: 'rgba(34, 197, 94, 0.15)', color: 'rgb(34, 197, 94)' },
    REJECTED: { backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'rgb(239, 68, 68)' },
  };
  return (
    <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, ...styles[status] }}>
      {STATUS_LABEL[status]}
    </span>
  );
}

type Tab = 'pending' | 'rejected' | 'approved';

export default function KycReviewTable() {
  const [tab, setTab] = useState<Tab>('pending');
  const [users, setUsers] = useState<KycUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectUserId, setRejectUserId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const loadUsers = () => {
    setLoading(true);
    fetch(`/api/admin/kyc/users?status=${tab}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { users: [] }))
      .then((d) => setUsers(d.users ?? []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, [tab]);

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

  const tabs: { key: Tab; label: string }[] = [
    { key: 'pending', label: '확인 중' },
    { key: 'rejected', label: '보완 필요' },
    { key: 'approved', label: '완료' },
  ];

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <div style={{ display: 'flex', gap: '4px', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: tab === t.key ? 'var(--royal-blue)' : 'var(--bg)',
              color: tab === t.key ? '#fff' : 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-6">
          <p className="body-sm" style={{ color: 'var(--text-secondary)' }}>로딩 중…</p>
        </div>
      ) : users.length === 0 ? (
        <div className="p-6">
          <p className="body-sm" style={{ color: 'var(--text-secondary)' }}>
            {tab === 'pending' && '확인 대기 중인 KYC가 없습니다.'}
            {tab === 'rejected' && '보완 필요 상태인 KYC가 없습니다.'}
            {tab === 'approved' && '승인 완료된 KYC가 없습니다.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                <th className="text-left p-3 body-sm font-semibold" style={{ color: 'var(--text)' }}>상태</th>
                <th className="text-left p-3 body-sm font-semibold" style={{ color: 'var(--text)' }}>신청자</th>
                <th className="text-left p-3 body-sm font-semibold" style={{ color: 'var(--text)' }}>휴대폰</th>
                <th className="text-left p-3 body-sm font-semibold" style={{ color: 'var(--text)' }}>생년월일</th>
                <th className="text-left p-3 body-sm font-semibold" style={{ color: 'var(--text)' }}>제출일</th>
                {tab === 'pending' && (
                  <th className="text-left p-3 body-sm font-semibold" style={{ color: 'var(--text)' }}>액션</th>
                )}
                {tab === 'rejected' && (
                  <th className="text-left p-3 body-sm font-semibold" style={{ color: 'var(--text)' }}>반려 사유</th>
                )}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b" style={{ borderColor: 'var(--border)' }}>
                  <td className="p-3">
                    <StatusBadge status={u.kyc_status} />
                  </td>
                  <td className="p-3">
                    <p className="body-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                      {u.real_name ?? '-'}
                    </p>
                    <p className="caption truncate" style={{ color: 'var(--text-secondary)' }}>
                      {u.email}
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
                  {tab === 'pending' && (
                    <td className="p-3">
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleApprove(u.id)}
                            disabled={!!actionLoading}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '8px',
                              border: 'none',
                              backgroundColor: 'var(--emerald)',
                              color: '#fff',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: actionLoading ? 'not-allowed' : 'pointer',
                              opacity: actionLoading ? 0.6 : 1,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Check size={14} /> 승인
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectUserId(rejectUserId === u.id ? null : u.id)}
                            disabled={!!actionLoading}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '8px',
                              border: 'none',
                              backgroundColor: 'var(--accent-loss)',
                              color: '#fff',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: actionLoading ? 'not-allowed' : 'pointer',
                              opacity: actionLoading ? 0.6 : 1,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <X size={14} /> 반려
                          </button>
                        </div>
                        {rejectUserId === u.id && (
                          <div className="flex flex-col gap-2 mt-1">
                            <textarea
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              placeholder="반려 사유 (필수)"
                              rows={2}
                              className="w-full px-2 py-1 rounded border body-sm"
                              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text)' }}
                            />
                            <button
                              type="button"
                              onClick={() => handleReject(u.id)}
                              disabled={actionLoading === u.id || !rejectReason.trim()}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                border: 'none',
                                backgroundColor: 'var(--accent-loss)',
                                color: '#fff',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: actionLoading === u.id || !rejectReason.trim() ? 'not-allowed' : 'pointer',
                                opacity: actionLoading === u.id || !rejectReason.trim() ? 0.6 : 1,
                              }}
                            >
                              반려 확정
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  )}
                  {tab === 'rejected' && (
                    <td className="p-3">
                      <p className="caption max-w-[200px] truncate" style={{ color: 'var(--accent-loss)' }} title={u.rejection_reason ?? ''}>
                        {u.rejection_reason ?? '—'}
                      </p>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
