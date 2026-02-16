'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/context/ToastContext';

type Item = {
  id: string;
  title: string;
};

const allItems: Item[] = Array.from({ length: 12 }).map((_, i) => ({
  id: String(i),
  title: i % 2 ? '전지적 독자 시점 웹툰' : '유튜브 <여행가 제이>',
}));

export default function AdminHomeConfigPage() {
  const { toast } = useToast();
  const supabase = createClient();
  const [fixedHeroId, setFixedHeroId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: cfg } = await supabase
        .from('admin_home_config')
        .select('value')
        .eq('key', 'fixed_hero')
        .maybeSingle();

      setFixedHeroId((cfg?.value as any)?.item_id ?? null);
      setLoading(false);
    };
    load();
  }, [supabase]);

  const save = async (id: string | null) => {
    await supabase
      .from('admin_home_config')
      .upsert(
        {
          key: 'fixed_hero',
          value: { item_id: id },
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' },
      );

    setFixedHeroId(id);
    toast(id ? `히어로 고정: ${id}` : '히어로 고정 해제');
  };

  if (loading) return <div className="p-4">로딩중…</div>;

  return (
    <div className="p-4">
      <h1 className="mb-3 body-lg font-bold">홈 히어로 설정</h1>

      <div className="mb-3 body-sm text-black/60">
        선택하면 홈 히어로가 고정됩니다. (해제하면 자동정렬)
      </div>

      <div className="space-y-2">
        <button
          onClick={() => save(null)}
          className="w-full rounded-lg bg-black/10 py-2 text-sm"
        >
          고정 해제 (자동정렬로)
        </button>

        {allItems.map((it) => (
          <button
            key={it.id}
            onClick={() => save(it.id)}
            className={`w-full rounded-lg py-2 text-sm ring-1 ${
              fixedHeroId === it.id
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
}
