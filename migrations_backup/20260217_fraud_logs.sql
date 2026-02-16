-- fraud_logs: 이상 거래 탐지 로그

CREATE TABLE IF NOT EXISTS public.fraud_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  content_id uuid REFERENCES public.content_items(id) ON DELETE SET NULL,
  amount bigint,
  reason text NOT NULL,
  ip_address text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fraud_logs_user ON public.fraud_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_logs_created ON public.fraud_logs (created_at DESC);

ALTER TABLE public.fraud_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fraud_logs_admin_only" ON public.fraud_logs FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN'));
