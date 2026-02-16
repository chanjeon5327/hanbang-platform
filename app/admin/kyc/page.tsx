'use client';

import { useState, useEffect } from 'react';
import { Shield, FileCheck, Check, X } from 'lucide-react';

type KycUser = {
  id: string;
  email: string;
  kyc_status: string;
  user_status: string;
};

type KycDetail = {
  profile: { id: string; email: string | null; status: string } | null;
  investor_profile: Record<string, unknown> | null;
  kyc_verification: {
    real_name?: string;
    phone?: string;
    id_card_front_url?: string;
    id_card_back_url?: string;
    rejection_reason?: string;
  } | null;
};

export default function AdminKycPage() {
  const [users, setUsers] = useState<KycUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<KycDetail | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadUsers = () => {
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
    if (!selectedId) {
      setDetail(null);
      return;
    }
    fetch(`/api/admin/kyc/users/${selectedId}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then(setDetail)
      .catch(() => setDetail(null));
  }, [selectedId]);

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/kyc/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kyc_status: 'APPROVED' }),
      });
      if (res.ok) {
        setSelectedId(null);
        loadUsers();
      } else {
        const json = await res.json();
        alert(json.error ?? '?? ??');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      alert('?? ??? ??????.');
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/kyc/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kyc_status: 'REJECTED', rejection_reason: rejectionReason.trim() }),
      });
      if (res.ok) {
        setSelectedId(null);
        setRejectionReason('');
        loadUsers();
      } else {
        const json = await res.json();
        alert(json.error ?? '?? ?? ??');
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
        <FileCheck size={24} />
        KYC ?? ??
      </h1>
      {loading ? (
        <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>?? ??</p>
      ) : users.length === 0 ? (
        <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>KYC ?? ?? ????.</p>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="rounded-xl p-4 border flex items-center justify-between cursor-pointer hover:opacity-90"
              style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
              onClick={() => setSelectedId(u.id)}
            >
              <div>
                <p className="text-[14px] font-semibold">{u.email}</p>
                <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>{u.id}</p>
              </div>
              <Shield size={20} style={{ color: 'var(--text-secondary)' }} />
            </div>
          ))}
        </div>
      )}

      {selectedId && detail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSelectedId(null)}
        >
          <div
            className="rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4">KYC ??</h2>
            <div className="space-y-2 text-[14px] mb-4">
              <p><strong>???:</strong> {detail.profile?.email ?? '-'}</p>
              <p><strong>??:</strong> {detail.kyc_verification?.real_name ?? '-'}</p>
              <p><strong>???:</strong> {detail.kyc_verification?.phone ?? '-'}</p>
              {detail.kyc_verification?.id_card_front_url && (
                <p><strong>??? ?:</strong> <a href={detail.kyc_verification.id_card_front_url} target="_blank" rel="noreferrer" className="underline">??</a></p>
              )}
              {detail.kyc_verification?.id_card_back_url && (
                <p><strong>??? ?:</strong> <a href={detail.kyc_verification.id_card_back_url} target="_blank" rel="noreferrer" className="underline">??</a></p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleApprove(selectedId)}
                disabled={actionLoading}
                className="flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-1"
                style={{ backgroundColor: 'var(--emerald)', color: '#fff' }}
              >
                <Check size={18} /> ??
              </button>
              <div className="flex-1 flex flex-col gap-2">
                <input
                  type="text"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="?? ??"
                  className="w-full px-3 py-2 rounded border text-[13px]"
                  style={{ borderColor: 'var(--border)' }}
                />
                <button
                  onClick={() => handleReject(selectedId)}
                  disabled={actionLoading || !rejectionReason.trim()}
                  className="w-full py-2 rounded-lg font-medium flex items-center justify-center gap-1"
                  style={{ backgroundColor: 'var(--accent-loss)', color: '#fff' }}
                >
                  <X size={18} /> ??
                </button>
              </div>
            </div>
            <button
              onClick={() => setSelectedId(null)}
              className="w-full mt-4 py-2 rounded-lg border"
              style={{ borderColor: 'var(--border)' }}
            >
              ??
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
