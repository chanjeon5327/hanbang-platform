-- investor_profiles.kyc_status: VERIFIED -> APPROVED
ALTER TABLE public.investor_profiles DROP CONSTRAINT IF EXISTS investor_profiles_kyc_status_check;
ALTER TABLE public.investor_profiles ADD CONSTRAINT investor_profiles_kyc_status_check
  CHECK (kyc_status IN ('PENDING', 'APPROVED', 'REJECTED'));
UPDATE public.investor_profiles SET kyc_status = 'APPROVED' WHERE kyc_status = 'VERIFIED';
