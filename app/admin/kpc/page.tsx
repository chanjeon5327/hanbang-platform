'use client';

import { useState } from 'react';
import { Gift } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { logAdminAction } from '@/lib/admin/auditLog';
import { useToast } from '@/context/ToastContext';

export default function AdminKpcPage() {
  const { adminUser } = useAuth();
  const { toast } = useToast();
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const adminId = adminUser?.email ?? 'unknown';

  const handleGrant = async () => {
    if (!userId || !amount || !reason) {
      toast('모든 필드를 입력하세요.');
      return;
    }
    if (!confirm(`${userId}에게 ${amount} KPC를 지급하시겠습니까?`)) return;
    setLoading(true);
    try {
      // TODO: API 연동
      await logAdminAction({ adminId, action: 'KPC_GRANT', targetType: 'user', targetId: userId, metadata: { amount: Number(amount), reason } });
      toast('지급 완료');
      setUserId('');
      setAmount('');
      setReason('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>KPC 포인트 지급</h1>

      <div className="p-6 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>유저 ID</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="user_id 또는 email"
            className="w-full px-4 py-2 rounded-lg border"
            style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>지급 수량 (KPC)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full px-4 py-2 rounded-lg border"
            style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>사유</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="이벤트 참여, 보상 등"
            className="w-full px-4 py-2 rounded-lg border"
            style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)' }}
          />
        </div>
        <button
          onClick={handleGrant}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-700 disabled:opacity-50"
        >
          <Gift size={18} />지급
        </button>
      </div>
    </div>
  );
}
