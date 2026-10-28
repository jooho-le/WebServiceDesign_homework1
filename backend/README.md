# 배움노트 FastAPI 서버

전체 설치·실행은 [루트 README](../README.md)를 따릅니다. Python 3.11 권장입니다.

루트에서 `python3 tools/setup_env.py`로 backend/.env를 준비한 뒤 이 폴더에서 실행합니다.

```sh
.venv/bin/python -m uvicorn app:app --host 127.0.0.1 --port 8000
```

- 상태 확인: http://127.0.0.1:8000/api/health
- API 문서: http://127.0.0.1:8000/docs
- JWT·권한: auth.py / 설정 검사: config.py / API·입력 검사: app.py
- SQLite: data/board.sqlite, 상대 경로는 backend 폴더 기준
- 종료: Ctrl+C

라우트는 제공 코드의 JSON 계약과 입력 검사 순서를 유지합니다. 동적 Request 본문을 사용하므로 Swagger에 요청 필드가 모두 자동 표시되지는 않습니다. 요청 형식은 [공통 API 명세](../docs/02_API명세.md)를 확인하세요.

기본 토큰 만료는 90초이며, 만료 검사만 `TOKEN_TTL=3` 환경변수를 사용합니다. 실제 .env와 DB 파일은 Git에 올리지 않습니다.
