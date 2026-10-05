# v4.1.1 → 중앙 서버 기능 대조와 검증

화면 기준: 사용자가 첨부한 DanjeongCheck_v4_1_1.zip.
이전 시연판의 평문 비밀번호/localStorage 저장은 제거하고 중앙 SQLite로 교체했습니다.
교표·보라색 화면·역할별 메뉴를 유지하며, 서버용 초기 설정과 이력 화면을 추가했습니다.

| 요청 항목 | 연결된 화면 / 서버 |
|---|---|
| 학생·교사·관리자 로그인 | 로그인 → /api/login, 세션 쿠키 /api/session |
| 자동 로그인 | 로그인 유지 체크 → SQLite 세션 30일, 재시작 유지 |
| 학생 추가·수정·삭제 | 관리자 설정 → 학생 관리 → /api/users |
| 교사·관리자 역할·담당 학반 | 관리자 설정 → 교사 관리 → /api/users |
| 점검 항목·학교 규정 | 관리자 설정 → 점검 항목 / 복장 안내 |
| 학생·교사 Excel | 양식 다운로드 /api/template, 업로드 /api/import |
| 서버 학번 생성 | 학생 추가 / Excel 등록 시 서버 student_id |
| 동적 학년·반 | 서버 계정 자료로 UI 필터 생성 |
| 지도 등록 | 점검 등록 → /api/records |
| 학생 지도 상세·교정 완료 | 내 안내 → 상세 → /api/records/{id} |
| 지도 수정·수정 이력 | 지도 내역 → 상세·수정 → /api/records/{id}/history |
| 일반·반복 기간 보고서 | 기간별 보고서 → /api/report |
| XLSX 다운로드 | 보고서 → /api/report.xlsx (openpyxl) |
| 비밀번호 변경·초기화 | 본인 변경 / 담당 학생 초기화, 기존 세션 해제 |
| 백업·복원 | 관리자 백업 화면 → /api/backup, /api/restore |
| v4.1.1 데이터 이관 | 기존 JSON 전체백업을 서버 복원 화면에 업로드 |
| 학년도 초기화 | 확인 문구+현재 관리자 암호, 실행 전 자동 백업 |
| 최초 관리자 | setup-code.txt + 초기 설정 UI → /api/setup |
| Windows EXE 설치 | GitHub Actions + PyInstaller + Inno Setup |
| Windows 자동 실행 | SYSTEM 작업 스케줄러, 실행 제한 없음, 실패 재시작 |

## 실행한 검증

- 17개 서버 통합 테스트: 초기 관리자, 인증·CSRF, 학생 기록 격리, 교사 수정 권한,
  계정 CRUD, 교사 초기화 범위, 암호 변경·세션 해제, 로그인 유지·재시작,
  로그인 실패 제한·HTTPS Secure 쿠키, Excel 일괄 등록·전체 취소·XLSX 출력,
  교사 Excel·동적 학반, 기간·반복 보고서, 항목·규정 CRUD,
  동시 수정 충돌, 삭제한 항목·규정의 재시작 후 유지, 백업 복원(잘못된 DB 자료는 롤백), 기존 JSON 이관·학년도 초기화.
- 실제 app.js의 DOM + 실제 HTTP 서버 연결:
  초기 설정, 학생 추가·수정, 화면의 CSV 일괄 업로드, 교사 등록, 항목 추가,
  지도 등록·수정, 일반/반복 보고서, 백업 화면, 학생 교정 완료, 비밀번호 변경.
- 실행 프로세스 시작 → 초기 설정·로그인 → 종료·재시작 → 로그인 유지.
- Linux에서 PyInstaller onefile 빌드 후 실행 및 HTML/JS/CSS/교표 포함 확인.

## 아직 실제 장비에서 확인해야 하는 항목

이 환경은 Linux입니다. Windows EXE와 설치 프로그램은 GitHub Actions에서 생성해야 합니다.
Workflow는 서버·화면 테스트를 통과한 다음 실제 Windows EXE를 실행해 검사하고 설치판을 만듭니다.
GitHub Actions 실행 성공, 미니 PC 설치, Caddy 외부 HTTPS 연결, Windows OS 재부팅은 아직 실행하지 않았습니다.
실제 브라우저의 렌더링·휴대폰 화면은 설치 후 확인해야 합니다. DOM 검증을 화면 캡처 검증으로 표현하지 않습니다.

README.md에 업로드·설치·Caddy 연결·초기 관리자 설정 순서를 적었습니다.
