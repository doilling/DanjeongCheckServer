단정체크 서버 GitHub 업로드 패키지 - v3.9 UI 기준

이 패키지는 v3.9 로컬 시연판의 화면 구조와 기능 파일을 public 폴더에 포함하여,
서버 설치판에서도 기존 v3.9 UI를 유지하기 위한 기준 패키지입니다.

중요:
- public/app.js는 현재 localStorage 기반 v3.9 화면입니다.
- server.js는 SQLite API 서버 코어입니다.
- 최종 중앙 데이터베이스 운영을 위해서는 public/app.js의 localStorage 호출을 API 호출로 추가 전환해야 합니다.
- 이 파일은 기존 ServerWeb v0.2의 단순 화면으로 되돌아가는 문제를 막고,
  GitHub 저장소에서 v3.9 화면 기준으로 작업할 수 있게 하는 업로드 기준본입니다.
