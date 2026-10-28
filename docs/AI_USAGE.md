# AI 활용 기록

JWT 인증, 작성자 권한, 화면 연결과 오류 처리에 Codex를 사용했다. 코드 초안과 수정안을 반영하고, API·보안·프론트 및 브라우저 자동 검사를 실행하는 데 활용했다. 보고서 작성과 정리에도 도움을 받았다. 세부 모델은 따로 기록하지 않아 미확인이다.

## 코드 출처와 활용 범위

| 구분 | 파일과 반영 내용 |
|---|---|
| 제공 코드 유지 | users.py의 scrypt 비밀번호 검증, 기본 CRUD·SQLite 구조, tools/check_api.py, docs/01~07 문서 |
| AI 코드 반영 | auth.py의 issue_token·current_user_id·assert_owner, config.py의 키·TTL 설정 검사 |
| 제공 코드에 AI 수정 | app.py의 설정 연결·입력 검사, store.py의 DB 경로 기준 고정 |
| 화면 구현 | api.js의 메모리 세션·Bearer·오류 처리, main.jsx·style.css·index.html의 학습 기록 화면에 AI 코드 반영 |
| 보조 도구 | setup_env.py의 키 생성, check_security.py·check_frontend.mjs의 추가 검사에 AI 사용 |
| 문서 | README, report.md·report.pdf, 이 활용 기록 작성에 AI 사용 |

AI가 생성한 인증·화면 코드와 오류 수정안을 반영했고, 별도로 직접 수정한 부분은 없다. 아래 결과는 Codex를 이용한 자동 검사 기준이며, 별도 수동 테스트는 포함하지 않았다.

## 사례 1. JWT 인증과 작성자 권한 구현

- 날짜: 2026-10-23
- 요청 요약: React와 FastAPI 게시판에 로그인, JWT 발급·검증, 작성자 권한 검사를 연결해 달라고 요청했다.
- 반영: auth.py에서 HS256과 필수 클레임을 검증하고, 검증된 사용자 ID를 작성자 판정에 사용한다. api.js는 토큰을 메모리에 보관하고 Bearer 헤더로 보낸다. 비밀번호 검증은 제공된 verify_credentials를 유지했다.
- 결과: 정상 로그인과 본인 글 변경은 성공했다. 무토큰·변조 요청은 401, 다른 사람의 글 변경은 403을 반환했다.
- 증거: [API](evidence/recheck-api-final.txt), [보안](evidence/recheck-security.txt), [브라우저](evidence/recheck-browser-ui.txt).

## 사례 2. 입력 오류와 서버 응답 처리 보완

- 날짜: 2026-10-23
- 요청 요약: 제출 전 인증·권한·입력 검사를 다시 점검하고 오류를 수정해 달라고 요청했다.
- 문제: 깨진 유니코드 문자열이 해싱이나 DB 저장 중 500 오류를 일으켰다. JSON이 아닌 서버 응답에도 적절한 안내가 필요했다.
- 반영: app.py의 fields에서 UTF-8 변환 가능 여부를 검사해 잘못된 입력을 400으로 거부한다. api.js의 request에는 비JSON 응답 안내를 추가했다. 수정안은 AI가 생성한 코드를 반영했다.
- 결과: 같은 입력을 다시 보냈을 때 400으로 처리되고 DB가 유지되었다. 보안 10개와 프론트 10개 시나리오가 통과했다.
- 증거: [보안](evidence/recheck-security.txt), [프론트·빌드](evidence/recheck-frontend-build.txt), [브라우저 오류 처리](evidence/recheck-browser-errors.txt), [HTTP 기록](evidence/recheck-http.json).

## 기타 활용과 검증

새 로컬 Git snapshot clone에서 의존성 설치, 새 키·DB 생성, 빌드·실행과 서버 재시작을 검사했다. [실행 환경과 코드 해시](evidence/recheck-manifest.json), [재시작 결과](evidence/recheck-persistence.txt)에 기록을 남겼다.

10월 28일에는 제공 양식에 맞춰 보고서를 정리하고 API 48개를 다시 실행했다. 모두 통과했으며 [요청별 응답](evidence/report-api-20261028.md)과 [JSON 원자료](evidence/report-api-20261028.json)에 토큰·비밀번호를 가려 첨부했다. 문서 정리 후 코드 해시와 링크, PDF 페이지도 확인했다.

같은 날 새 로컬 Git clone에서 설치·키 생성·기본 DB 저장과 서버 재시작을 다시 확인했다. API 48개, 보안 10개, 프론트 10개와 실제 Chrome 17개 검사를 통과했으며 [실행 결과](evidence/runtime-20261028.txt)에 남겼다.

제출 저장소는 https://github.com/jooho-le/WebServiceDesign_homework1, 브랜치는 main이다. GitHub 업로드와 최종 원격 clone을 확인한 뒤, 저장소 URL과 최종 커밋 SHA를 LMS에 제출할 예정이다.

## 참고 자료

- 교수님 배포 JWT-Assignment: 게시판·계정·SQLite·라우트·화면의 기본 구조와 문서, API 검사 도구.
- [PyJWT 공식 API](https://pyjwt.readthedocs.io/en/stable/api.html): auth.py의 HS256 발급과 검증 옵션, 예외 처리.
- [FastAPI 오류 처리](https://fastapi.tiangolo.com/tutorial/handling-errors/): app.py의 ApiError와 JSON 오류 응답.
