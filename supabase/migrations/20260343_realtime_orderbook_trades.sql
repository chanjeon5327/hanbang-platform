-- orderbook_orders, trades를 supabase_realtime publication에 추가
-- 거래소 UI 실시간 호가/체결 반영용
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'orderbook_orders') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orderbook_orders;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'trades') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.trades;
  END IF;
END $$;
