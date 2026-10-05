@echo off
setlocal
schtasks /create /tn "DanjeongCheckServer" /tr "\"%~dp0run_server.cmd\"" /sc onstart /ru SYSTEM /rl HIGHEST /f
schtasks /run /tn "DanjeongCheckServer"
exit /b 0
