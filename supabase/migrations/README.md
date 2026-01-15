# Supabase Migrations

이 폴더는 Supabase 마이그레이션 파일을 관리합니다.

## 사용 방법

1. Supabase CLI를 사용하여 마이그레이션 실행:
```bash
supabase db push
```

2. 또는 Supabase Dashboard의 SQL Editor에서 `schema.sql` 파일의 내용을 직접 실행하세요.

## 주의사항

- 프로덕션 환경에서는 반드시 백업 후 마이그레이션을 실행하세요.
- RLS (Row Level Security) 정책이 모든 테이블에 적용되어 있습니다.

