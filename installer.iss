[Setup]
AppId={{A19CFBB0-8F01-4E2E-86C1-C7234C4BA5A7}
AppName=DanjeongCheck Server
AppVersion=5.0.0
DefaultDirName=C:\webserver\danjeong
DisableProgramGroupPage=yes
PrivilegesRequired=admin
OutputDir=installer-output
OutputBaseFilename=DanjeongCheck-Setup-5.0.0
Compression=lzma2
SolidCompression=yes
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
CloseApplications=yes
[Files]
Source: "dist\DanjeongCheck.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "scripts\*.ps1"; DestDir: "{app}\scripts"; Flags: ignoreversion
Source: "README.md"; DestDir: "{app}"; Flags: ignoreversion
[Run]
Filename: "{sys}\WindowsPowerShell\v1.0\powershell.exe"; Parameters: "-NoProfile -ExecutionPolicy Bypass -File ""{app}\scripts\Install-Server.ps1"" -InstallDir ""{app}"""; Flags: runhidden waituntilterminated
[UninstallRun]
Filename: "{sys}\WindowsPowerShell\v1.0\powershell.exe"; Parameters: "-NoProfile -ExecutionPolicy Bypass -File ""{app}\scripts\Unregister-Server.ps1"""; Flags: runhidden waituntilterminated
[Code]
function PrepareToInstall(var NeedsRestart: Boolean): String;
var ExitCode: Integer;
begin
  Result := '';
  Exec(ExpandConstant('{sys}\WindowsPowerShell\v1.0\powershell.exe'), '-NoProfile -Command "Stop-ScheduledTask -TaskName ''DanjeongCheck Server'' -ErrorAction SilentlyContinue; Start-Sleep -Seconds 2"', '', SW_HIDE, ewWaitUntilTerminated, ExitCode);
end;
