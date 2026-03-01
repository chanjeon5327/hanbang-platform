-- content_items: 크리에이터 기획 구조화 필드 (투자자 5초 이해용)
ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS strategy_summary text;
ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS target_market text;
ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS revenue_model text;
ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS core_team text;
ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS equipment_stack text;
ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS distribution_plan text;

COMMENT ON COLUMN public.content_items.strategy_summary IS '사업 방향 요약';
COMMENT ON COLUMN public.content_items.target_market IS '타겟 시장 (예: 국내/한류/말레이시아/기업용)';
COMMENT ON COLUMN public.content_items.revenue_model IS '수익 모델';
COMMENT ON COLUMN public.content_items.core_team IS '핵심 팀 구성';
COMMENT ON COLUMN public.content_items.equipment_stack IS '장비/제작 인프라';
COMMENT ON COLUMN public.content_items.distribution_plan IS '유통 전략';
