$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$ApiDir = "src/app/api"
$StashDir = Join-Path $Root ".capacitor-api-stash"

if (-not (Test-Path $ApiDir)) {
    Write-Error "No existe $ApiDir"
}

Write-Host "Moviendo API fuera del arbol para export estatico..."
if (Test-Path $StashDir) { Remove-Item -Recurse -Force $StashDir }
Move-Item $ApiDir $StashDir

try {
    $env:CAPACITOR_STATIC = "1"
    npm run build
    Write-Host "Sincronizando Capacitor (android)..."
    npx cap sync android
    Write-Host "Listo."
}
finally {
    if ((Test-Path $StashDir) -and -not (Test-Path $ApiDir)) {
        Write-Host "Restaurando src/app/api..."
        Move-Item $StashDir $ApiDir
    }
}
