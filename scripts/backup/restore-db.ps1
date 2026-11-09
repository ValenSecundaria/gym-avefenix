# Restaura un backup generado por backup-db.ps1 en la base indicada.
# Uso:
#   powershell -ExecutionPolicy Bypass -File scripts\backup\restore-db.ps1 -DumpFile C:\GymData\backups\db-20261019-0300.dump -TargetUrl "postgresql://..."
# Recomendado: restaurar en una base/branch NUEVA y vacía, revisar, y recién ahí apuntar DATABASE_URL a ella.
# Con -Clean se borran y recrean las tablas de la base destino (pisa lo que haya).
param(
  [Parameter(Mandatory = $true)][string]$DumpFile,
  [Parameter(Mandatory = $true)][string]$TargetUrl,
  [switch]$Clean,
  [string]$PhotosZip,
  [string]$PhotosDir = "C:\GymData\photos"
)

$ErrorActionPreference = "Stop"

function Find-PgTool([string]$exe) {
  $cmd = Get-Command $exe -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  $candidates = Get-ChildItem "C:\Program Files\PostgreSQL\*\bin\$exe.exe" -ErrorAction SilentlyContinue |
    Sort-Object { [int]($_.Directory.Parent.Name -replace "\D", "") } -Descending
  if ($candidates) { return $candidates[0].FullName }
  throw "No se encontró $exe. Instalá PostgreSQL (solo 'Command Line Tools')."
}

if (-not (Test-Path $DumpFile)) { throw "No existe el archivo $DumpFile" }
$TargetUrl = $TargetUrl -replace "-pooler\.", "."
$hostShown = ($TargetUrl -replace "^[^@]*@", "") -replace "\?.*$", ""

Write-Host "Se va a restaurar:"
Write-Host "  backup : $DumpFile"
Write-Host "  destino: $hostShown"
if ($Clean) { Write-Host "  MODO -Clean: se BORRAN las tablas actuales del destino antes de restaurar." -ForegroundColor Yellow }
$answer = Read-Host "Escribí RESTAURAR para continuar"
if ($answer -ne "RESTAURAR") { Write-Host "Cancelado."; exit 1 }

$pgRestore = Find-PgTool "pg_restore"
$restoreArgs = @("--no-owner", "--no-privileges", "--exit-on-error", "--dbname=$TargetUrl")
if ($Clean) { $restoreArgs += @("--clean", "--if-exists") }
& $pgRestore @restoreArgs $DumpFile
if ($LASTEXITCODE -ne 0) { throw "pg_restore falló (código $LASTEXITCODE)." }
Write-Host "[restore] OK base restaurada."

if ($PhotosZip) {
  New-Item -ItemType Directory -Force -Path $PhotosDir | Out-Null
  Expand-Archive -Path $PhotosZip -DestinationPath $PhotosDir -Force
  Write-Host "[restore] OK fotos restauradas en $PhotosDir"
}
