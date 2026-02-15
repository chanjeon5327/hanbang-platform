'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  useEffect(() => {
    if (id) router.replace(`/market/${id}`);
  }, [id, router]);
  return <div className="min-h-screen flex items-center justify-center" style={{ color: 'var(--text-secondary)' }}>이동 중...</div>;
}
