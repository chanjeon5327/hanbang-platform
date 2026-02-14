# 데이터 백업 전략

런칭 직전 안정화를 위한 PostgreSQL 백업 및 복구 절차입니다.

---

## 1. 매일 02:00 Logical Backup

### cron 설정 (Linux/macOS)

```bash
# crontab -e
0 2 * * * /usr/bin/pg_dump -h <DB_HOST> -U postgres -d <DB_NAME> -F c -f /backup/hanbang_$(date +\%Y\%m\%d).dump
```

### pg_dump 예시 (수동 실행)

```bash
# Custom format (압축, 병렬 복원 가능)
pg_dump -h localhost -U postgres -d postgres -F c -f hanbang_backup_$(date +%Y%m%d).dump

# Plain SQL (가독성, 선택적 복원)
pg_dump -h localhost -U postgres -d postgres -F p -f hanbang_backup_$(date +%Y%m%d).sql

# Supabase 프로젝트 (Connection string 사용)
pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres" -F c -f hanbang_backup.dump
```

### 환경 변수 예시

```bash
export PGHOST=db.xxxx.supabase.co
export PGPORT=5432
export PGUSER=postgres
export PGPASSWORD=<your-password>
export PGDATABASE=postgres

pg_dump -F c -f hanbang_$(date +%Y%m%d).dump
```

---

## 2. Weekly Snapshot

- **주기**: 매주 일요일 03:00
- **방식**: 당일 logical backup을 별도 디렉터리에 보관 (예: `/backup/weekly/`)
- **보관 기간**: 최소 4주

```bash
# cron
0 3 * * 0 cp /backup/hanbang_$(date +\%Y\%m\%d).dump /backup/weekly/
# 4주 초과 분 삭제 (선택)
find /backup/weekly -name "hanbang_*.dump" -mtime +28 -delete
```

---

## 3. Restore 절차

### Custom format (.dump) 복원

```bash
# 1) 기존 DB가 있는 경우 - 스키마만 복원 (데이터 제외)
pg_restore -h localhost -U postgres -d postgres -c -F c hanbang_backup.dump

# 2) 빈 DB에 전체 복원
pg_restore -h localhost -U postgres -d postgres -F c hanbang_backup.dump

# 3) 특정 테이블만 복원
pg_restore -h localhost -U postgres -d postgres -t orders -t payments -F c hanbang_backup.dump
```

### Plain SQL (.sql) 복원

```bash
psql -h localhost -U postgres -d postgres -f hanbang_backup.sql
```

### Supabase 복원 시 주의

- Supabase 대시보드에서 새 프로젝트 생성 후, `psql` 또는 `pg_restore`로 데이터 복원
- `auth.users` 등 Supabase 내부 스키마는 신중히 복원 (기본 제공 스키마와 충돌 가능)

---

## 4. 체크리스트

| 항목 | 주기 | 담당 |
|------|------|------|
| Logical backup 실행 확인 | 매일 | 자동화 |
| Weekly snapshot 보관 확인 | 매주 | 자동화 |
| Restore 테스트 | 월 1회 | 운영팀 |
| 백업 파일 암호화/오프사이트 보관 | 설정 시 | 인프라 |

---

## 5. 참고

- `pg_dump`는 논리적 백업으로, DB가 실행 중이어도 일관된 스냅샷 제공
- 대용량 DB는 `-j N` 옵션으로 병렬 덤프 가능 (Custom format)
- Supabase Pro 이상: Point-in-Time Recovery (PITR) 옵션 검토
