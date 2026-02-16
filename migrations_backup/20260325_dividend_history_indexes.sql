CREATE INDEX IF NOT EXISTS dividends_created_at_desc_idx ON public.dividends (created_at DESC);
CREATE INDEX IF NOT EXISTS dividend_distributions_user_created_idx ON public.dividend_distributions (user_id, created_at DESC);
