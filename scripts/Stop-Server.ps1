$ErrorActionPreference='Stop'
Stop-ScheduledTask -TaskName 'DanjeongCheck Server'
Write-Host 'Server stopped. Data is kept.'
