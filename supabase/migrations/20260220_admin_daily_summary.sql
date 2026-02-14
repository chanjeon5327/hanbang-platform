-- 관리자 운영 콘솔용 VIEW

-- 1) 오늘 매출 요약
CREATE OR REPLACE VIEW public.v_admin_daily_summary AS
SELECT
  CURRENT_DATE AS date,
  COUNT(*) FILTER (WHERE o.status IN ('INVEST_CONFIRMED','SETTLED','COMPLETED')
                   AND o.created_at::date = CURRENT_DATE) AS confirmed_count,
  COALESCE(SUM(o.total_amount_krw) FILTER (WHERE o.status IN ('INVEST_CONFIRMED','SETTLED','COMPLETED')
                   AND o.created_at::date = CURRENT_DATE), 0) AS confirmed_amount,
  COUNT(*) FILTER (WHERE o.status = 'CANCELLED'
                   AND o.created_at::date = CURRENT_DATE) AS cancelled_count
FROM orders o;

-- 2) 최근 10분 내 다중 결제 시도 탐지
CREATE OR REPLACE VIEW public.v_admin_suspicious_activity AS
SELECT
  user_id,
  COUNT(*) AS payment_attempts,
  MIN(created_at) AS first_attempt,
  MAX(created_at) AS last_attempt
FROM payments
WHERE created_at >= NOW() - INTERVAL '10 minutes'
GROUP BY user_id
HAVING COUNT(*) >= 5;

-- 3) 콘텐츠 매출 24h (API에서 ORDER BY, LIMIT 적용)
CREATE OR REPLACE VIEW public.v_admin_top_content_24h AS
SELECT
  content_id,
  SUM(total_amount_krw) AS total_amount,
  COUNT(*) AS order_count
FROM orders
WHERE status IN ('INVEST_CONFIRMED','SETTLED','COMPLETED')
  AND created_at >= NOW() - INTERVAL '24 hours'
  AND content_id IS NOT NULL
GROUP BY content_id;

GRANT SELECT ON public.v_admin_daily_summary TO authenticated;
GRANT SELECT ON public.v_admin_suspicious_activity TO authenticated;
GRANT SELECT ON public.v_admin_top_content_24h TO authenticated;
