#define MyAppName "DanjeongCheck Server"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "Teresa Girls High School"
#define MyAppExeName "run_server.cmd"

[Setup]
AppId={{A1EBB1C6-018C-4DF8-A2ED-4A78A56FBC1B}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={autopf}\DanjeongCheckServer
DefaultGroupName={#MyAppName}
OutputDir=release
OutputBaseFilename=DanjeongCheck_Server_Setup
Compression=lzma
SolidCompression=yes
PrivilegesRequired=admin
UninstallDisplayName=DanjeongCheck Server
DisableProgramGroupPage=yes

[Files]
Source: "release_app\*"; DestDir: "{app}"; Flags: recursesubdirs createallsubdirs ignoreversion

[Dirs]
Name: "{commonappdata}\DanjeongCheck\data"
Name: "{commonappdata}\DanjeongCheck\backups"
Name: "{commonappdata}\DanjeongCheck\logs"

[Icons]
Name: "{group}\DanjeongCheck Server"; Filename: "http://127.0.0.1:8787/"
Name: "{autodesktop}\DanjeongCheck Server"; Filename: "http://127.0.0.1:8787/"; Tasks: desktopicon

[Tasks]
Name: "desktopicon"; Description: "바탕화면 바로가기 만들기"; GroupDescription: "추가 아이콘:"

[Run]
Filename: "{app}\install_autostart.cmd"; Flags: runhidden waituntilterminated
Filename: "http://127.0.0.1:8787/"; Flags: shellexec postinstall nowait skipifsilent

[UninstallRun]
Filename: "{app}\stop_server.cmd"; Flags: runhidden waituntilterminated

[Code]
function InitializeSetup(): Boolean;
begin
  Result := True;
  MsgBox('설치 후 Caddy 설정에 /danjeong/ → 127.0.0.1:8787 연결이 있는지 확인하세요.', mbInformation, MB_OK);
end;
