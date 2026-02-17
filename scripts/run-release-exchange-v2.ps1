# ============================================================================
# HANBANG Exchange V2 — Release Gate Auto Launcher (Windows PowerShell)
# ============================================================================
# 사용법:
#   1) 터미널1: pnpm dev
#   2) 브라우저 DevTools > Network > 아무 요청 > Cookie 헤더 값 복사 (Ctrl+C)
#   3) 터미널2: pnpm release:exchange-v2:auto
# ============================================================================

Write-Host ""
Write-Host "=== HANBANG Exchange V2 Release Gate (Auto) ===" -ForegroundColor Cyan
Write-Host ""

# ── 1) Base URL ──
if (-not $env:HB_BASE_URL) {
    $env:HB_BASE_URL = "http://localhost:3000"
}
Write-Host "  BASE_URL: $env:HB_BASE_URL"

# ── 2) Cookie: 클립보드에서 자동 읽기 ──
$clipContent = ""
try {
    $clipContent = Get-Clipboard -ErrorAction SilentlyContinue
} catch {
    $clipContent = ""
}

if ($clipContent -and $clipContent.Trim().Length -gt 10) {
    # Cookie: 접두어 제거
    $cleaned = $clipContent.Trim()
    if ($cleaned -match "^[Cc]ookie\s*:\s*") {
        $cleaned = $cleaned -replace "^[Cc]ookie\s*:\s*", ""
    }
    $env:HB_COOKIE = $cleaned.Trim()
    Write-Host "  COOKIE: (clipboard) $($env:HB_COOKIE.Substring(0, [Math]::Min(30, $env:HB_COOKIE.Length)))..." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "  [ERROR] 클립보드가 비어있거나 Cookie 값이 너무 짧습니다." -ForegroundColor Red
    Write-Host ""
    Write-Host "  사용법:" -ForegroundColor Yellow
    Write-Host "    1) 브라우저에서 로그인" -ForegroundColor Yellow
    Write-Host "    2) DevTools(F12) > Network > 아무 요청 클릭" -ForegroundColor Yellow
    Write-Host "    3) Request Headers > Cookie 값 전체를 Ctrl+C로 복사" -ForegroundColor Yellow
    Write-Host "    4) 이 커맨드를 다시 실행" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# ── 3) Admin Cookie = User Cookie (관리자 아니면 자동 403 -> SKIP) ──
$env:HB_ADMIN_COOKIE = $env:HB_COOKIE

# ── 4) Asset ID: 비움 (스크립트가 자동탐색) ──
$env:HB_ASSET_ID = ""

# ── 5) Supabase (이미 env에 있으면 전달, 없으면 생략) ──
# NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY는 .env에서 자동 로드되거나 이미 설정된 경우만

Write-Host ""
Write-Host "  Running: node scripts/release-exchange-v2.mjs" -ForegroundColor Cyan
Write-Host ""

node scripts/release-exchange-v2.mjs

$exitCode = $LASTEXITCODE
if ($exitCode -eq 0) {
    Write-Host ""
    Write-Host "  === RELEASE GATE: PASS ===" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "  === RELEASE GATE: FAIL ===" -ForegroundColor Red
}

exit $exitCode
