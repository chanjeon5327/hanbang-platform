-- 금융 감사 로그 확장
CREATE TABLE IF NOT EXISTS public.financial_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  target_type text NOT NULL,
  target_id text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_financial_audit_user ON public.financial_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_audit_created ON public.financial_audit_logs(created_at DESC);
ALTER TABLE public.financial_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY financial_audit_select_own ON public.financial_audit_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY financial_audit_insert_own ON public.financial_audit_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
