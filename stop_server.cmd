@echo off
schtasks /end /tn "DanjeongCheckServer" >nul 2>&1
schtasks /delete /tn "DanjeongCheckServer" /f >nul 2>&1
