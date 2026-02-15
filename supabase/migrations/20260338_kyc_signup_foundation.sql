-- PHASE 5: KYC/회원가입 foundation
ALTER TABLE public.investor_profiles ADD COLUMN IF NOT EXISTS kyc_level text DEFAULT 'NONE';
ALTER TABLE public.investor_profiles ADD COLUMN IF NOT EXISTS risk_acknowledged_at timestamptz;

CREATE TABLE IF NOT EXISTS public.kyc_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  step text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'approved', 'rejected')),
  payload_json jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_user ON public.kyc_submissions(user_id);
ALTER TABLE public.kyc_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY kyc_submissions_select_own ON public.kyc_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY kyc_submissions_insert_own ON public.kyc_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY kyc_submissions_update_own ON public.kyc_submissions FOR UPDATE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.user_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  terms_version text NOT NULL,
  marketing_opt_in boolean NOT NULL DEFAULT false,
  risk_terms_accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_consents_user_version_uniq UNIQUE (user_id, terms_version)
);
CREATE INDEX IF NOT EXISTS idx_user_consents_user ON public.user_consents(user_id);
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_consents_select_own ON public.user_consents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY user_consents_insert_own ON public.user_consents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY user_consents_update_own ON public.user_consents FOR UPDATE USING (auth.uid() = user_id);
