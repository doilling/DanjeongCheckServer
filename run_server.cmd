@echo off
set DATA_DIR=C:\ProgramData\DanjeongCheck\data
set JWT_SECRET=DanjeongCheck-Change-This-Secret-Before-Production
"%~dp0node.exe" "%~dp0server.js"
