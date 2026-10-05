단정체크 서버 EXE 빌드용 추가 파일

1. 이 ZIP 파일의 압축을 풉니다.
2. 아래 파일과 폴더를 DanjeongCheckServer GitHub 저장소 최상위에 복사합니다.
   run_server.cmd
   install_autostart.cmd
   stop_server.cmd
   installer.iss
   .github\workflows\build-server-exe.yml
3. GitHub Desktop에서 Commit / Push origin 합니다.
4. GitHub Actions에서 Build DanjeongCheck Server Setup 실행합니다.
5. Artifacts에서 DanjeongCheck_Server_Setup.exe를 다운로드합니다.

주의
- 설치 EXE는 Caddyfile을 자동 수정하지 않습니다.
- 이미 설정한 /danjeong/ → 127.0.0.1:8787 Caddy 설정을 유지하세요.
- 설치 전 server.js와 public 폴더가 저장소 최상위에 있어야 합니다.
