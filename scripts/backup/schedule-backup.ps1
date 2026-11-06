# Registra el backup diario en el Programador de tareas de Windows (una sola vez, en la PC del gimnasio).
# Uso:  powershell -ExecutionPolicy Bypass -File scripts\backup\schedule-backup.ps1 [-At 03:00]
# Si la PC está apagada a esa hora, corre apenas se prende (StartWhenAvailable).
param([string]$At = "03:00")

$script = (Resolve-Path (Join-Path $PSScriptRoot "backup-db.ps1")).Path
$logFile = "C:\GymData\backups\backup.log"
New-Item -ItemType Directory -Force -Path (Split-Path $logFile) | Out-Null

$action = New-ScheduledTaskAction -Execute "powershell.exe" `
  -Argument "-NoProfile -ExecutionPolicy Bypass -Command `"& '$script' *>> '$logFile'`""
$trigger = New-ScheduledTaskTrigger -Daily -At $At
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Hours 1)

Register-ScheduledTask -TaskName "AveFenix - Backup diario" -Action $action -Trigger $trigger -Settings $settings -Force | Out-Null
Write-Host "Tarea 'AveFenix - Backup diario' registrada: todos los días a las $At. Log: $logFile"
