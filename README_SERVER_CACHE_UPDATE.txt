단정체크 5.0.7 영구 캐시 해결판

1. GitHub에 전체 파일을 덮어쓰고 Commit/Push합니다.
2. GitHub Actions 성공 후 DanjeongCheck-Setup-5.0.7.exe를 받습니다.
3. 서버 PC의 C:\webserver\danjeong\data 폴더를 백업합니다.
4. 작업 스케줄러 'DanjeongCheck Server'를 중지하고 설치 파일을 실행합니다.
5. Caddyfile_danjeong_cache_snippet.txt 내용을 C:\webserver\Caddyfile 사이트 블록에 반영합니다.
6. 관리자 PowerShell에서 실행:
   & "C:\webserver\caddy.exe" validate --config "C:\webserver\Caddyfile"
   & "C:\webserver\caddy.exe" reload --config "C:\webserver\Caddyfile"
7. 확인 주소:
   https://presentoo.duckdns.org/danjeong/service-worker.js?v=20261025-r1
   내용에 danjeong-5-0-7-20261025-r1 이 표시되어야 합니다.

이 버전은 온라인 상태에서 서버의 최신 정적 파일을 우선 사용하고, 오프라인일 때만 캐시를 사용합니다.
