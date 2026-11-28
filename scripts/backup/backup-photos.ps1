# Backup de las fotos de socios a una carpeta sincronizada en la nube (OneDrive o Google Drive).
# Comprime LOCAL_PHOTOS_PATH (por defecto C:\GymData\photos) en fotos-AAAAMMDD-HHmm.zip dentro de
# $DestDir; el cliente de OneDrive / Google Drive para escritorio lo sube solo.
#
# Uso:
#   powershell -ExecutionPolicy Bypass -File scripts\backup\backup-photos.ps1
#   powershell -ExecutionPolicy Bypass -File scripts\backup\backup-photos.ps1 -DestDir "G:\Mi unidad\AveFenix-Backups"
# Dejarlo programado (todos los días a la hora indicada):
#   powershell -ExecutionPolicy Bypass -File scripts\backup\backup-photos.ps1 -Register -At 03:30
param(
  [string]$EnvFile = (Join-Path $PSScriptRoot "..\..\.env"),
  [string]$DestDir = "",
  [int]$KeepCount = 14,
  [switch]$Register,
  [string]$At = "03:30"
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

# Carpeta destino por defecto: OneDrive del usuario; si no hay, Google Drive para escritorio.
if (-not $DestDir) {
  $googleDrive = @("G:\Mi unidad", "G:\My Drive") | Where-Object { Test-Path $_ } | Select-Object -First 1
  if ($env:OneDrive) { $DestDir = Join-Path $env:OneDrive "AveFenix-Backups\fotos" }
  elseif ($googleDrive) { $DestDir = Join-Path $googleDrive "AveFenix-Backups\fotos" }
  else { throw "No se encontró OneDrive ni Google Drive. Indicá la carpeta con -DestDir." }
}

if ($Register) {
  $script = (Resolve-Path $PSCommandPath).Path
  $logFile = "C:\GymData\backups\backup-fotos.log"
  New-Item -ItemType Directory -Force -Path (Split-Path $logFile) | Out-Null
  $action = New-ScheduledTaskAction -Execute "powershell.exe" `
    -Argument "-NoProfile -ExecutionPolicy Bypass -Command `"& '$script' -DestDir '$DestDir' -KeepCount $KeepCount *>> '$logFile'`""
  $trigger = New-ScheduledTaskTrigger -Daily -At $At
  $settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 30)
  Register-ScheduledTask -TaskName "AveFenix - Backup de fotos" -Action $action -Trigger $trigger -Settings $settings -Force | Out-Null
  Write-Host "Tarea 'AveFenix - Backup de fotos' registrada: todos los días a las $At -> $DestDir. Log: $logFile"
  return
}

$photosDir = Read-EnvValue "LOCAL_PHOTOS_PATH"
if (-not $photosDir) { $photosDir = "C:\GymData\photos" }
if (-not (Test-Path $photosDir) -or -not (Get-ChildItem $photosDir -File -ErrorAction SilentlyContinue)) {
  Write-Host "[fotos] No hay fotos en $photosDir. Nada para respaldar."
  return
}

New-Item -ItemType Directory -Force -Path $DestDir | Out-Null
$stamp = Get-Date -Format "yyyyMMdd-HHmm"
$zipFile = Join-Path $DestDir "fotos-$stamp.zip"
$tmpZip = Join-Path $env:TEMP "fotos-$stamp.zip"

# Se arma el zip fuera de la carpeta sincronizada y se mueve al final: el cliente de la nube
# nunca sube un archivo a medio escribir.
Compress-Archive -Path (Join-Path $photosDir "*") -DestinationPath $tmpZip -Force
Move-Item $tmpZip $zipFile -Force
$sizeKb = [math]::Round((Get-Item $zipFile).Length / 1KB)
Write-Host "[fotos] OK: $zipFile ($sizeKb KB)"

Get-ChildItem $DestDir -Filter "fotos-*.zip" | Sort-Object Name -Descending | Select-Object -Skip $KeepCount |
  ForEach-Object { Remove-Item $_.FullName -Force; Write-Host "[fotos] Borrado backup viejo: $($_.Name)" }
