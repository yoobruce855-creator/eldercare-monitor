# ===== ElderCare Monitor 백업 스크립트 (PowerShell) =====

# 백업 설정
$ProjectDir = $PSScriptRoot
$BackupBaseDir = Join-Path $ProjectDir "backups"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupName = "backup_$Timestamp"
$BackupPath = Join-Path $BackupBaseDir $BackupName

Write-Host "🔄 백업 시작...`n" -ForegroundColor Cyan

# 백업 디렉토리 생성
if (-not (Test-Path $BackupBaseDir)) {
    New-Item -ItemType Directory -Path $BackupBaseDir | Out-Null
}

Write-Host "📁 백업 위치: $BackupPath`n" -ForegroundColor Yellow

# 제외할 항목
$ExcludeItems = @('node_modules', 'backups', '.git')

# 파일 복사 함수
function Copy-ProjectFiles {
    param (
        [string]$Source,
        [string]$Destination
    )
    
    if (-not (Test-Path $Destination)) {
        New-Item -ItemType Directory -Path $Destination | Out-Null
    }
    
    Get-ChildItem -Path $Source | ForEach-Object {
        $itemName = $_.Name
        
        # 제외 항목 체크
        if ($ExcludeItems -contains $itemName) {
            return
        }
        
        $destPath = Join-Path $Destination $itemName
        
        if ($_.PSIsContainer) {
            # 디렉토리면 재귀 복사
            Copy-ProjectFiles -Source $_.FullName -Destination $destPath
        } else {
            # 파일 복사
            Copy-Item -Path $_.FullName -Destination $destPath -Force
        }
    }
}

# 백업 실행
Write-Host "📋 파일 복사 중..." -ForegroundColor Green
Copy-ProjectFiles -Source $ProjectDir -Destination $BackupPath

# 백업 정보 생성
$BackupInfo = @{
    timestamp = Get-Date -Format "o"
    backupName = $BackupName
    projectPath = $ProjectDir
    fileCount = (Get-ChildItem -Path $BackupPath -Recurse -File).Count
    totalSize = (Get-ChildItem -Path $BackupPath -Recurse -File | Measure-Object -Property Length -Sum).Sum
}

$BackupInfoJson = $BackupInfo | ConvertTo-Json -Depth 10
$BackupInfoPath = Join-Path $BackupPath "BACKUP_INFO.json"
$BackupInfoJson | Out-File -FilePath $BackupInfoPath -Encoding UTF8

Write-Host "`n✅ 백업 완료!`n" -ForegroundColor Green

# 통계 출력
Write-Host "📊 백업 통계:" -ForegroundColor Cyan
Write-Host "   총 파일 수: $($BackupInfo.fileCount)" -ForegroundColor White
Write-Host "   총 크기: $([math]::Round($BackupInfo.totalSize / 1KB, 2)) KB" -ForegroundColor White
Write-Host "   백업 시간: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor White
Write-Host ""

# 백업 목록 업데이트
$BackupListPath = Join-Path $BackupBaseDir "BACKUP_LIST.md"
$Backups = Get-ChildItem -Path $BackupBaseDir -Directory | ForEach-Object {
    $infoPath = Join-Path $_.FullName "BACKUP_INFO.json"
    if (Test-Path $infoPath) {
        $info = Get-Content $infoPath | ConvertFrom-Json
        [PSCustomObject]@{
            Name = $_.Name
            Timestamp = $info.timestamp
            FileCount = $info.fileCount
            Size = $info.totalSize
            Path = $_.FullName
        }
    }
} | Sort-Object Timestamp -Descending

$BackupListContent = "# 📦 백업 목록`n`n"
$BackupListContent += "총 백업 개수: $($Backups.Count)`n`n"
$BackupListContent += "| 백업 이름 | 날짜/시간 | 파일 수 | 크기 |`n"
$BackupListContent += "|----------|----------|---------|------|`n"

foreach ($backup in $Backups) {
    $date = (Get-Date $backup.Timestamp).ToString("yyyy-MM-dd HH:mm:ss")
    $size = [math]::Round($backup.Size / 1KB, 2)
    $BackupListContent += "| $($backup.Name) | $date | $($backup.FileCount) | $size KB |`n"
}

$BackupListContent += "`n## 📝 백업 복원 방법`n`n"
$BackupListContent += "``````powershell`n"
$BackupListContent += "# 백업 폴더의 내용을 프로젝트 루트로 복사`n"
$BackupListContent += "Copy-Item -Path 'backups\[백업폴더명]\*' -Destination '.' -Recurse -Force`n"
$BackupListContent += "``````n"

$BackupListContent | Out-File -FilePath $BackupListPath -Encoding UTF8

# 오래된 백업 정리 (10개 이상 유지 안 함)
$KeepCount = 10
if ($Backups.Count -gt $KeepCount) {
    Write-Host "🗑️  오래된 백업 삭제 중... ($($Backups.Count - $KeepCount)개)`n" -ForegroundColor Yellow
    
    $Backups | Select-Object -Skip $KeepCount | ForEach-Object {
        Write-Host "   삭제: $($_.Name)" -ForegroundColor Gray
        Remove-Item -Path $_.Path -Recurse -Force
    }
    
    Write-Host "`n✅ 정리 완료`n" -ForegroundColor Green
}

# 복원 방법 안내
Write-Host "💡 백업 복원 방법:" -ForegroundColor Cyan
Write-Host "   Copy-Item -Path '$BackupPath\*' -Destination '$ProjectDir' -Recurse -Force" -ForegroundColor White
Write-Host ""
Write-Host "📋 백업 목록 확인:" -ForegroundColor Cyan
Write-Host "   Get-Content '$BackupListPath'" -ForegroundColor White
Write-Host ""
Write-Host "🎉 백업이 안전하게 저장되었습니다!" -ForegroundColor Green
