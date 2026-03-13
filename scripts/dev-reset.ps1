# scripts/dev-reset.ps1
# PS5.1 safe: kill listeners on 3000/3001, remove .next/dev/lock, optional supabase db push
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-ListeningPids([int]$port) {
  [System.Collections.ArrayList]$result = @()

  # 1) Prefer Get-NetTCPConnection (more reliable)
  try {
    $conns = Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction Stop
    foreach ($c in $conns) {
      $op = $c.OwningProcess
      if ($op -gt 0 -and -not $result.Contains($op)) { [void]$result.Add($op) }
    }
  } catch {
    # 2) Fallback netstat parsing (locale-tolerant)
    try {
      $lines = netstat -ano 2>$null | Select-String ":$port " | Select-String "LISTEN|LISTENING"
      foreach ($line in $lines) {
        $parts = ($line.ToString().Trim() -split '\s+')
        $last = $parts[-1]
        if ($last -match '^\d+$') {
          $val = [int]$last
          if ($val -gt 0 -and -not $result.Contains($val)) { [void]$result.Add($val) }
        }
      }
    } catch {}
  }

  return ,$result
}

function Kill-SinglePid([int]$targetPid) {
  $name = "unknown"
  try {
    $p = Get-Process -Id $targetPid -ErrorAction SilentlyContinue
    if ($p) { $name = $p.ProcessName }
  } catch {}

  $killed = $false
  try {
    Stop-Process -Id $targetPid -Force -ErrorAction Stop
    $killed = $true
  } catch {
    try {
      cmd /c "taskkill /PID $targetPid /F >NUL 2>NUL" | Out-Null
      $killed = $true
    } catch {}
  }

  return @{ targetPid = $targetPid; name = $name; killed = $killed }
}

Write-Host ""
Write-Host "=== HANBANG dev-reset ===" -ForegroundColor Cyan

[System.Collections.ArrayList]$killedAll = @()

foreach ($port in @(3000, 3001)) {
  $pids = Get-ListeningPids $port

  if ($null -eq $pids -or $pids.Count -eq 0) {
    Write-Host ("No listeners on port {0}." -f $port) -ForegroundColor DarkYellow
    continue
  }

  foreach ($procId in $pids) {
    if ($null -ne $procId -and $procId -gt 0) {
      $r = Kill-SinglePid $procId
      if ($r.killed) {
        [void]$killedAll.Add(("{0}({1}:{2})" -f $r.targetPid, $r.name, $port))
      } else {
        Write-Host ("WARN: Failed to kill PID {0} on port {1}" -f $procId, $port) -ForegroundColor Yellow
      }
    }
  }
}

if ($killedAll.Count -gt 0) {
  Write-Host ("Killed: " + ($killedAll -join ", ")) -ForegroundColor Green
} else {
  Write-Host "No processes killed." -ForegroundColor DarkYellow
}

# repo root
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")

# lock paths (PS5.1 safe — no multi-arg Join-Path)
# .next/dev/lock — Next.js dev server lock
# .next/lock — some Next versions use root-level lock
$lockPaths = @(
  [System.IO.Path]::Combine($repoRoot.Path, ".next", "dev", "lock"),
  [System.IO.Path]::Combine($repoRoot.Path, ".next", "lock")
)

foreach ($lockPath in $lockPaths) {
  if (Test-Path $lockPath) {
    try {
      Remove-Item $lockPath -Force -ErrorAction Stop
      Write-Host ("Removed lock: " + $lockPath) -ForegroundColor Green
    } catch {
      Write-Host ("WARN: Failed to remove lock: " + $lockPath) -ForegroundColor Yellow
    }
  } else {
    Write-Host ("No lock at: " + $lockPath) -ForegroundColor DarkGray
  }
}

# After-kill check (prints remaining listener if any)
$remain = Get-ListeningPids 3000
if ($null -ne $remain -and $remain.Count -gt 0) {
  Write-Host ("STILL LISTENING on 3000: PID=" + ($remain -join ",")) -ForegroundColor Red
  Write-Host "Force-kill with: taskkill /PID <PID> /F" -ForegroundColor Red
}

if ($env:HB_DB_PUSH -eq "1") {
  Write-Host "HB_DB_PUSH=1 -> Running: npx supabase db push" -ForegroundColor Cyan
  npx supabase db push
}

Write-Host ""
Write-Host "Next:" -ForegroundColor Cyan
Write-Host "  1) pnpm dev" -ForegroundColor White
Write-Host "  2) Wait for 'Ready in X.Xs' before opening browser" -ForegroundColor White
Write-Host "  3) Verify: / /opengraph-image /twitter-image /icon" -ForegroundColor White
