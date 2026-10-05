$ErrorActionPreference='Stop'
Stop-ScheduledTask -TaskName 'DanjeongCheck Server' -ErrorAction SilentlyContinue
Unregister-ScheduledTask -TaskName 'DanjeongCheck Server' -Confirm:$false
Write-Host 'Task removed. Database and backups are kept.'
