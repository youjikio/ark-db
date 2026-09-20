# Build: data\ark_maps.json  ->  data\ark_maps.js  (for the HTML viewer)
# Usage:  D:\Users\youji\Desktop\Claude\ARK\build.ps1
# Run this every time you edit data\ark_maps.json.
# NOTE: kept ASCII-only on purpose. PowerShell 5.1 reads .ps1 as ANSI,
#       so Japanese text inside a BOM-less script breaks the parser.

$root = $PSScriptRoot
if (-not $root) { $root = 'D:\Users\youji\Desktop\Claude\ARK' }
$enc = New-Object System.Text.UTF8Encoding($false)

$jobs = @(
  @{ src = 'data\ark_maps.json';   dst = 'data\ark_maps.js';   var = 'window.ARK_DATA' },
  @{ src = 'data\ark_spawns.json'; dst = 'data\ark_spawns.js'; var = 'window.ARK_SPAWNS' },
  @{ src = 'data\ark_creatures.json'; dst = 'data\ark_creatures.js'; var = 'window.ARK_CREATURES' },
  @{ src = 'data\ark_systems.json'; dst = 'data\ark_systems.js'; var = 'window.ARK_SYS' },
  @{ src = 'data\ark_resource_nodes.json'; dst = 'data\ark_resource_nodes.js'; var = 'window.ARK_NODES' },
  @{ src = 'data\ark_items.json'; dst = 'data\ark_items.js'; var = 'window.ARK_ITEMS' },
  @{ src = 'data\ark_engrams.json'; dst = 'data\ark_engrams.js'; var = 'window.ARK_ENGRAMS' }
)

foreach ($j in $jobs) {
  $src = Join-Path $root $j.src
  $dst = Join-Path $root $j.dst
  if (-not (Test-Path $src)) { Write-Host "NOT FOUND: $src" -ForegroundColor Red; exit 1 }

  # Read as UTF-8 (Get-Content -Raw misreads Japanese as ANSI)
  $json = [System.IO.File]::ReadAllText($src, [System.Text.Encoding]::UTF8)

  # Validate JSON
  try { $null = ConvertFrom-Json -InputObject $json -ErrorAction Stop }
  catch { Write-Host "JSON ERR in $($j.src): $($_.Exception.Message)" -ForegroundColor Red; exit 1 }

  # Write as UTF-8 without BOM
  [System.IO.File]::WriteAllText($dst, ($j.var + ' = ' + $json + ';'), $enc)
  Write-Host "OK  $($j.src) -> $($j.dst)  ($((Get-Item $dst).Length) bytes)" -ForegroundColor Green
}
Write-Host 'build done.' -ForegroundColor Cyan
