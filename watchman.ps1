param(
  [string]$BaseUrl = $env:WATCH_BASE_URL
)

if ([string]::IsNullOrWhiteSpace($BaseUrl)) {
  Write-Host "WATCH_BASE_URL not set" -ForegroundColor Red
  exit 1
}

Write-Host "=== HANBANG WATCHMAN ==="
Write-Host "BaseUrl: $BaseUrl"

# 1) Health check
$healthOk = $false
try {
  $health = Invoke-RestMethod "$BaseUrl/api/health" -TimeoutSec 15
  if ($health.ok -eq $true) { $healthOk = $true }
} catch {
  $healthOk = $false
}

# 2) E2E run
$e2eOk = $false
$e2eOut = ""
try {
  $env:WATCH_BASE_URL = $BaseUrl
  $e2eOut = (pnpm exec playwright test e2e --reporter=list 2>&1 | Out-String)
  if ($LASTEXITCODE -eq 0) { $e2eOk = $true }
} catch {
  $e2eOk = $false
}

# 3) Summary
$stamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$status = if ($healthOk -and $e2eOk) { "✅ OK" } else { "🚨 FAIL" }

$summary = @()
$summary += "HANBANG 파수꾼 수동점검"
$summary += "시간: $stamp"
$summary += "Base: $BaseUrl"
$summary += "Health: " + ($(if($healthOk){"OK"}else{"FAIL"}))
$summary += "E2E: " + ($(if($e2eOk){"OK"}else{"FAIL"}))

# 4) Telegram notify (optional)
if ($env:TELEGRAM_BOT_TOKEN -and $env:TELEGRAM_CHAT_ID) {
  try {
    $text = ($summary -join "`n")
    if (-not $e2eOk) {
      $tail = ($e2eOut -split "`n" | Select-Object -Last 30) -join "`n"
      $text = $text + "`n`n--- E2E tail ---`n" + $tail
    }
    Invoke-RestMethod -Method Post -Uri "https://api.telegram.org/bot$($env:TELEGRAM_BOT_TOKEN)/sendMessage" `
      -Body @{ chat_id = $env:TELEGRAM_CHAT_ID; text = $text } | Out-Null
    Write-Host "Telegram sent."
  } catch {
    Write-Host "Telegram send failed: $($_.Exception.Message)" -ForegroundColor Yellow
  }
} else {
  Write-Host "Telegram env not set. (skip notify)"
}

Write-Host ""
Write-Host ($summary -join "`n")
if (-not $e2eOk) {
  Write-Host ""
  Write-Host "---- E2E OUTPUT (tail) ----"
  ($e2eOut -split "`n" | Select-Object -Last 60) -join "`n"
  exit 1
}
exit 0
