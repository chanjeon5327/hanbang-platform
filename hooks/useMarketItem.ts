'use client';

import { useEffect, useState, useCallback } from 'react';

type MarketItemResponse = {
  item: any;
};

export type MarketItem = {
  id: string;
  title: string;
  summary?: string;
  creator_name?: string;
  category?: string;
  platform?: string;
  thumbnail_url?: string;
  deadline?: string | null;
  youtube_video_id?: string | null;
  media_url?: string | null;
  created_at?: string;
  total_raise?: number | null;
  current_raise?: number | null;
  popular_cnt?: number;
  yield_rate?: number | null;
  participants?: number;
  artist_keyword?: string | null;
  event_date?: string | null;
  last_1h_count?: number;
  last_24h_count?: number;
  last_24h_amount?: number;
  product_type?: 'DIVIDEND_ONLY' | 'DIVIDEND_TRADABLE';
  pricing_currency?: string;
  share_price_usd?: number | null;
  total_raise_usd?: number | null;
  current_raise_usd?: number | null;
  dividend_monthly_usd_per_share?: number | null;
  dividend_monthly_rate?: number | null;
  payout_day?: number;
  fx_rate?: number;
  monthlyRevenue?: number;
  dividendRatio?: number;
  dividendPerShare?: number;
  expectedAnnualYield?: number;
  creator_story?: string | null;
  growth_reason_1?: string | null;
  growth_reason_2?: string | null;
  growth_reason_3?: string | null;
  total_shares?: number | null;
  integrity_ok?: boolean;
  settlement_count?: number;
};

export function useMarketItem(id: string | undefined) {
  const [item, setItem] = useState<MarketItem | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    if (!id) return;
    setLoading(true);
    const url = `/api/market/item/${id}`;
    console.log("API:", url);
    fetch(url, { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((j: MarketItemResponse) => {
        console.log("ITEM FROM API:", j);
        setItem(j?.item ?? null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) {
      setItem(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const url = `/api/market/item/${id}`;
    console.log("API:", url);
    fetch(url, { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((j: MarketItemResponse) => {
        console.log("ITEM FROM API:", j);
        setItem(j?.item ?? null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { item, loading, error, refetch };
}
