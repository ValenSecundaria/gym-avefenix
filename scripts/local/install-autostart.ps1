# Deja el servidor local arrancando solo al iniciar sesión en Windows (una sola vez, en la notebook del gimnasio).
# Uso:  powershell -ExecutionPolicy Bypass -File scripts\local\install-autostart.ps1 [-Port 3000]
param([int]$Port = 3000)

$script = (Resolve-Path (Join-Path $PSScriptRoot "start-server.ps1")).Path
$logFile = "C:\GymData\server.log"
New-Item -ItemType Directory -Force -Path (Split-Path $logFile) | Out-Null

$action = New-ScheduledTaskAction -Execute "powershell.exe" `
  -Argument "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -Command `"& '$script' -Port $Port *>> '$logFile'`""
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
# Sin límite de tiempo: el servidor queda corriendo todo el día. Si se cae, Windows lo reinicia.
$settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit ([TimeSpan]::Zero) `
  -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1) -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries

Register-ScheduledTask -TaskName "AveFenix - Servidor local" -Action $action -Trigger $trigger -Settings $settings -Force | Out-Null
Write-Host "Tarea 'AveFenix - Servidor local' registrada: arranca al iniciar sesión. Log: $logFile"
Write-Host "Para arrancarlo ahora sin reiniciar:  Start-ScheduledTask -TaskName 'AveFenix - Servidor local'"
