# Supabase Realtime 설정 가이드 (product_chat_messages)

## 1. 정확한 클릭 경로 (3줄)

1. **프로젝트 선택** → 왼쪽 사이드바 **Database** 클릭  
2. 상단 탭에서 **Publications** 클릭  
3. `supabase_realtime` 행에서 **product_chat_messages** 토글 ON  

> URL 직접 접근: `https://supabase.com/dashboard/project/[프로젝트ID]/database/publications`

---

## 2. SQL: Replication 확인/점검

### 테이블 추가 (Replication 활성화)

```sql
-- product_chat_messages를 supabase_realtime publication에 추가
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_chat_messages;
```

### Replication 확인 쿼리

```sql
-- 1) supabase_realtime에 포함된 테이블 목록
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY schemaname, tablename;

-- 2) product_chat_messages 포함 여부
SELECT EXISTS (
  SELECT 1 FROM pg_publication_tables
  WHERE pubname = 'supabase_realtime'
    AND schemaname = 'public'
    AND tablename = 'product_chat_messages'
) AS product_chat_messages_replicated;

-- 3) publication 목록 및 소속 테이블
SELECT p.pubname, pt.schemaname, pt.tablename
FROM pg_publication p
LEFT JOIN pg_publication_tables pt ON p.pubname = pt.pubname
WHERE p.pubname = 'supabase_realtime';
```

---

## 3. INSERT 이벤트 수신 테스트 (브라우저 2개)

| 단계 | 브라우저 A | 브라우저 B |
|------|------------|------------|
| 1 | `/market/a1b2c3d4-e5f6-4789-a012-345678901234` 접속, **로그인** | 동일 URL 접속 (로그인 여부 무관) |
| 2 | 채팅 입력창에 메시지 입력 후 전송 | 채팅 영역만 보면서 대기 |
| 3 | - | **새로고침 없이** 메시지가 나타나면 성공 |

> `a1b2c3d4-e5f6-4789-a012-345678901234`는 FALLBACK_IDS.SAMPLE_1 (E2E 시드와 동일). DB에 해당 product가 없으면 먼저 시드 실행.

---

## 4. 실패 시 체크할 항목 5개

| # | 체크 항목 | 확인 방법 |
|---|-----------|-----------|
| 1 | **product_chat_messages가 publication에 포함됐는지** | 위 SQL `pg_publication_tables` 쿼리로 확인 |
| 2 | **RLS 정책이 SELECT를 허용하는지** | `product_chat_messages_select_all` 정책 존재 여부, `USING (is_deleted = false)` 확인 |
| 3 | **Supabase URL / anon key가 올바른지** | `.env.local`의 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 확인 |
| 4 | **productId가 유효한 UUID인지** | `/market/sample-1` 같은 문자열 id 사용 시 Realtime 필터 실패 → UUID 사용 |
| 5 | **WebSocket 연결 차단 여부** | 브라우저 DevTools → Network → WS 탭에서 `realtime` 연결 상태, 방화벽/프록시 차단 여부 확인 |
