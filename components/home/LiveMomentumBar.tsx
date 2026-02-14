'use client';

import { useEffect, useState } from 'react';

type LiveMetrics = {
  last_24h_amount: number;
  last_1h_count: number;
  today_count: number;
};

export default function LiveMomentumBar() {
  const [data, setData] = useState<LiveMetrics | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/metrics/live');
        const json = await res.json();
        if (res.ok && !json.error) {
          setData({
            last_24h_amount: json.last_24h_amount ?? 0,
            last_1h_count: json.last_1h_count ?? 0,
            today_count: json.today_count ?? 0,
          });
        }
      } catch {
        setData({ last_24h_amount: 0, last_1h_count: 0, today_count: 0 });
      }
    };
    fetchMetrics();
    const t = setInterval(fetchMetrics, 60_000);
    return () => clearInterval(t);
  }, []);

  if (!data) return null;

  const formatAmount = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return n.toLocaleString();
  };

  return (
    <div
      className="w-full py-2 px-4 flex items-center justify-center gap-4 text-[12px] font-medium"
      style={{ backgroundColor: '#000', color: '#C5A059' }}
    >
      <span className="inline-flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse" />
        24h ₩{formatAmount(data.last_24h_amount)}
      </span>
      <span className="opacity-70">|</span>
      <span>1h {data.last_1h_count}명</span>
      <span className="opacity-70">|</span>
      <span>오늘 {data.today_count}건</span>
    </div>
  );
}
