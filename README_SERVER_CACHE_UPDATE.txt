단정체크 5.0.7 PWA 분리 및 영구 캐시 해결판

1. GitHub 저장소에서 Fetch/Pull한 뒤 이 ZIP의 파일을 덮어씁니다.
2. GitHub Actions 성공 후 DanjeongCheck-Setup-5.0.7.exe를 받습니다.
3. 서버 PC의 C:\webserver\danjeong\data 폴더를 별도로 백업합니다.
4. 작업 스케줄러 'DanjeongCheck Server'를 중지하고 설치 파일을 실행합니다.
5. 기존 Caddy reverse_proxy 설정은 변경하지 않습니다.
6. 설치 후 다음 주소를 확인합니다.
   - https://presentoo.duckdns.org/danjeong/manifest.webmanifest
   - https://presentoo.duckdns.org/danjeong/sw.js
   - https://presentoo.duckdns.org/danjeong/icon-192.png
   - https://presentoo.duckdns.org/danjeong/icon-512.png
7. sw.js 내용에 danjeong-5-0-7-20261025-r2가 있어야 합니다.
8. PWA_SEPARATION_AND_REINSTALL.md에 따라 기존 앱과 잘못된 root 서비스 워커를 정리합니다.

PWA 식별 값:
- id: /danjeong/danjeong-check-app
- start_url: /danjeong/
- scope: /danjeong/
- service worker: /danjeong/sw.js
- service worker scope: /danjeong/

API 응답은 캐시하지 않습니다.
운영 data 폴더는 설치 소스 및 ZIP에 포함하지 않으며, 기존 SQLite 자료를 유지합니다.
