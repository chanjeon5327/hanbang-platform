-- ledger_entries 무결성: entry_type 검증, 금액 검증, order_id CASH_DEBIT 중복 방지
-- PG 심사용 구조 고정

-- 1) entry_type 허용 목록 (CASH_DEBIT, CASH_CREDIT, ASSET_CREDIT, ASSET_DEBIT, DIVIDEND, SIM_DEPOSIT, SIM_RESET 등)
CREATE OR REPLACE FUNCTION public.fn_ledger_entry_type_check()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.entry_type NOT IN (
    'CASH_DEBIT', 'CASH_CREDIT', 'ASSET_CREDIT', 'ASSET_DEBIT',
    'DIVIDEND', 'PRODUCT_PURCHASE', 'PRODUCT_SELL', 'TRADE_BUY', 'TRADE_SELL',
    'SIM_DEPOSIT', 'SIM_RESET', 'SETTLEMENT_SEAL'
  ) THEN
    RAISE EXCEPTION 'LEDGER_INVALID_ENTRY_TYPE: % not allowed', NEW.entry_type;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ledger_entry_type_check ON public.ledger_entries;
CREATE TRIGGER trg_ledger_entry_type_check
  BEFORE INSERT ON public.ledger_entries
  FOR EACH ROW EXECUTE FUNCTION public.fn_ledger_entry_type_check();

-- 2) CASH_CREDIT/ASSET_CREDIT: amount >= 0, CASH_DEBIT/ASSET_DEBIT: amount <= 0 (금액 음수 입력 차단은 CREDIT에 적용)
CREATE OR REPLACE FUNCTION public.fn_ledger_amount_check()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.entry_type IN ('CASH_CREDIT', 'ASSET_CREDIT') AND COALESCE(NEW.amount, 0) < 0 THEN
    RAISE EXCEPTION 'LEDGER_INVALID_AMOUNT: CREDIT types require amount >= 0';
  END IF;
  IF NEW.entry_type = 'CASH_DEBIT' AND COALESCE(NEW.amount, 0) > 0 THEN
    RAISE EXCEPTION 'LEDGER_INVALID_AMOUNT: CASH_DEBIT requires amount <= 0';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ledger_amount_check ON public.ledger_entries;
CREATE TRIGGER trg_ledger_amount_check
  BEFORE INSERT ON public.ledger_entries
  FOR EACH ROW EXECUTE FUNCTION public.fn_ledger_amount_check();

-- 3) 동일 order_id CASH_DEBIT 중복 방지 (트리거로 INSERT 시 검사)
CREATE OR REPLACE FUNCTION public.fn_ledger_cash_debit_duplicate_check()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.entry_type = 'CASH_DEBIT' AND NEW.order_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM public.ledger_entries WHERE order_id = NEW.order_id AND entry_type = 'CASH_DEBIT') THEN
      RAISE EXCEPTION 'LEDGER_DUPLICATE_CASH_DEBIT: order_id % already has CASH_DEBIT', NEW.order_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ledger_cash_debit_duplicate_check ON public.ledger_entries;
CREATE TRIGGER trg_ledger_cash_debit_duplicate_check
  BEFORE INSERT ON public.ledger_entries
  FOR EACH ROW EXECUTE FUNCTION public.fn_ledger_cash_debit_duplicate_check();
