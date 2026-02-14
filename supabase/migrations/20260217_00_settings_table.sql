-- settings: 관리자 전역 설정 (key-value)
-- RPC 한도/스위치 검증에 사용되므로 다른 20260217 마이그레이션보다 먼저 실행되어야 함

CREATE TABLE IF NOT EXISTS public.settings (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.settings (key, value) VALUES ('INVEST_ENABLED', 'true')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- 읽기는 인증된 유저, 쓰기는 ADMIN만 (추후 RPC로)
CREATE POLICY "settings_select_authenticated" ON public.settings FOR SELECT TO authenticated USING (true);
