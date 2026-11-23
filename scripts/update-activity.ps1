# Napi frissítés: Claude-használat → data/claude.json → commit + push (GitHub Pages élesíti).
# A Windows Feladatütemező futtatja naponta ("bizaza-devs portfolio activity").
# Kézzel is futtatható:  powershell -ExecutionPolicy Bypass -File scripts\update-activity.ps1
# Csak akkor commitol, ha a napi számok ténylegesen változtak (a "generated" időbélyeg nem számít).
$ErrorActionPreference = "Continue"   # PS 5.1: a git stderr-je ne legyen végzetes hiba; a kilépési kódot nézzük
$root = Split-Path -Parent $PSScriptRoot
$log = Join-Path $env:LOCALAPPDATA "bizaza-portfolio-activity.log"
function Write-Log($msg) { "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  $msg" | Out-File -FilePath $log -Append -Encoding utf8 }

try {
  Set-Location $root
  $json = Join-Path $root "data\claude.json"
  $before = if (Test-Path $json) { (Get-Content $json -Raw -Encoding UTF8 | ConvertFrom-Json).days | ConvertTo-Json -Compress } else { "" }

  $python = (Get-Command python -ErrorAction SilentlyContinue).Source
  if (-not $python -and (Test-Path "C:\Python314\python.exe")) { $python = "C:\Python314\python.exe" }
  if (-not $python) { throw "python nem található" }
  & $python -I (Join-Path $root "scripts\claude_stats.py") | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "claude_stats.py hibával állt le ($LASTEXITCODE)" }

  $after = (Get-Content $json -Raw -Encoding UTF8 | ConvertFrom-Json).days | ConvertTo-Json -Compress
  if ($before -eq $after) {
    git checkout -- data/claude.json   # csak az időbélyeg változott: visszaállítjuk
    Write-Log "nincs új adat"
    exit 0
  }

  git add data/claude.json
  git commit --quiet -m "Activity: daily Claude usage update ($(Get-Date -Format 'yyyy-MM-dd'))"
  if ($LASTEXITCODE -ne 0) { throw "git commit sikertelen ($LASTEXITCODE)" }
  git pull --rebase --quiet origin main   # ha máshonnan is jött commit
  if ($LASTEXITCODE -ne 0) { git rebase --abort; throw "git pull sikertelen ($LASTEXITCODE)" }
  git push --quiet origin main
  if ($LASTEXITCODE -ne 0) { throw "git push sikertelen ($LASTEXITCODE)" }
  Write-Log "frissítve és feltöltve"
} catch {
  Write-Log "HIBA: $($_.Exception.Message)"
  exit 1
}
