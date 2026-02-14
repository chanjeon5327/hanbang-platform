"use client";

import { useEffect, useState, useCallback } from "react";

export type ArtistProgressItem = {
  artist_keyword: string;
  total_amount: number;
  target_amount: number;
  progress_percent: number;
};

export function useArtistProgress(enabled = true) {
  const [items, setItems] = useState<ArtistProgressItem[]>([]);
  const [loading, setLoading] = useState(enabled);

  const refetch = useCallback(() => {
    if (!enabled) return;
    setLoading(true);
    fetch("/api/artist/progress", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((json) => setItems(json?.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      setItems([]);
      return;
    }
    refetch();
  }, [enabled, refetch]);

  useEffect(() => {
    if (!enabled) return;
    const handler = () => refetch();
    window.addEventListener("invest-success", handler);
    return () => window.removeEventListener("invest-success", handler);
  }, [enabled, refetch]);

  return { items, loading, refetch };
}
