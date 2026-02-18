'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Shield, DollarSign, Search } from 'lucide-react';

type Batch = { id: string; settlement_date: string; status: string };

export default function AdminHubPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/settlement/batches', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { batches: [] }))
      .then((d) => setBatches(d.batches ?? []))
      .catch(() => setBatches([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
        ??? ??
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link
          href="/admin/creators"
          className="p-5 rounded-2xl border flex items-center gap-3 hover:opacity-90 transition"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
        >
          <Users size={24} style={{ color: 'var(--accent-color)' }} />
          <div>
            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>??? ??</div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>?? ?? ??? ??</div>
          </div>
        </Link>
        <Link
          href="/admin/kyc"
          className="p-5 rounded-2xl border flex items-center gap-3 hover:opacity-90 transition"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
        >
          <Shield size={24} style={{ color: 'var(--accent-color)' }} />
          <div>
            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>KYC ??</div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>??? KYC ??</div>
          </div>
        </Link>
        <Link
          href="/admin/settlement"
          className="p-5 rounded-2xl border flex items-center gap-3 hover:opacity-90 transition"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
        >
          <DollarSign size={24} style={{ color: 'var(--accent-color)' }} />
          <div>
            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>정산 관리</div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>정산 배치 확인</div>
          </div>
        </Link>
        <Link
          href="/admin/forensic"
          className="p-5 rounded-2xl border flex items-center gap-3 hover:opacity-90 transition"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
        >
          <Search size={24} style={{ color: 'var(--accent-color)' }} />
          <div>
            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>포렌식 감사</div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>원장 무결성 · 로그인 감사</div>
          </div>
        </Link>
      </div>

      <div
        className="p-6 rounded-2xl border"
        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            ?? ??
          </h2>
          <Link href="/admin/settlement" className="text-sm font-semibold" style={{ color: 'var(--accent-color)' }}>
            ????
          </Link>
        </div>
        {loading ? (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>?? ?...</p>
        ) : batches.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>?? ?? ??</p>
        ) : (
          <div className="space-y-3">
            {batches.map((s) => (
              <Link
                key={s.id}
                href={`/admin/settlement/${s.id}`}
                className="flex justify-between items-center p-3 rounded-xl hover:bg-black/5 transition"
              >
                <div>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{s.settlement_date}</span>
                  <span className="ml-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                    {s.status === 'CONFIRMED' ? '???' : '??'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
