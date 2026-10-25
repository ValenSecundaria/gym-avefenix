# Backup diario de la base (Neon) y de las fotos de socios.
# Uso:   powershell -ExecutionPolicy Bypass -File scripts\backup\backup-db.ps1
# Lee DATABASE_URL y LOCAL_PHOTOS_PATH del .env del proyecto (o de variables de entorno).
# Deja en $BackupDir:  db-AAAAMMDD-HHmm.dump  (formato custom de pg_dump)  y  fotos-AAAAMMDD-HHmm.zip
# Borra automáticamente los backups con más de $KeepDays días.
param(
  [string]$EnvFile = (Join-Path $PSScriptRoot "..\..\.env"),
  [string]$BackupDir = "C:\GymData\backups",
  [int]$KeepDays = 30
)

$ErrorActionPreference = "Stop"

function Read-EnvValue([string]$name) {
  $fromEnv = [Environment]::GetEnvironmentVariable($name)
  if ($fromEnv) { return $fromEnv }
  if (-not (Test-Path $EnvFile)) { return $null }
  foreach ($line in Get-Content $EnvFile) {
    if ($line -match "^\s*$name\s*=\s*`"?([^`"]*)`"?\s*$") { return $Matches[1] }
  }
  return $null
}

function Find-PgTool([string]$exe) {
  $cmd = Get-Command $exe -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  # Instalación estándar de PostgreSQL en Windows: se usa la versión más nueva.
  $candidates = Get-ChildItem "C:\Program Files\PostgreSQL\*\bin\$exe.exe" -ErrorAction SilentlyContinue |
    Sort-Object { [int]($_.Directory.Parent.Name -replace "\D", "") } -Descending
  if ($candidates) { return $candidates[0].FullName }
  throw "No se encontró $exe. Instalá PostgreSQL (solo 'Command Line Tools') desde https://www.postgresql.org/download/windows/"
}

$databaseUrl = Read-EnvValue "DATABASE_URL"
if (-not $databaseUrl) { throw "Falta DATABASE_URL (en $EnvFile o como variable de entorno)." }
# pg_dump debe ir por la conexión directa de Neon, no por el pooler (PgBouncer).
$databaseUrl = $databaseUrl -replace "-pooler\.", "."

$pgDump = Find-PgTool "pg_dump"
New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
$stamp = Get-Date -Format "yyyyMMdd-HHmm"
$dumpFile = Join-Path $BackupDir "db-$stamp.dump"
$tmpFile = "$dumpFile.partial"

Write-Host "[backup] Volcando base de datos..."
& $pgDump --format=custom --no-owner --no-privileges --file=$tmpFile $databaseUrl
if ($LASTEXITCODE -ne 0) {
  Remove-Item $tmpFile -ErrorAction SilentlyContinue
  throw "pg_dump falló (código $LASTEXITCODE). No se generó backup."
}
Move-Item $tmpFile $dumpFile -Force
$sizeKb = [math]::Round((Get-Item $dumpFile).Length / 1KB)
Write-Host "[backup] OK base: $dumpFile ($sizeKb KB)"

$photosDir = Read-EnvValue "LOCAL_PHOTOS_PATH"
if (-not $photosDir) { $photosDir = "C:\GymData\photos" }
if ((Test-Path $photosDir) -and (Get-ChildItem $photosDir -File -ErrorAction SilentlyContinue)) {
  $zipFile = Join-Path $BackupDir "fotos-$stamp.zip"
  Compress-Archive -Path (Join-Path $photosDir "*") -DestinationPath $zipFile -Force
  Write-Host "[backup] OK fotos: $zipFile"
} else {
  Write-Host "[backup] Sin fotos para respaldar en $photosDir"
}

$limit = (Get-Date).AddDays(-$KeepDays)
Get-ChildItem $BackupDir -File |
  Where-Object { $_.Name -match "^(db-.*\.dump|fotos-.*\.zip)$" -and $_.LastWriteTime -lt $limit } |
  ForEach-Object {
    Remove-Item $_.FullName
    Write-Host "[backup] Borrado por antigüedad: $($_.Name)"
  }
