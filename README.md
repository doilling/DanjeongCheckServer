# 단정체크 서버 웹 연결 v0.2

v0.1 서버 코어에 학생/교사/관리자 웹 화면을 API 방식으로 연결한 단계입니다.

## 실행
1. `.env.example`을 `.env`로 복사
2. JWT_SECRET 변경
3. `npm install`
4. `npm start`
5. http://127.0.0.1:8787 확인

## Caddy
Caddyfile에 `Caddyfile.danjeong.snippet` 내용을 도메인 블록 안에 추가합니다.

## 다음 단계
Windows 서비스 자동 실행 + NSIS Setup.exe 패키징
