# Run as administrator. Installs a background task without a three-day time limit.
param([string]$InstallDir='C:\webserver\danjeong')
$ErrorActionPreference='Stop'
$exe=Join-Path $InstallDir 'DanjeongCheck.exe'
if (!(Test-Path $exe)) { throw "Copy DanjeongCheck.exe to $InstallDir first." }
if (Get-ScheduledTask -TaskName 'DanjeongCheck Server' -ErrorAction SilentlyContinue) {
    Stop-ScheduledTask -TaskName 'DanjeongCheck Server' -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}
New-Item -ItemType Directory -Force (Join-Path $InstallDir 'data') | Out-Null
$action=New-ScheduledTaskAction -Execute $exe -Argument ('--data-dir "'+(Join-Path $InstallDir 'data')+'"') -WorkingDirectory $InstallDir
$trigger=New-ScheduledTaskTrigger -AtStartup
$settings=New-ScheduledTaskSettingsSet -ExecutionTimeLimit ([TimeSpan]::Zero) -RestartCount 10 -RestartInterval (New-TimeSpan -Minutes 1) -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -MultipleInstances IgnoreNew
$principal=New-ScheduledTaskPrincipal -UserId 'SYSTEM' -LogonType ServiceAccount -RunLevel Highest
Register-ScheduledTask -TaskName 'DanjeongCheck Server' -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Force | Out-Null
Start-ScheduledTask -TaskName 'DanjeongCheck Server'
$healthy=$false
for ($attempt=0; $attempt -lt 60; $attempt++) {
    try {
        $status=Invoke-RestMethod 'http://127.0.0.1:8787/danjeong/api/health' -TimeoutSec 2
        if ($status.ok) { $healthy=$true; break }
    } catch {}
    Start-Sleep -Seconds 1
}
if (!$healthy) { throw 'Server did not start. Check task result and data\logs\server.log.' }
Write-Host 'Installed: DanjeongCheck Server. No execution time limit.'
Write-Host 'Caddy must proxy /danjeong/* to 127.0.0.1:8787.'
