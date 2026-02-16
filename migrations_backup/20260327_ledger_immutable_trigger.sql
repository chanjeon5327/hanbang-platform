-- ledger_posted_at 이후 ledger_entries 수정/삭제 금지 (PG 심사 대비)
CREATE OR REPLACE FUNCTION public.trg_ledger_immutable()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF OLD.ledger_posted_at IS NOT NULL THEN
      RAISE EXCEPTION 'ledger_entries: ledger_posted_at 이후 수정 불가 (id=%)', OLD.id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.ledger_posted_at IS NOT NULL THEN
      RAISE EXCEPTION 'ledger_entries: ledger_posted_at 이후 삭제 불가 (id=%)', OLD.id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_ledger_immutable ON public.ledger_entries;
CREATE TRIGGER trg_ledger_immutable
  BEFORE UPDATE OR DELETE ON public.ledger_entries
  FOR EACH ROW EXECUTE FUNCTION public.trg_ledger_immutable();
