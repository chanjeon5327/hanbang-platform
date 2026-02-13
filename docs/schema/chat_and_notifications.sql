-- ============================================================
-- 채팅 + 알림 시스템 DB 구조 설계
-- 실제 migration은 추후 적용
-- ============================================================

-- ------------------------------------------------------------
-- 1. 마켓 채팅 메시지
-- ------------------------------------------------------------
-- CREATE TABLE market_chat_messages (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   market_id TEXT NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
--   user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
--   message TEXT NOT NULL CHECK (char_length(message) <= 300),
--   created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
--   is_deleted BOOLEAN NOT NULL DEFAULT false,
--   is_pinned BOOLEAN NOT NULL DEFAULT false,
--   reported_count INTEGER NOT NULL DEFAULT 0
-- );

-- CREATE INDEX idx_market_chat_messages_market_id ON market_chat_messages(market_id);
-- CREATE INDEX idx_market_chat_messages_created_at ON market_chat_messages(created_at DESC);

-- ------------------------------------------------------------
-- 2. 채팅 신고
-- ------------------------------------------------------------
-- CREATE TABLE market_chat_reports (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   message_id UUID NOT NULL REFERENCES market_chat_messages(id) ON DELETE CASCADE,
--   reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
--   reason TEXT,
--   created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
--   UNIQUE(message_id, reporter_id)
-- );

-- CREATE INDEX idx_market_chat_reports_message_id ON market_chat_reports(message_id);

-- ------------------------------------------------------------
-- 3. 알림
-- ------------------------------------------------------------
-- notification_type: PRICE_CHANGE, MOBILIZATION_90, DEADLINE_SOON, SETTLEMENT_DONE, CHAT_REPLY, KYC_APPROVED, NEWS_UPDATE

-- CREATE TABLE notifications (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
--   type TEXT NOT NULL CHECK (type IN (
--     'PRICE_CHANGE', 'MOBILIZATION_90', 'DEADLINE_SOON', 'SETTLEMENT_DONE',
--     'CHAT_REPLY', 'KYC_APPROVED', 'NEWS_UPDATE'
--   )),
--   reference_id TEXT,
--   title TEXT NOT NULL,
--   content TEXT,
--   is_read BOOLEAN NOT NULL DEFAULT false,
--   created_at TIMESTAMPTZ NOT NULL DEFAULT now()
-- );

-- CREATE INDEX idx_notifications_user_id ON notifications(user_id);
-- CREATE INDEX idx_notifications_user_read_created ON notifications(user_id, is_read, created_at DESC);
