# DanjeongCheck Server Final API

서버형 단정체크 프로젝트입니다.
- 최초 접속 시 관리자 계정 생성
- 학생/교사/관리자 서버 로그인
- 학생 안내/교정 완료
- 점검 등록
- 학생/교사 Excel 업로드
- 동적 학년/반 API
- 기간/반복 보고서
- Windows EXE 빌드 GitHub Actions

Caddy: handle_path /danjeong/* { reverse_proxy 127.0.0.1:8787 }
