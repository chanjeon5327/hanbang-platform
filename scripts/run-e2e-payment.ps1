# E2E 결제 플로우 실행
# .env.local에서 환경변수 로드 후 스크립트 실행
$envFile = Join-Path (Split-Path $PSScriptRoot -Parent) ".env.local"
if (Test-Path $envFile) {
  Get-Content $envFile | ForEach-Object {
    if ($_ -match '^([^#=]+)=(.*)$') {
      $key = $matches[1].Trim()
      $val = $matches[2].Trim()
      [System.Environment]::SetEnvironmentVariable($key, $val, 'Process')
    }
  }
}
node (Join-Path $PSScriptRoot "e2e-payment-flow.mjs")
