[Setup]
AppId={{B4E38F45-6BB2-4DF1-8D2B-78649D4A6F8E}
AppName=DanjeongCheck Server
AppVersion=1.0.0
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
