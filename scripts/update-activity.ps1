# Daily update: Claude usage → data/claude.json → commit + push (GitHub Pages deploys it).
# Run daily by Windows Task Scheduler ("bizaza-devs portfolio activity").
# Can also be run by hand:  powershell -ExecutionPolicy Bypass -File scripts\update-activity.ps1
# Commits only when the daily counts actually changed (the "generated" timestamp is ignored).
$ErrorActionPreference = "Continue"   # PS 5.1: git stderr must not be fatal; we check the exit code instead
$root = Split-Path -Parent $PSScriptRoot
$log = Join-Path $env:LOCALAPPDATA "bizaza-portfolio-activity.log"
function Write-Log($msg) { "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  $msg" | Out-File -FilePath $log -Append -Encoding utf8 }

try {
  Set-Location $root
  $json = Join-Path $root "data\claude.json"
  $before = if (Test-Path $json) { (Get-Content $json -Raw -Encoding UTF8 | ConvertFrom-Json).days | ConvertTo-Json -Compress } else { "" }

  $python = (Get-Command python -ErrorAction SilentlyContinue).Source
  if (-not $python -and (Test-Path "C:\Python314\python.exe")) { $python = "C:\Python314\python.exe" }
  if (-not $python) { throw "python not found" }
  & $python -I (Join-Path $root "scripts\claude_stats.py") | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "claude_stats.py failed ($LASTEXITCODE)" }

  $after = (Get-Content $json -Raw -Encoding UTF8 | ConvertFrom-Json).days | ConvertTo-Json -Compress
  if ($before -eq $after) {
    git checkout -- data/claude.json   # only the timestamp changed: revert it
    Write-Log "no new data"
    exit 0
  }

  git add data/claude.json
  git commit --quiet -m "Activity: daily Claude usage update ($(Get-Date -Format 'yyyy-MM-dd'))"
  if ($LASTEXITCODE -ne 0) { throw "git commit failed ($LASTEXITCODE)" }
  git pull --rebase --quiet origin main   # in case commits arrived from elsewhere
  if ($LASTEXITCODE -ne 0) { git rebase --abort; throw "git pull failed ($LASTEXITCODE)" }
  git push --quiet origin main
  if ($LASTEXITCODE -ne 0) { throw "git push failed ($LASTEXITCODE)" }
  Write-Log "updated and pushed"
} catch {
  Write-Log "ERROR: $($_.Exception.Message)"
  exit 1
}
