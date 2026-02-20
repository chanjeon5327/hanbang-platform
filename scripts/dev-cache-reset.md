# 개발 서버 캐시 초기화 (실행 지침)

## 화면이 안 바뀔 때

### 1. Windows: node 프로세스 종료 → .next 삭제 → pnpm dev 재실행

```powershell
# 1) node 프로세스 종료
taskkill /F /IM node.exe

# 2) .next 폴더 삭제
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# 3) 개발 서버 재실행
pnpm dev
```

### 2. 브라우저 캐시 우회 하드리로드

- **Windows/Linux**: `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`

### 3. NEW_UI_ACTIVE 배지 확인 (선택)

`.env.local`에 `NEXT_PUBLIC_UI_DEBUG=1` 추가 후 서버 재시작 → `/market/[id]` 접속 시 우측 상단에 "NEW_UI_ACTIVE" 배지 표시
