단정체크 서버 EXE GitHub 업로드 파일

1. 이 ZIP을 압축 해제합니다.
2. 안의 모든 파일과 폴더를 DanjeongCheckServer GitHub 저장소 최상위에 복사합니다.
3. GitHub Desktop에서 Commit 후 Push origin 합니다.
4. GitHub → Actions → Build DanjeongCheck Server Setup → Run workflow 실행합니다.
5. 성공한 작업의 Artifacts에서 DanjeongCheck-Server-Setup을 다운로드합니다.
6. 압축 해제 후 DanjeongCheck_Server_Setup.exe를 Windows 10 미니 PC에서 관리자 권한으로 실행합니다.

설치 후 확인
- http://127.0.0.1:8787/api/health
- https://presentoo.duckdns.org/danjeong/

주의
- Caddyfile의 /danjeong/ → 127.0.0.1:8787 설정을 유지합니다.
- run_server.cmd의 JWT_SECRET은 실제 운영 전 변경합니다.
