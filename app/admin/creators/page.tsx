'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/context/ToastContext';

type Creator = {
  id: string;
  email: string | null;
  creator_status: string | null;
  created_at?: string;
};

export default function AdminCreatorsPage() {
  const { toast } = useToast();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/creators');
      const json = await res.json();
      if (res.ok) {
        const list = json.creators ?? [];
        setCreators(list);
      } else {
        toast(json?.error ?? '?? ?? ??');
      }
    } catch {
      toast('?? ?? ??');
    } finally {
      setLoading(false);
    }
  }

  async function approve(id: string) {
    try {
      const res = await fetch(`/api/admin/creators/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creator_status: 'APPROVED' }),
      });
      const json = await res.json();
      if (res.ok) {
        toast('???????.');
        load();
      } else {
        toast(json?.error ?? '?? ??');
      }
    } catch {
      toast('?? ??');
    }
  }

  async function reject(id: string) {
    try {
      const res = await fetch(`/api/admin/creators/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creator_status: 'REJECTED' }),
      });
      if (res.ok) {
        toast('??????????');
        load();
      } else {
        const json = await res.json();
        toast(json?.error ?? '?? ???');
      }
    } catch {
      toast('?? ???');
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-bold mb-6">??? ??</h1>
        <p className="text-[var(--text-secondary)]">?? ????.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-6">???????</h1>
      {creators.length === 0 ? (
        <p className="text-[var(--text-secondary)]">?? ?? ?? ???? ????.</p>
      ) : (
        <div className="space-y-4">
          {creators.map((c) => (
            <div
              key={c.id}
              className="border rounded-[12px] p-4"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
            >
              <div className="font-medium" style={{ color: 'var(--text)' }}>
                {c.email ?? '(??? ??)'}
              </div>
              <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                ??: {c.creator_status ?? 'PENDING'}
              </div>
              {c.creator_status === 'PENDING' && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => approve(c.id)}
                    className="px-4 py-2 rounded-lg text-white font-medium"
                    style={{ backgroundColor: 'var(--royal-blue)' }}
                  >
                    ??
                  </button>
                  <button
                    onClick={() => reject(c.id)}
                    className="px-4 py-2 rounded-lg font-medium border"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                  >
                    ??
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

