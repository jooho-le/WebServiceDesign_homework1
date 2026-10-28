# 배움노트

오늘 배운 내용과 해결한 문제를 남기는 학습 기록 게시판입니다. React + FastAPI + SQLite로 구성한 웹서비스설계 과제 프로젝트입니다.

누구나 기록을 읽을 수 있고, Alice·Bob 테스트 계정으로 로그인하면 글을 작성할 수 있습니다. 수정·삭제는 작성자 본인에게만 허용됩니다.

- 작성자·학번: 이주호 · 202116786
- 저장소: [jooho-le/WebServiceDesign_homework1](https://github.com/jooho-le/WebServiceDesign_homework1) · 브랜치: `main`
- 현재 단계: 필수 기능 구현·검증·보고서 작성 완료. GitHub 업로드와 원격 clone 확인을 진행하며, LMS는 본인이 제출합니다.
- 구현 보고서: [PDF](docs/report.pdf) · [수정 가능한 Markdown 원본](docs/report.md)
- 요청별 HTTP 증거: [2026-10-28 실제 요청·응답](docs/evidence/report-api-20261028.md)
- 실행 재검사: [2026-10-28 API·브라우저·재시작 결과](docs/evidence/runtime-20261028.txt)
- 과제 원문과 양식: [docs](docs/)
- AI 활용: 인증·화면 구현, 오류 수정, 테스트와 보고서 작성에 Codex를 사용했습니다. [활용 범위·출처·검증 기록](docs/AI_USAGE.md)

## 사용 기술

| 구분 | 버전 |
|---|---|
| 프론트엔드 | React 19.3.0, Vite 8.3.4 |
| 백엔드 | FastAPI 0.143.0, Uvicorn 0.54.0 |
| 인증 | PyJWT 2.15.1, HS256 |
| 설정 | python-dotenv 1.2.4 |
| 데이터 | Python 표준 sqlite3, backend/data/board.sqlite |
| 확인한 실행 환경 | macOS, Node.js 20.19.5, Python 3.11.9 |

Node.js 20.19 이상, Python 3.11을 권장합니다. macOS의 기본 Python 3.9와 구분해 `python3 --version`을 먼저 확인하세요. Python 3.11 실행 파일 이름이 `python3.11`이면 아래 가상환경 생성 명령의 `python3`를 `python3.11`로 바꿉니다.

## 폴더 구조

```text
frontend/                 React 화면과 API 호출
backend/                  FastAPI 서버
  auth.py                 JWT 발급·검증, 작성자 권한
  config.py               서버 설정과 비밀 키 검사
  app.py                  API 라우트, 입력 검사, 응답
  store.py                SQLite 저장
  users.py                제공된 계정과 scrypt 비밀번호 검증
  requirements.txt        제공된 직접 의존성 버전
  requirements.lock       검증에 사용한 전체 Python 의존성
  .env.example            비밀 키를 포함하지 않는 설정 예시
docs/                     교수님 제공 문서, 보고서, 테스트 증거
tools/                    제공 API 검사, 추가 검사, 환경설정 생성 도구
```

선택하지 않은 Vue·Express·Spring 템플릿은 제거했습니다. 기존 `frontend-react`, `backend-fastapi`는 `frontend`, `backend`로 바꿨습니다. `docs/01`~`07`은 교수님이 제공한 원문으로, 다른 기술 조합 설명도 그대로 들어 있습니다. 이 프로젝트의 실행 경로는 아래 명령을 기준으로 합니다.

## 처음 설치하고 실행하기

새 폴더에 저장소를 복제합니다.

```sh
git clone https://github.com/jooho-le/WebServiceDesign_homework1.git
cd WebServiceDesign_homework1
```

이후 프로젝트 루트에서 실행합니다.

```sh
python3 --version
python3 -m venv backend/.venv
backend/.venv/bin/python -m pip install -r backend/requirements.lock
python3 tools/setup_env.py
```

`setup_env.py`는 난수 32바이트를 64자리 16진수로 표현해 `backend/.env`에 저장합니다. 실제 키를 출력하지 않으며 기존 `.env`는 덮어쓰지 않습니다. Windows에서는 Python 실행 경로를 `backend\.venv\Scripts\python.exe`로 바꿉니다.

첫 번째 터미널에서 백엔드를 실행합니다.

```sh
cd backend
.venv/bin/python -m uvicorn app:app --host 127.0.0.1 --port 8000
```

새 터미널을 프로젝트 루트에서 열고 프론트를 설치·빌드·실행합니다.

```sh
cd frontend
npm ci
npm run build
npm run preview
```

- 빌드된 화면: http://127.0.0.1:4173
- 상태 확인: http://127.0.0.1:8000/api/health
- 개발 중에는 `npm run preview` 대신 `npm run dev`를 사용하고 http://127.0.0.1:5173 에 접속합니다.
- 프론트의 `/api` 요청은 Vite 프록시를 통해 백엔드로 전달됩니다. 두 터미널이 모두 실행 중이어야 합니다.
- 종료는 각 터미널에서 `Ctrl+C`입니다. 코드를 바꿨다면 빌드 화면을 확인하기 전에 `npm run build`를 다시 실행합니다.

## 테스트 계정

| 이름 | 이메일 | 비밀번호 |
|---|---|---|
| Alice | alice@class.test | Classroom!2026 |
| Bob | bob@class.test | Classroom!2026 |

별도 회원가입은 없습니다. 계정은 서버 시작 시 준비되며 비밀번호는 제공된 scrypt 검증 함수를 사용합니다.

## 인증과 데이터

- 로그인 시 토큰과 사용자 정보를 브라우저 메모리에 저장합니다. localStorage·sessionStorage는 사용하지 않습니다.
- JWT의 `sub`, `exp`, `iss`, `aud`와 HS256 서명을 검사하고 실제 계정이 있는지도 확인합니다. 비밀 키는 64자리 hex를 32바이트로 변환해 사용합니다.
- `auth.py`의 `current_user_id`가 검증된 ID를 반환하고, 등록 시 그 ID를 작성자로 저장합니다. `assert_owner`는 수정·삭제 전에 저장된 작성자와 비교합니다.
- 기본 만료 시간은 90초입니다. 만료 토큰으로 요청해 401을 받으면 로그인 상태를 지웁니다. 403은 안내를 표시하며 로그인을 유지합니다.
- 로그아웃과 새로고침은 이 탭의 로그인 상태를 지웁니다. 이미 복사한 JWT는 만료 시점까지 유효합니다.
- 글은 `backend/data/board.sqlite`에 저장됩니다. 상대 DB 경로는 실행 위치와 관계없이 backend 폴더를 기준으로 해, 서버를 재시작해도 같은 DB를 사용합니다.
- DB 초기화는 서버를 종료한 뒤 `backend/data/board.sqlite`만 삭제하고 다시 실행합니다. 기존 글이 모두 삭제됩니다.
- `.env`, DB, 실제 JWT, node_modules, .venv, dist는 제출하지 않습니다. DB와 테스트 계정은 새로 실행할 때 준비됩니다.

서명 검증과 알고리즘 고정은 [PyJWT 공식 API 문서](https://pyjwt.readthedocs.io/en/stable/api.html)를 참고했습니다. API 오류는 [FastAPI 예외 처리 방식](https://fastapi.tiangolo.com/tutorial/handling-errors/)을 사용해 `code`·`message` JSON으로 반환합니다.

## 검사 명령

백엔드를 켜 둔 상태에서 프로젝트 루트에서 실행합니다.

```sh
backend/.venv/bin/python tools/check_api.py --mode final
```

추가 검사는 자체 임시 DB·별도 포트로 서버를 실행하며 실제 재시작도 확인합니다. 개발용 DB는 변경하지 않습니다.

```sh
backend/.venv/bin/python tools/check_security.py
```

프론트 API 모듈 검사와 빌드:

```sh
cd frontend
npm test
npm run build
```

만료 검사 시 기존 백엔드를 종료하고 아래처럼 다시 시작합니다. `.env` 파일 자체는 바꾸지 않습니다.

```sh
cd backend
TOKEN_TTL=3 .venv/bin/python -m uvicorn app:app --host 127.0.0.1 --port 8000
```

다른 터미널의 프로젝트 루트에서 실행합니다.

```sh
backend/.venv/bin/python tools/check_api.py --mode final --expiry
```

검사 후 백엔드를 종료하고 `TOKEN_TTL=3` 없이 다시 실행하면 기본 90초로 돌아갑니다. 화면 검사와 제출 확인은 [제공 테스트 시나리오](docs/05_테스트시나리오.md)도 함께 사용합니다.

## 제출 정보

- 저장소 URL: [https://github.com/jooho-le/WebServiceDesign_homework1](https://github.com/jooho-le/WebServiceDesign_homework1)
- 브랜치: `main`
- 구현 기준 커밋: [c4b24fb1740e](https://github.com/jooho-le/WebServiceDesign_homework1/commit/c4b24fb1740ee56c18970d6a93a5755d37198473)
- 보고서: [docs/report.pdf](docs/report.pdf)

최종 제출 커밋 SHA는 아래 명령으로 확인해 저장소 URL과 함께 LMS에 적습니다. 보고서의 구현 기준 커밋 이후에는 제출 정보와 문서만 정리했습니다.

```sh
git rev-parse HEAD
```

## 제출 전 남은 일

- 실제 코드를 읽고 로그인·토큰 전송·검증·작성자 권한 흐름을 설명하기
- 업로드한 최종 커밋을 새 폴더에 clone해 설치·실행 확인하기
- 저장소와 보고서의 공개 접근을 확인하고 URL·최종 커밋 SHA를 LMS에 제출하기

10월 28일 새 로컬 Git clone의 설치·실행 결과는 [실행 재검사](docs/evidence/runtime-20261028.txt)에 있습니다. 검증 기록은 Codex를 이용한 자동 검사 결과이며, 별도 수동 테스트는 남아 있습니다.
