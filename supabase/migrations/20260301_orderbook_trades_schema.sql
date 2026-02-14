-- orderbook_orders: 호가 주문 테이블 (스키마만, 실체결 로직 TODO)
-- trades: 체결 내역 테이블 (스키마만, 실체결 로직 TODO)
-- UI 단계에서 mock/dummy 허용, 추후 실연동 지점 표시

CREATE TABLE IF NOT EXISTS public.orderbook_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  side text NOT NULL CHECK (side IN ('bid', 'ask')),
  price_usd numeric(20,6) NOT NULL,
  quantity numeric(20,6) NOT NULL,
  filled_quantity numeric(20,6) DEFAULT 0,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'filled', 'partial', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orderbook_orders_content_side ON public.orderbook_orders(content_id, side);
CREATE INDEX IF NOT EXISTS idx_orderbook_orders_user ON public.orderbook_orders(user_id);

CREATE TABLE IF NOT EXISTS public.trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  bid_order_id uuid REFERENCES public.orderbook_orders(id),
  ask_order_id uuid REFERENCES public.orderbook_orders(id),
  price_usd numeric(20,6) NOT NULL,
  quantity numeric(20,6) NOT NULL,
  buyer_id uuid REFERENCES auth.users(id),
  seller_id uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trades_content ON public.trades(content_id);
