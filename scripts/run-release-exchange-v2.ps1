# scripts/run-release-exchange-v2.ps1
# Release Gate auto launcher (PS5.1 safe)
# - Auto-detect port (3000/3001) via /api/debug/build
# - Cookie source priority:
#   (1) env:HB_COOKIE
#   (2) clipboard raw
#   (3) prompt paste once
#   (4) if still invalid AND HB_EMAIL/HB_PASSWORD set -> auto login to /api/auth/login and build Cookie from Set-Cookie
# - Accept Supabase chunked cookies: sb-*-auth-token.0 / .1

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function HasNonLatin1([string]$s) {
  foreach ($ch in $s.ToCharArray()) { if ([int][char]$ch -gt 255) { return $true } }
  return $false
}

function TestPort([int]$port) {
  try {
    $r = Invoke-WebRequest -Uri "http://localhost:$port/api/debug/build" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    return ($r.StatusCode -eq 200)
  } catch { return $false }
}

function DetectBaseUrl() {
  if (TestPort 3000) { return "http://localhost:3000" }
  if (TestPort 3001) { return "http://localhost:3001" }
  return "http://localhost:3000"
}

function SanitizeCookie([string]$s) {
  if ($null -eq $s) { return "" }
  $t = $s.Trim()
  $t = ($t -replace '^\s*Cookie\s*:\s*', '').Trim()
  $t = ($t -replace "(\r|\n)+", " ").Trim()
  return $t
}

function LooksLikeCommand([string]$s) {
  if ([string]::IsNullOrWhiteSpace($s)) { return $true }
  $x = $s.Trim().ToLowerInvariant()
  if ($x.StartsWith("#")) { return $true }
  if ($x.Contains("pnpm ") -or $x.Contains("npm ") -or $x.Contains("git ")) { return $true }
  if ($x.Contains("http://") -or $x.Contains("https://")) { return $true }
  if ($x.Contains("<") -or $x.Contains(">")) { return $true }
  if ($x.Length -lt 20) { return $true }
  return $false
}

function IsLikelySupabaseCookie([string]$cookie) {
  $re = 'sb-[a-z0-9]+-auth-token(\.\d+)?='
  if ($cookie -match $re) { return $true }
  if ($cookie -match 'sb-access-token=') { return $true }
  return $false
}

function JoinSetCookieToCookieHeader($setCookies) {
  if ($null -eq $setCookies) { return "" }
  $pairs = @()
  foreach ($sc in $setCookies) {
    if ([string]::IsNullOrWhiteSpace($sc)) { continue }
    $p = $sc.Split(';')[0].Trim()
    if ($p.Length -gt 0) { $pairs += $p }
  }
  return ($pairs -join "; ")
}

function TryAutoLogin([string]$baseUrl) {
  if ([string]::IsNullOrWhiteSpace($env:HB_EMAIL) -or [string]::IsNullOrWhiteSpace($env:HB_PASSWORD)) { return "" }
  try {
    $body = @{ email = $env:HB_EMAIL; password = $env:HB_PASSWORD } | ConvertTo-Json
    $resp = Invoke-WebRequest -Uri "$baseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body $body -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
    $setCookie = $resp.Headers["Set-Cookie"]
    $cookie = JoinSetCookieToCookieHeader $setCookie
    return (SanitizeCookie $cookie)
  } catch {
    return ""
  }
}

function GetCookieValue([string]$baseUrl) {
  # 1) env
  if ($env:HB_COOKIE) {
    $c = SanitizeCookie $env:HB_COOKIE
    if (-not (LooksLikeCommand $c)) { return $c }
  }

  # 2) clipboard raw
  $clip = ""
  try { $clip = Get-Clipboard -Raw } catch { $clip = "" }
  $clip = SanitizeCookie $clip
  if (-not (LooksLikeCommand $clip)) { return $clip }

  # 3) auto login (before prompt, so no user interaction needed if creds exist)
  $auto = TryAutoLogin $baseUrl
  if (-not [string]::IsNullOrWhiteSpace($auto) -and (IsLikelySupabaseCookie $auto)) {
    Write-Host "[AUTO-LOGIN] Logged in as $($env:HB_EMAIL) via /api/auth/login" -ForegroundColor Green
    return $auto
  }

  # 4) prompt (one-shot)
  Write-Host ""
  Write-Host "[INPUT] Clipboard is not a Cookie value." -ForegroundColor Yellow
  Write-Host "Paste Cookie VALUE only (no 'Cookie:' prefix), then Enter." -ForegroundColor Yellow
  $p = Read-Host "Cookie"
  $p = SanitizeCookie $p
  if (-not (LooksLikeCommand $p)) { return $p }

  return ""
}

try {
  $baseUrl = DetectBaseUrl
  $cookie = GetCookieValue $baseUrl

  if (HasNonLatin1 $cookie) {
    Write-Host "=== RELEASE GATE: FAIL (launcher) ===" -ForegroundColor Red
    Write-Host "Cookie contains non-Latin1 characters." -ForegroundColor Red
    exit 1
  }

  if (LooksLikeCommand $cookie) {
    Write-Host "=== RELEASE GATE: FAIL (launcher) ===" -ForegroundColor Red
    Write-Host "Cookie still looks like command/text." -ForegroundColor Red
    Write-Host "Fix: set HB_EMAIL/HB_PASSWORD or copy Cookie VALUE from DevTools Network request headers." -ForegroundColor Yellow
    exit 1
  }

  if (-not (IsLikelySupabaseCookie $cookie)) {
    # try auto-login once more if creds exist
    $auto2 = TryAutoLogin $baseUrl
    if (-not [string]::IsNullOrWhiteSpace($auto2) -and (IsLikelySupabaseCookie $auto2)) {
      $cookie = $auto2
    } else {
      Write-Host "=== RELEASE GATE: FAIL (launcher) ===" -ForegroundColor Red
      Write-Host "Cookie missing Supabase auth keys (sb-*-auth-token[.0/.1]=...)." -ForegroundColor Red
      Write-Host "Tip: set HB_EMAIL/HB_PASSWORD to auto-login OR copy Cookie VALUE from DevTools." -ForegroundColor Yellow
      exit 1
    }
  }

  $env:HB_BASE_URL = $baseUrl
  $env:HB_COOKIE   = $cookie
  if (-not $env:HB_ADMIN_COOKIE) { $env:HB_ADMIN_COOKIE = "" }

  $previewLen = [Math]::Min(30, $cookie.Length)
  $preview = $cookie.Substring(0, $previewLen)

  Write-Host ""
  Write-Host "=== Release Gate AUTO ===" -ForegroundColor Cyan
  Write-Host ("BASE_URL : {0}" -f $baseUrl)
  Write-Host ("COOKIE   : {0}..." -f $preview)
  Write-Host ("ASSET_ID : {0}" -f ($(if ($env:HB_ASSET_ID) { $env:HB_ASSET_ID } else { "(auto-discover)" })))
  Write-Host ""

  node scripts/release-exchange-v2.mjs
  exit $LASTEXITCODE
} catch {
  Write-Host "=== RELEASE GATE: FAIL (launcher) ===" -ForegroundColor Red
  Write-Host $_.Exception.Message -ForegroundColor Red
  exit 1
}
