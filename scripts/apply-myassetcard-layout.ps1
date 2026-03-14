# MyAssetCard.tsx 로그인 상태 섹션 레이아웃 교체 스크립트
# 사용법: .\scripts\apply-myassetcard-layout.ps1

$filePath = Join-Path $PSScriptRoot "..\components\home\MyAssetCard.tsx"
$content = Get-Content -Path $filePath -Raw -Encoding UTF8

$oldPattern = @'
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
'@

$newContent = @'
        ) : (
          <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2 py-2">
            {/* 좌측: 내 자산 + 총 자산 */}
            <div className="flex items-baseline gap-3 min-w-0">
              <span className="text-[11px] text-black/50 shrink-0">내 자산</span>
              {loading ? (
                <div className="h-7 w-24 animate-pulse rounded bg-black/5" />
              ) : (
                <span className="text-xl sm:text-2xl font-extrabold tabular-nums tracking-tight text-black/90 truncate">
                  {formatKRW(summary?.totalAssets ?? 0)}
                </span>
              )}
            </div>

            {/* 가운데: 상품 자산 / 현금 자산 보조 */}
            {!loading && summary && (
              <div className="flex items-center gap-4 sm:gap-6 sm:border-l sm:border-black/10 sm:pl-6">
                <div>
                  <div className="text-[10px] text-black/40 uppercase tracking-wide">상품</div>
                  <div className="text-[13px] font-extrabold tabular-nums text-black/75">
                    {formatKRW(summary.holdingsValue)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-black/40 uppercase tracking-wide">현금</div>
                  <div className="text-[13px] font-extrabold tabular-nums text-black/75">
                    {formatKRW(summary.cashBalance)}
                  </div>
                </div>
              </div>
            )}

            {/* 우측: 레벨 배지 */}
            {summary && !loading && (
              <div className="flex items-center gap-1.5 shrink-0 rounded-full border border-black/10 bg-black/[0.02] px-2.5 py-1.5 sm:ml-auto">
                <span className="text-lg" title={LEVEL_CONFIG[getLevelFromTotalAssets(summary.totalAssets) - 1].label} aria-hidden>
                  {LEVEL_CONFIG[getLevelFromTotalAssets(summary.totalAssets) - 1].icon}
                </span>
                <span className="text-[11px] font-bold text-black/70">
                  LV.{getLevelFromTotalAssets(summary.totalAssets)}
                </span>
              </div>
            )}

            {/* 지갑 보기 버튼 */}
            <Link
              href="/wallet"
              className="shrink-0 px-4 py-2 rounded-lg text-[13px] font-semibold text-[#2563EB] hover:bg-[#2563EB]/10 border border-[#2563EB]/30 transition"
            >
              지갑 보기
            </Link>
          </div>
        )}
'@

# 기존 로그인 블록 전체를 정규식으로 찾아 교체
# ) : ( 부터 다음 )} 까지 (닫는 괄호 전)
$regex = '(?s)\) : \(\s*<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">.*?\)\s*\}\s*\)'
$replacement = $newContent

if ($content -match $regex) {
  $newFileContent = $content -replace $regex, $replacement
  Set-Content -Path $filePath -Value $newFileContent -Encoding UTF8 -NoNewline
  Write-Host "MyAssetCard.tsx 로그인 섹션이 새 레이아웃으로 교체되었습니다." -ForegroundColor Green
} else {
  Write-Host "대체할 기존 패턴을 찾을 수 없습니다. 파일이 이미 새 레이아웃을 사용 중일 수 있습니다." -ForegroundColor Yellow
  Write-Host "현재 로그인 블록의 첫 줄:" -ForegroundColor Gray
  if ($content -match '(?s)\) : \(.*?<div className="([^"]+)"') {
    Write-Host "  className=`"$($Matches[1])`"" -ForegroundColor Gray
  }
}
