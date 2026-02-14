# 스모크 테스트: /api/ping, /api/metrics/live, /api/debug/build
# 사용: .\scripts\smoke-prod.ps1
# 또는: $env:SMOKE_BASE_URL="https://your-app.vercel.app"; .\scripts\smoke-prod.ps1

$base = if ($env:SMOKE_BASE_URL) { $env:SMOKE_BASE_URL.TrimEnd('/') } else { "http://localhost:3000" }
Write-Host "=== Smoke Test: $base ===" -ForegroundColor Cyan

$endpoints = @(
  "/api/ping",
  "/api/metrics/live",
  "/api/debug/build"
)

foreach ($path in $endpoints) {
  $url = "$base$path"
  Write-Host "`n--- GET $url ---" -ForegroundColor Yellow
  try {
    $r = curl.exe -s -w "`n[HTTP %{http_code}]" "$url"
    Write-Host $r
  } catch {
    Write-Host "Error: $_" -ForegroundColor Red
  }
}

Write-Host "`n=== Done ===" -ForegroundColor Cyan
