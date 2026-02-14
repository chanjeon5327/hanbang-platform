-- deadline API 최적화: status=active, deadline>now(), order by deadline asc
CREATE INDEX IF NOT EXISTS idx_content_items_status_deadline
  ON public.content_items (status, deadline)
  WHERE status = 'active' AND deadline IS NOT NULL;
