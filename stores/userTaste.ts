'use client';

import { create } from 'zustand';
import { createClient } from '@/utils/supabase/client';

export type TasteScore = {
  id: string;
  score: number;
};

type TasteState = {
  tastes: TasteScore[];
  hydrate: () => Promise<void>;
  rate: (id: string, score: number) => Promise<void>;
};

const supabase = createClient();

export const useUserTaste = create<TasteState>((set, get) => ({
  tastes: [],

  hydrate: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from('user_tastes')
      .select('item_id, score')
      .eq('user_id', user.id);

    if (data) {
      set({
        tastes: data.map((d: { item_id: string; score: number }) => ({ id: d.item_id, score: d.score })),
      });
    }
  },

  rate: async (id, score) => {
    // 로컬 먼저 반영 (UX 우선)
    const prev = get().tastes;
    const exists = prev.find((t) => t.id === id);
    set({
      tastes: exists
        ? prev.map((t) => (t.id === id ? { ...t, score } : t))
        : [...prev, { id, score }],
    });

    // 로그인 상태면 서버 저장
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase
      .from('user_tastes')
      .upsert(
        {
          user_id: user.id,
          item_id: id,
          score,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,item_id' }
      );
  },
}));
