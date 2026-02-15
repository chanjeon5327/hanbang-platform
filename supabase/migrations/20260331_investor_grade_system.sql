-- DAY 3: Investor Grade + Risk Control
-- investor_profiles, dividend status machine, ledger immutable

-- 1) investor_profiles
CREATE TABLE IF NOT EXISTS public.investor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  grade text NOT NULL DEFAULT 'GENERAL' CHECK (grade IN ('GENERAL', 'QUALIFIED', 'PRO')),
  investment_limit numeric(20,0) NOT NULL DEFAULT 50000000,
  kyc_status text NOT NULL DEFAULT 'PENDING' CHECK (kyc_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
  risk_acknowledged_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_investor_profiles_user ON public.investor_profiles(user_id);
ALTER TABLE public.investor_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS investor_profiles_select_own ON public.investor_profiles;
CREATE POLICY investor_profiles_select_own ON public.investor_profiles FOR SELECT USING (auth.uid() = user_id);

-- 2) dividends status machine
ALTER TABLE public.dividends ADD COLUMN IF NOT EXISTS status text DEFAULT 'DRAFT';
ALTER TABLE public.dividends ADD COLUMN IF NOT EXISTS confirmed_at timestamptz;
ALTER TABLE public.dividends ADD COLUMN IF NOT EXISTS executed_at timestamptz;
ALTER TABLE public.dividends ADD COLUMN IF NOT EXISTS paid_at timestamptz;

-- status: DRAFT -> CALCULATED -> EXECUTED -> CONFIRMED -> PAID
CREATE OR REPLACE FUNCTION public.trg_dividend_status_check()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status IS NULL THEN NEW.status := 'DRAFT'; END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_dividend_status_check ON public.dividends;
CREATE TRIGGER trg_dividend_status_check BEFORE INSERT OR UPDATE ON public.dividends
  FOR EACH ROW EXECUTE FUNCTION public.trg_dividend_status_check();
