# 성능 업그레이드 (2026-02-28)

## 1. MV 구조 설명

### popular_content_mv

| 항목 | 내용 |
|------|------|
| 정의 | `user_interests`의 `content_id`별 관심 count 집계 |
| 갱신 | `refresh_popular_content_mv()` 함수 호출 (REFRESH MATERIALIZED VIEW CONCURRENTLY) |
| 권장 주기 | 5분 (cron 등) |
| unique index | `content_id` (CONCURRENTLY 갱신 필수) |

```sql
-- 수동 갱신
SELECT refresh_popular_content_mv();
```

---

## 2. 채팅 Rate Limit 설계

| 제한 | 값 | 설명 |
|------|-----|------|
| 초당 | 1회 | 최근 1초 내 레코드 존재 시 429 |
| 10초당 | 5회 | 최근 10초 내 5건 초과 시 429 |

### chat_rate_limit 테이블

- `user_id`, `created_at` 저장
- RLS: 본인만 insert/select
- 인덱스: `(user_id, created_at desc)` — 시간 범위 조회 최적화

### 정리 전략

- 장기 보관 시 테이블 비대화 가능
- 향후: TTL 기반 정리(cron) 또는 Redis 도입 시 테이블 제거 검토

---

## 3. 캐싱 TTL 전략표

| API | revalidate | TTL |
|-----|------------|-----|
| `/api/home/popular` | 300 | 5분 |
| `/api/home/deadline` | 60 | 1분 |
| `/api/home/sponsored` | 120 | 2분 |

### fetch 호출

- `cache: 'no-store'` 제거 → 기본 Next.js 캐시 사용
- Route Handler의 `revalidate`에 따라 ISR 동작

---

## 4. 향후 Redis 도입 가능성

- **chat_rate_limit**: Redis INCR + EXPIRE로 대체 시 단일 키·메모리 기반으로 단순화
- **popular MV**: Redis 캐시 레이어 추가 시 DB 부하 추가 감소 가능
- 현재는 Postgres 단일 소스로 운영, 트래픽 증가 시 Redis 검토
