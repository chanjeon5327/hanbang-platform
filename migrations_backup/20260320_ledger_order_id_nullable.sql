-- ledger_entries.order_id: DIVIDEND 등 order와 무관한 항목 허용
ALTER TABLE public.ledger_entries ALTER COLUMN order_id DROP NOT NULL;
