# Generate the CV PDF from cv.html (headless Chrome/Edge).
# Usage (from the repo root):  .\scripts\build-cv.ps1
# Re-run after editing data.js and commit the cv/ folder.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$browser = @(
  "C:\Program Files\Google\Chrome\Application\chrome.exe",
  "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $browser) { throw "Chrome or Edge is not installed." }

$port = 5181
$server = Start-Process python -ArgumentList "-m", "http.server", $port, "--directory", $root -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 2
try {
  New-Item -ItemType Directory -Force (Join-Path $root "cv") | Out-Null
  $jobs = @(
    @{ lang = "en"; out = "cv\Zalan-Birtalan-CV.pdf" }
  )
  foreach ($j in $jobs) {
    $out = Join-Path $root $j.out
    # the browser logs to stderr; that is not an error, hence Start-Process -Wait
    $args = @("--headless=new", "--disable-gpu", "--no-pdf-header-footer", "--virtual-time-budget=6000",
              "--print-to-pdf=`"$out`"", "http://localhost:$port/cv.html?lang=$($j.lang)")
    Start-Process $browser -ArgumentList $args -Wait -WindowStyle Hidden
    Write-Host "done: $($j.out) ($([math]::Round((Get-Item $out).Length / 1KB)) KB)"
  }
} finally {
  Stop-Process -Id $server.Id -Force
}
