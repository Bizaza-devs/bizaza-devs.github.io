# Önéletrajz PDF-ek generálása a cv.html-ből (headless Chrome/Edge).
# Használat (a repó gyökerében):  .\scripts\build-cv.ps1
# A data.js módosítása után futtasd újra, és commitold a cv/ mappát.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$browser = @(
  "C:\Program Files\Google\Chrome\Application\chrome.exe",
  "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $browser) { throw "Nincs Chrome vagy Edge telepítve." }

$port = 5181
$server = Start-Process python -ArgumentList "-m", "http.server", $port, "--directory", $root -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 2
try {
  New-Item -ItemType Directory -Force (Join-Path $root "cv") | Out-Null
  $jobs = @(
    @{ lang = "en"; out = "cv\Zalan-Birtalan-CV.pdf" },
    @{ lang = "hu"; out = "cv\Birtalan-Zalan-oneletrajz.pdf" }
  )
  foreach ($j in $jobs) {
    $out = Join-Path $root $j.out
    # a böngésző a stderr-re naplóz; ez nem hiba, ezért a Start-Process -Wait fut
    $args = @("--headless=new", "--disable-gpu", "--no-pdf-header-footer", "--virtual-time-budget=6000",
              "--print-to-pdf=`"$out`"", "http://localhost:$port/cv.html?lang=$($j.lang)")
    Start-Process $browser -ArgumentList $args -Wait -WindowStyle Hidden
    Write-Host "kész: $($j.out) ($([math]::Round((Get-Item $out).Length / 1KB)) KB)"
  }
} finally {
  Stop-Process -Id $server.Id -Force
}
