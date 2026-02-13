# Supabase CLI로 TypeScript 타입 재생성 가이드

**환경**: Windows, pnpm

---

## 사전 요구사항

1. **Node.js** (pnpm 사용 가능)
2. **Supabase 프로젝트** (원격 호스팅 또는 로컬)
3. **Docker Desktop** (로컬 DB 사용 시)

---

## 방법 A: 원격 프로젝트에서 생성 (권장)

Supabase Dashboard에 배포된 프로젝트의 **실제 스키마**를 기준으로 타입을 생성합니다.

### 1단계: Supabase CLI 설치

```powershell
pnpm add -D supabase
```

또는 전역 설치:

```powershell
npm install -g supabase
```

### 2단계: Supabase 로그인

```powershell
pnpm supabase login
```

- 브라우저가 열리면 Supabase 계정으로 로그인
- [Dashboard > Account > Access Tokens](https://supabase.com/dashboard/account/tokens)에서 토큰을 발급해 `--token` 옵션으로 전달할 수도 있음

### 3단계: 프로젝트 ID 확인

- [Supabase Dashboard](https://supabase.com/dashboard) → 프로젝트 선택
- **Settings** → **General** → **Reference ID** (예: `qolxkvqzkyfvmrqswqfg`)

또는 프로젝트 URL에서 추출:
- `https://<PROJECT_REF>.supabase.co` → `<PROJECT_REF>`가 프로젝트 ID

### 4단계: 타입 생성

```powershell
pnpm supabase gen types typescript --project-id <PROJECT_REF> --schema public > lib/supabase/types.ts
```

예시 (프로젝트 ID가 `qolxkvqzkyfvmrqswqfg`인 경우):

```powershell
pnpm supabase gen types typescript --project-id qolxkvqzkyfvmrqswqfg --schema public > lib/supabase/types.ts
```

### 5단계: 환경변수로 프로젝트 ID 사용 (선택)

`.env.local`에 추가:

```
SUPABASE_PROJECT_REF=qolxkvqzkyfvmrqswqfg
```

PowerShell에서:

```powershell
$env:SUPABASE_PROJECT_REF = "qolxkvqzkyfvmrqswqfg"
pnpm supabase gen types typescript --project-id $env:SUPABASE_PROJECT_REF --schema public > lib/supabase/types.ts
```

---

## 방법 B: 로컬 DB에서 생성

로컬 Supabase에서 migrations를 적용한 뒤 타입을 생성합니다.

### 1단계: Supabase CLI 설치

```powershell
pnpm add -D supabase
```

### 2단계: 프로젝트 초기화 (supabase 폴더가 없을 때)

```powershell
pnpm supabase init
```

- `supabase/config.toml` 생성
- 이미 `supabase/migrations`가 있으면 그대로 사용

### 3단계: 로컬 Supabase 시작

```powershell
pnpm supabase start
```

- Docker Desktop 필요
- Postgres, Studio, Auth 등 컨테이너 실행
- `supabase/migrations`가 자동 적용됨

### 4단계: 타입 생성

```powershell
pnpm supabase gen types typescript --local --schema public > lib/supabase/types.ts
```

### 5단계: 로컬 Supabase 중지 (선택)

```powershell
pnpm supabase stop
```

---

## 방법 C: 프로젝트 연결(link) 후 생성

원격 프로젝트를 연결해 두면 `--linked`로 타입을 생성할 수 있습니다.

### 1단계: 로그인 및 연결

```powershell
pnpm supabase login
pnpm supabase link --project-ref <PROJECT_REF>
```

- DB 비밀번호 입력 시 프롬프트 표시됨

### 2단계: 타입 생성

```powershell
pnpm supabase gen types typescript --linked --schema public > lib/supabase/types.ts
```

---

## package.json 스크립트 추가

```json
{
  "scripts": {
    "db:types": "supabase gen types typescript --project-id %SUPABASE_PROJECT_REF% --schema public > lib/supabase/types.ts"
  }
}
```

> **Windows PowerShell**에서는 `%VAR%` 대신 `$env:VAR` 사용:
>
> ```powershell
> $env:SUPABASE_PROJECT_REF = "qolxkvqzkyfvmrqswqfg"
> pnpm db:types
> ```

크로스 플랫폼을 위해 [cross-env](https://www.npmjs.com/package/cross-env) 또는 `dotenv-cli` 사용:

```json
{
  "scripts": {
    "db:types": "supabase gen types typescript --project-id $SUPABASE_PROJECT_REF --schema public > lib/supabase/types.ts"
  }
}
```

`.env.local`에 `SUPABASE_PROJECT_REF`가 있으면:

```powershell
# PowerShell에서 .env.local 로드 후 실행
Get-Content .env.local | ForEach-Object { if ($_ -match '^SUPABASE_PROJECT_REF=(.+)$') { $env:SUPABASE_PROJECT_REF = $matches[1] } }
pnpm supabase gen types typescript --project-id $env:SUPABASE_PROJECT_REF --schema public > lib/supabase/types.ts
```

---

## gen types 옵션

| 옵션 | 설명 |
|------|------|
| `--project-id <string>` | 원격 프로젝트 ID |
| `--local` | 로컬 DB 사용 |
| `--linked` | 연결된 프로젝트 사용 |
| `--db-url <string>` | DB URL 직접 지정 |
| `--schema <strings>` | 스키마 (기본: public) |
| `--lang typescript` | 출력 언어 (기본값) |

---

## 생성 후 확인

1. **빌드 확인**

   ```powershell
   pnpm build
   ```

2. **타입 단언 제거**

   - `lib/supabase/types.ts`에 `orders`, `profiles` 등이 포함되면
   - `app/api/payments/request/route.ts`의 `PaymentOrder` 타입 단언
   - `lib/admin/requireAdmin.ts`의 `ProfileRole` 타입 단언
   - `lib/auth/requireActiveUser.ts`의 `ProfileStatus` 타입 단언
   - 위 코드를 제거하고 Supabase 타입을 그대로 사용하도록 수정 가능

---

## 문제 해결

### "Missing SUPABASE_ACCESS_TOKEN" 또는 "project not found"

- `pnpm supabase login` 재실행
- 프로젝트 ID가 올바른지 확인

### "Docker is not running" (로컬 사용 시)

- Docker Desktop 실행 후 `supabase start` 재시도

### PowerShell에서 리다이렉션 오류

- `>` 대신 `Out-File` 사용:

  ```powershell
  pnpm supabase gen types typescript --project-id <REF> --schema public | Out-File -FilePath lib/supabase/types.ts -Encoding utf8
  ```

### UTF-8 인코딩

- PowerShell 기본 인코딩이 BOM이면 문제가 될 수 있음
- `-Encoding utf8NoBOM` (PowerShell 6+) 사용:

  ```powershell
  pnpm supabase gen types typescript --project-id <REF> --schema public | Out-File -FilePath lib/supabase/types.ts -Encoding utf8NoBOM
  ```

---

## 요약

| 방법 | 명령 | 조건 |
|------|------|------|
| 원격 | `--project-id <REF>` | 로그인 + 프로젝트 ID |
| 로컬 | `--local` | 로컬 Supabase 실행 중 |
| 연결 | `--linked` | `supabase link` 완료 |

**권장**: `--project-id`로 원격 프로젝트 스키마에서 타입 생성하는 방법 A 사용.
