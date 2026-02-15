-- ============================================================
-- 금융 운영 점검 쿼리 (복붙용)
-- 정상 기준 값은 주석으로 명시
-- ============================================================

-- 1) 최근 10분 LOCK_BUSY 비율
-- 정상: DB에 직접 기록 안 됨. 앱 메트릭 필요.
-- (finance_health_metrics 테이블 추가 시 사용)
/*
SELECT
  lock_busy_count::float / NULLIF(total_requests, 0) AS lock_busy_ratio
FROM finance_health_metrics
WHERE created_at > now() - interval '10 min'
ORDER BY created_at DESC LIMIT 1;
-- 정상: ratio < 0.5
*/

-- 2) 최근 10분 audit 액션별 카운트
SELECT action, COUNT(*) AS cnt
FROM financial_audit_logs
WHERE created_at > now() - interval '10 min'
GROUP BY action
ORDER BY action;
-- 정상: 거래 있을 때 ORDERBOOK_WRITE, LEDGER_WRITE, MATCH_ORDER >= 1

-- 3) Ledger 전체 cash 밸런스
SELECT
  COALESCE(SUM(CASE WHEN entry_type = 'CASH_CREDIT' THEN amount ELSE 0 END), 0)
  - COALESCE(SUM(CASE WHEN entry_type = 'CASH_DEBIT' THEN ABS(amount) ELSE 0 END), 0) AS cash_net
FROM ledger_entries;
-- 정상: 입금/시드 총합과 일치 (음수면 이상)

-- 4) Ledger asset별 밸런스
SELECT asset_id,
  COALESCE(SUM(CASE WHEN entry_type = 'ASSET_CREDIT' THEN quantity ELSE 0 END), 0)
  - COALESCE(SUM(CASE WHEN entry_type = 'ASSET_DEBIT' THEN quantity ELSE 0 END), 0) AS asset_net
FROM ledger_entries
WHERE asset_id IS NOT NULL
GROUP BY asset_id
ORDER BY asset_id;
-- 정상: asset_net >= 0 (음수면 불일치)

-- 5) 특정 content_id ledger 검사 (content_id 치환)
/*
SELECT entry_type, COUNT(*), SUM(amount), SUM(quantity)
FROM ledger_entries
WHERE asset_id = '00000000-0000-0000-0000-000000000001'
   OR (asset_id IS NULL AND memo LIKE '%TRADE%')
GROUP BY entry_type;
*/

-- 6) 불변식 위반 주문 (remaining < 0 또는 filled > quantity)
SELECT id, content_id, side, quantity, filled_quantity, remaining_quantity, status
FROM orderbook_orders
WHERE remaining_quantity < 0
   OR filled_quantity > quantity
   OR ABS(COALESCE(remaining_quantity, quantity - COALESCE(filled_quantity,0)) + COALESCE(filled_quantity,0) - quantity) > 0.001;
-- 정상: 0 rows

-- 7) 최근 10분 체결 수
SELECT content_id, COUNT(*) AS trade_count
FROM trades
WHERE created_at > now() - interval '10 min'
GROUP BY content_id
ORDER BY trade_count DESC;

-- 8) 매칭 가능 호가 존재 여부
SELECT content_id, side, COUNT(*) AS cnt, MIN(price_usd) AS min_p, MAX(price_usd) AS max_p
FROM orderbook_orders
WHERE status IN ('open','partial')
  AND COALESCE(remaining_quantity, quantity - COALESCE(filled_quantity,0)) > 0
GROUP BY content_id, side
ORDER BY content_id, side;

-- 9) Advisory lock 점유 확인 (락 걸림 의심 시)
SELECT pid, locktype, objid, mode, granted
FROM pg_locks
WHERE locktype = 'advisory'
ORDER BY objid;
