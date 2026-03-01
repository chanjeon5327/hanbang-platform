'use client';

import { useEffect, useState } from 'react';
import { getBrowserSupabase } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

type Row = {
  day: string;
  item_id: string;
  preview_opened: number;
  preview_cta_clicked: number;
  detail_viewed: number;
};

export default function AdminFunnelPage() {
  const supabase = getBrowserSupabase();
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/admin/login?redirect=/admin/funnel');
        return;
      }

      const { data, error } = await supabase
        .from('ui_funnel_daily')
        .select('*')
        .order('day', { ascending: false });

      if (!error && data) setRows(data as Row[]);
      setLoading(false);
    };

    init();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-sm">로딩중…</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="mb-4 body-lg font-bold">퍼널 분석</h1>

      <div className="overflow-x-auto rounded-xl ring-1 ring-black/10">
        <table className="w-full border-collapse body-sm">
          <thead className="bg-black/5">
            <tr>
              <th className="px-3 py-2 text-left">날짜</th>
              <th className="px-3 py-2 text-left">아이템</th>
              <th className="px-3 py-2 text-right">프리뷰</th>
              <th className="px-3 py-2 text-right">CTA</th>
              <th className="px-3 py-2 text-right">상세</th>
              <th className="px-3 py-2 text-right">CTA율</th>
              <th className="px-3 py-2 text-right">상세율</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const ctaRate =
                r.preview_opened > 0
                  ? (r.preview_cta_clicked / r.preview_opened) * 100
                  : 0;
              const detailRate =
                r.preview_cta_clicked > 0
                  ? (r.detail_viewed / r.preview_cta_clicked) * 100
                  : 0;

              return (
                <tr key={i} className="border-t">
                  <td className="px-3 py-2">{r.day.slice(0, 10)}</td>
                  <td className="px-3 py-2">{r.item_id}</td>
                  <td className="px-3 py-2 text-right">{r.preview_opened}</td>
                  <td className="px-3 py-2 text-right">
                    {r.preview_cta_clicked}
                  </td>
                  <td className="px-3 py-2 text-right">{r.detail_viewed}</td>
                  <td className="px-3 py-2 text-right">
                    {ctaRate.toFixed(1)}%
                  </td>
                  <td className="px-3 py-2 text-right">
                    {detailRate.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
