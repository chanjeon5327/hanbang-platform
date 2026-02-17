# scripts/run-release-exchange-v2.ps1
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function HasNonLatin1([string]$s) {
  foreach ($ch in $s.ToCharArray()) {
    if ([int][char]$ch -gt 255) { return $true }
  }
  return $false
}

try {
  if (-not $env:HB_BASE_URL -or $env:HB_BASE_URL.Trim() -eq "") {
    $env:HB_BASE_URL = "http://localhost:3000"
  }

  $cookie = (Get-Clipboard).ToString().Trim()

  if (-not $cookie -or $cookie.Length -lt 10) {
    Write-Host ""
    Write-Host "ERROR: Clipboard cookie is empty." -ForegroundColor Red
    Write-Host "1) Open Chrome DevTools (F12)" -ForegroundColor Yellow
    Write-Host "2) Network -> click any /api/* request" -ForegroundColor Yellow
    Write-Host "3) Request Headers -> copy ONLY the Cookie VALUE (not 'Cookie:')" -ForegroundColor Yellow
    Write-Host "4) Run again: pnpm release:exchange-v2:auto" -ForegroundColor Yellow
    exit 1
  }

  # If user copied "Cookie: xxx", strip prefix safely
  if ($cookie.ToLower().StartsWith("cookie:")) {
    $cookie = $cookie.Substring(7).Trim()
  }

  # undici requires header values to be latin1(bytestring)
  if (HasNonLatin1 $cookie) {
    Write-Host ""
    Write-Host "ERROR: Cookie contains non-latin1 characters. Re-copy Cookie VALUE only." -ForegroundColor Red
    Write-Host "Tip: copy from DevTools -> Request Headers -> Cookie (value only)." -ForegroundColor Yellow
    exit 1
  }

  $env:HB_COOKIE = $cookie

  if (-not $env:HB_ADMIN_COOKIE -or $env:HB_ADMIN_COOKIE.Trim() -eq "") {
    $env:HB_ADMIN_COOKIE = $env:HB_COOKIE
  }

  # Let node script auto-discover asset id if not provided
  if ($env:HB_ASSET_ID -and (HasNonLatin1 $env:HB_ASSET_ID)) {
    Remove-Item Env:HB_ASSET_ID -ErrorAction SilentlyContinue
  }

  Write-Host ""
  Write-Host "=== Release Gate AUTO ===" -ForegroundColor Cyan
  Write-Host ("BASE_URL : " + $env:HB_BASE_URL)
  if ($env:HB_ASSET_ID) { Write-Host ("ASSET_ID : " + $env:HB_ASSET_ID) } else { Write-Host "ASSET_ID : (auto-discover)" }

  node "scripts/release-exchange-v2.mjs"
  exit $LASTEXITCODE
}
catch {
  Write-Host ""
  Write-Host "=== RELEASE GATE: FAIL ===" -ForegroundColor Red
  Write-Host $_.Exception.Message -ForegroundColor Red
  exit 1
}
