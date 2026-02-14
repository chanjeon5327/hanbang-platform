-- user_interests RLS: 로그인 유저가 본인 관심만 insert/delete/select
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;

-- SELECT: 본인만
CREATE POLICY "user_interests_select_own"
  ON public.user_interests FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: 본인만 (user_id = auth.uid())
CREATE POLICY "user_interests_insert_own"
  ON public.user_interests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- DELETE: 본인만
CREATE POLICY "user_interests_delete_own"
  ON public.user_interests FOR DELETE
  USING (auth.uid() = user_id);
