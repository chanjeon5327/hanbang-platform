-- payments에 ip_address 추가 (이상 거래 탐지용)
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS ip_address text;
CREATE INDEX IF NOT EXISTS idx_payments_ip ON public.payments (ip_address) WHERE ip_address IS NOT NULL;
