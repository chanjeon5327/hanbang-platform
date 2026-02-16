'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

const allItems = Array.from({ length: 12 }).map((_, i) => ({
  id: String(i),
  title: i % 2 ? '전지적 독자 시점 웹툰' : '유튜브 <여행가 제이>',
}));

export default function AdminRailConfigPage() {
  const supabase = createClient();
  const [pins, setPins] = useState<Record<string, string[]>>({
    hot: [],
    popular: [],
  });

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('admin_rail_config').select('*');
      const next = { hot: [], popular: [] } as any;
      (data ?? []).forEach((r: any) => {
        next[r.rail_key] = r.pinned_ids ?? [];
      });
      setPins(next);
    };
    load();
  }, [supabase]);

  const toggle = async (rail: string, id: string) => {
    const current = pins[rail] ?? [];
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];

    await supabase.from('admin_rail_config').upsert(
      {
        rail_key: rail,
        pinned_ids: next,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'rail_key' },
    );

    setPins((p) => ({ ...p, [rail]: next }));
  };

  const Rail = ({ rail }: { rail: string }) => (
    <div className="mb-6">
      <h2 className="mb-2 body font-bold">{rail.toUpperCase()}</h2>
      <div className="space-y-2">
        {allItems.map((it) => (
          <button
            key={it.id}
            onClick={() => toggle(rail, it.id)}
            className={`w-full rounded-lg py-2 text-sm ring-1 ${
              pins[rail]?.includes(it.id)
                ? 'bg-black text-white ring-black'
                : 'bg-white ring-black/10'
            }`}
          >
            {it.id}. {it.title}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-4">
      <h1 className="mb-4 body-lg font-bold">레일 고정 순서</h1>
      <Rail rail="hot" />
      <Rail rail="popular" />
    </div>
  );
}
