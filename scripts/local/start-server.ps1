# Arranca el sistema en la notebook del mostrador (http://localhost:3000), contra la base de Neon.
# Las fotos de los socios se guardan en LOCAL_PHOTOS_PATH (por defecto C:\GymData\photos).
# Uso:   powershell -ExecutionPolicy Bypass -File scripts\local\start-server.ps1 [-Port 3000] [-Rebuild]
# -Rebuild vuelve a compilar (hace falta después de actualizar el código con git pull).
param(
  [int]$Port = 3000,
  [switch]$Rebuild
)

$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
Set-Location $root

if (-not (Test-Path (Join-Path $root ".env"))) {
  throw "Falta el archivo .env en $root (DATABASE_URL, LOCAL_PHOTOS_PATH, etc.)."
}

$photosDir = "C:\GymData\photos"
foreach ($line in Get-Content (Join-Path $root ".env")) {
  if ($line -match "^\s*LOCAL_PHOTOS_PATH\s*=\s*`"?([^`"]*)`"?\s*$" -and $Matches[1]) { $photosDir = $Matches[1] }
}
New-Item -ItemType Directory -Force -Path $photosDir | Out-Null

if (-not (Test-Path (Join-Path $root "node_modules"))) {
  Write-Host "[servidor] Instalando dependencias..."
  npm ci
  if ($LASTEXITCODE -ne 0) { throw "npm ci falló." }
}

if ($Rebuild -or -not (Test-Path (Join-Path $root ".next\BUILD_ID"))) {
  Write-Host "[servidor] Compilando..."
  npm run build
  if ($LASTEXITCODE -ne 0) { throw "npm run build falló." }
}

Write-Host "[servidor] Iniciando en http://localhost:$Port (fotos en $photosDir)"
npm run start -- -p $Port
