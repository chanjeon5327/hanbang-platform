'use client';

import { useState, useEffect } from 'react';
import { Shield, FileCheck } from 'lucide-react';

type Submission = {
  id: string;
  user_id: string;
  step: string;
  status: string;
  payload_json: Record<string, unknown>;
  created_at: string;
};

export default function AdminKycPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/kyc/submissions', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { submissions: [] }))
      .then((d) => setSubmissions(d.submissions ?? []))
      .catch(() => setSubmissions([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
        <FileCheck size={24} />
        KYC 제출 목록
      </h1>
      {loading ? (
        <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>로딩 중…</p>
      ) : submissions.length === 0 ? (
        <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>제출 내역이 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {submissions.map((s) => (
            <div
              key={s.id}
              className="rounded-xl p-4 border flex items-center justify-between"
              style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <div>
                <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>{s.user_id}</p>
                <p className="text-[14px] font-semibold">{s.step} · {s.status}</p>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {new Date(s.created_at).toLocaleString('ko-KR')}
                </p>
              </div>
              <Shield size={20} style={{ color: 'var(--text-secondary)' }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
