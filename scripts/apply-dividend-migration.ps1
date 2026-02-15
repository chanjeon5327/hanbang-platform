# HANBANG MIGRATION APPLY — dividend_engine
# Windows PowerShell

$ErrorActionPreference = "Continue"

Write-Host "1) 파일 존재 확인: supabase/migrations/20260316_dividend_engine.sql"
if (Test-Path "supabase/migrations/20260316_dividend_engine.sql") {
  Write-Host "   OK - 파일 존재"
} else {
  Write-Host "   FAIL - 파일 없음"
  exit 1
}

Write-Host "`n2) Supabase CLI 확인"
try {
  $v = supabase --version 2>&1
  Write-Host "   OK - $v"
} catch {
  Write-Host "   Supabase CLI 미설치. 설치 후 재실행:"
  Write-Host "   winget install Supabase.CLI"
  Write-Host "   또는: scoop install supabase"
  exit 1
}

Write-Host "`n3) 마이그레이션 적용"
Set-Location $PSScriptRoot\..

# (A) 로컬: supabase migration up
# (B) 원격: supabase db push
supabase migration up 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host "   migration up 실패, db push 시도..."
  supabase db push 2>&1
}

Write-Host "`n4) 검증 SQL (Supabase Dashboard SQL Editor에서 실행):"
Write-Host @"
select to_regclass('public.dividends') as dividends,
       to_regclass('public.dividend_distributions') as dividend_distributions,
       to_regclass('public.positions_snapshot') as positions_snapshot;

select routine_name from information_schema.routines
where routine_name in ('rpc_calculate_dividend','rpc_execute_dividend');
"@
