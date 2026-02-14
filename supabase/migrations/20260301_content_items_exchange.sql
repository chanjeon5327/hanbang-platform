-- content_items: 거래소형 + 월배당 상품 타입 및 USD 기축 컬럼
-- product_type: DIVIDEND_ONLY(월배당만) | DIVIDEND_TRADABLE(월배당+거래)
ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS product_type text DEFAULT 'DIVIDEND_ONLY';
ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS pricing_currency text DEFAULT 'USD';
ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS share_price_usd numeric(20,6);
ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS total_raise_usd numeric(20,6);
ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS current_raise_usd numeric(20,6);
ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS dividend_monthly_usd_per_share numeric(20,6);
ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS dividend_monthly_rate numeric(10,4);
ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS payout_day smallint DEFAULT 3;

COMMENT ON COLUMN public.content_items.product_type IS 'DIVIDEND_ONLY | DIVIDEND_TRADABLE';
COMMENT ON COLUMN public.content_items.payout_day IS '매월 정산일 (1~28)';
