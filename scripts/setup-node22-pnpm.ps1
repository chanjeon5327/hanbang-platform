# Node 22 LTS + pnpm 설정 스크립트
# 사용법: 관리자 권한 PowerShell에서 실행

# === 1~5단계는 수동으로 수행 ===
# 1. Cursor, VSCode, 모든 터미널 완전 종료
# 2. taskkill /F /IM node.exe (이미 수행됨)
# 3. Node 버전 확인: node -v (현재 v24.13.0)
# 4. nvm-windows 설치 후 Node 22 설정:
#    - https://github.com/coreybutler/nvm-windows/releases 에서 nvm-setup.exe 다운로드
#    - 설치 후 새 터미널에서: nvm install 22  →  nvm use 22
# 5. 컴퓨터 재부팅

# === 6~10단계 (재부팅 후 프로젝트 폴더에서 실행) ===
$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

Write-Host "=== 6. node_modules, package-lock.json, pnpm-lock.yaml 삭제 ===" -ForegroundColor Cyan
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force node_modules
    Write-Host "node_modules 삭제 완료"
}
if (Test-Path "package-lock.json") {
    Remove-Item -Force package-lock.json
    Write-Host "package-lock.json 삭제 완료"
}
if (Test-Path "pnpm-lock.yaml") {
    Remove-Item -Force pnpm-lock.yaml
    Write-Host "pnpm-lock.yaml 삭제 완료"
}

Write-Host "`n=== 7. pnpm 글로벌 설치 ===" -ForegroundColor Cyan
npm install -g pnpm

Write-Host "`n=== 8. pnpm install ===" -ForegroundColor Cyan
pnpm install

Write-Host "`n=== 9~10. pnpm dev 실행 (종료: Ctrl+C) ===" -ForegroundColor Cyan
Write-Host "서버가 준비되면 마지막 20줄이 터미널에 표시됩니다.`n" -ForegroundColor Yellow
pnpm dev
