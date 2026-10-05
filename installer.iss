[Setup]
AppId={{CDEB4F18-5489-4DB0-81B1-4B477F139A13}
AppName=DanjeongCheck Test Server
AppVersion=4.1.0
DefaultDirName={autopf}\DanjeongCheckServer
OutputDir=release
OutputBaseFilename=DanjeongCheck_Server_Setup
PrivilegesRequired=admin
Compression=lzma
[Files]
Source: "release_app\*"; DestDir: "{app}"; Flags: recursesubdirs createallsubdirs
[Dirs]
Name: "{commonappdata}\DanjeongCheck\data"
[Run]
Filename: "{app}\install_autostart.cmd"; Flags: runhidden waituntilterminated
[UninstallRun]
Filename: "{app}\stop_server.cmd"; Flags: runhidden waituntilterminated
