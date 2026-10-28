# 요청별 HTTP 증거

검증일: 2026-10-28 (Asia/Seoul). 실행: Codex. 제품 코드·기존 DB·키는 변경하지 않았습니다. 비밀번호·토큰은 가렸습니다.

## E01 · health

- 요청: GET /api/health / 무토큰
- 예상: HTTP 200 / 해당 없음
- 실제: HTTP 200 / 해당 없음 / PASS
- 헤더: Location=None, WWW-Authenticate=None
- 응답 본문 바이트: 33

요청 JSON(민감값 마스킹):
```json
null
```

실제 응답 JSON(토큰 마스킹):
```json
{
  "status": "ok",
  "stack": "fastapi"
}
```

## E02 · public list

- 요청: GET /api/posts / 무토큰
- 예상: HTTP 200 / 해당 없음
- 실제: HTTP 200 / 해당 없음 / PASS
- 헤더: Location=None, WWW-Authenticate=None
- 응답 본문 바이트: 2

요청 JSON(민감값 마스킹):
```json
null
```

실제 응답 JSON(토큰 마스킹):
```json
[]
```

## E03 · bad ID

- 요청: GET /api/posts/abc / 무토큰
- 예상: HTTP 400 / BAD_INPUT
- 실제: HTTP 400 / BAD_INPUT / PASS
- 헤더: Location=None, WWW-Authenticate=None
- 응답 본문 바이트: 69

요청 JSON(민감값 마스킹):
```json
null
```

실제 응답 JSON(토큰 마스킹):
```json
{
  "code": "BAD_INPUT",
  "message": "ID는 양의 정수여야 합니다."
}
```

## E04 · missing ID

- 요청: GET /api/posts/9007199254740991 / 무토큰
- 예상: HTTP 404 / NOT_FOUND
- 실제: HTTP 404 / NOT_FOUND / PASS
- 헤더: Location=None, WWW-Authenticate=None
- 응답 본문 바이트: 59

요청 JSON(민감값 마스킹):
```json
null
```

실제 응답 JSON(토큰 마스킹):
```json
{
  "code": "NOT_FOUND",
  "message": "게시글이 없습니다."
}
```

## E05 · wrong password

- 요청: POST /api/auth/login / 무토큰
- 예상: HTTP 401 / INVALID_CREDENTIALS
- 실제: HTTP 401 / INVALID_CREDENTIALS / PASS
- 헤더: Location=None, WWW-Authenticate=Bearer
- 응답 본문 바이트: 92

요청 JSON(민감값 마스킹):
```json
{
  "email": "alice@class.test",
  "password": "<redacted>"
}
```

실제 응답 JSON(토큰 마스킹):
```json
{
  "code": "INVALID_CREDENTIALS",
  "message": "이메일 또는 비밀번호를 확인하세요."
}
```

## E06 · unknown email

- 요청: POST /api/auth/login / 무토큰
- 예상: HTTP 401 / INVALID_CREDENTIALS
- 실제: HTTP 401 / INVALID_CREDENTIALS / PASS
- 헤더: Location=None, WWW-Authenticate=Bearer
- 응답 본문 바이트: 92

요청 JSON(민감값 마스킹):
```json
{
  "email": "nobody@class.test",
  "password": "<redacted>"
}
```

실제 응답 JSON(토큰 마스킹):
```json
{
  "code": "INVALID_CREDENTIALS",
  "message": "이메일 또는 비밀번호를 확인하세요."
}
```

## E07 · no token me

- 요청: GET /api/me / 무토큰
- 예상: HTTP 401 / TOKEN_REQUIRED
- 실제: HTTP 401 / TOKEN_REQUIRED / PASS
- 헤더: Location=None, WWW-Authenticate=Bearer
- 응답 본문 바이트: 67

요청 JSON(민감값 마스킹):
```json
null
```

실제 응답 JSON(토큰 마스킹):
```json
{
  "code": "TOKEN_REQUIRED",
  "message": "로그인이 필요합니다."
}
```

## E08 · no token create

- 요청: POST /api/posts / 무토큰
- 예상: HTTP 401 / TOKEN_REQUIRED
- 실제: HTTP 401 / TOKEN_REQUIRED / PASS
- 헤더: Location=None, WWW-Authenticate=Bearer
- 응답 본문 바이트: 67

요청 JSON(민감값 마스킹):
```json
{
  "title": "무토큰",
  "content": "공통 API 검사에서 생성한 임시 게시글입니다."
}
```

실제 응답 JSON(토큰 마스킹):
```json
{
  "code": "TOKEN_REQUIRED",
  "message": "로그인이 필요합니다."
}
```

## E09 · login alice@class.test

- 요청: POST /api/auth/login / 무토큰
- 예상: HTTP 200 / 해당 없음
- 실제: HTTP 200 / 해당 없음 / PASS
- 헤더: Location=None, WWW-Authenticate=None
- 응답 본문 바이트: 266

요청 JSON(민감값 마스킹):
```json
{
  "email": "alice@class.test",
  "password": "<redacted>"
}
```

실제 응답 JSON(토큰 마스킹):
```json
{
  "accessToken": "<redacted>",
  "expiresIn": 3,
  "user": {
    "id": 1,
    "name": "Alice",
    "email": "alice@class.test"
  }
}
```

## E10 · login bob@class.test

- 요청: POST /api/auth/login / 무토큰
- 예상: HTTP 200 / 해당 없음
- 실제: HTTP 200 / 해당 없음 / PASS
- 헤더: Location=None, WWW-Authenticate=None
- 응답 본문 바이트: 262

요청 JSON(민감값 마스킹):
```json
{
  "email": "bob@class.test",
  "password": "<redacted>"
}
```

실제 응답 JSON(토큰 마스킹):
```json
{
  "accessToken": "<redacted>",
  "expiresIn": 3,
  "user": {
    "id": 2,
    "name": "Bob",
    "email": "bob@class.test"
  }
}
```

## E11 · Alice me

- 요청: GET /api/me / Alice
- 예상: HTTP 200 / 해당 없음
- 실제: HTTP 200 / 해당 없음 / PASS
- 헤더: Location=None, WWW-Authenticate=None
- 응답 본문 바이트: 50

요청 JSON(민감값 마스킹):
```json
null
```

실제 응답 JSON(토큰 마스킹):
```json
{
  "id": 1,
  "name": "Alice",
  "email": "alice@class.test"
}
```

## E12 · Bob me

- 요청: GET /api/me / Bob
- 예상: HTTP 200 / 해당 없음
- 실제: HTTP 200 / 해당 없음 / PASS
- 헤더: Location=None, WWW-Authenticate=None
- 응답 본문 바이트: 46

요청 JSON(민감값 마스킹):
```json
null
```

실제 응답 JSON(토큰 마스킹):
```json
{
  "id": 2,
  "name": "Bob",
  "email": "bob@class.test"
}
```

## E13 · create post

- 요청: POST /api/posts / Alice
- 예상: HTTP 201 / 해당 없음
- 실제: HTTP 201 / 해당 없음 / PASS
- 헤더: Location=/api/posts/1, WWW-Authenticate=None
- 응답 본문 바이트: 241

요청 JSON(민감값 마스킹):
```json
{
  "title": "API 검사 임시 글",
  "content": "공통 API 검사에서 생성한 임시 게시글입니다."
}
```

실제 응답 JSON(토큰 마스킹):
```json
{
  "id": 1,
  "title": "API 검사 임시 글",
  "content": "공통 API 검사에서 생성한 임시 게시글입니다.",
  "authorId": 1,
  "authorName": "Alice",
  "createdAt": "2026-10-28T05:43:48.595296+00:00",
  "updatedAt": "2026-10-28T05:43:48.595296+00:00"
}
```

## E14 · public detail

- 요청: GET /api/posts/1 / 무토큰
- 예상: HTTP 200 / 해당 없음
- 실제: HTTP 200 / 해당 없음 / PASS
- 헤더: Location=None, WWW-Authenticate=None
- 응답 본문 바이트: 241

요청 JSON(민감값 마스킹):
```json
null
```

실제 응답 JSON(토큰 마스킹):
```json
{
  "id": 1,
  "title": "API 검사 임시 글",
  "content": "공통 API 검사에서 생성한 임시 게시글입니다.",
  "authorId": 1,
  "authorName": "Alice",
  "createdAt": "2026-10-28T05:43:48.595296+00:00",
  "updatedAt": "2026-10-28T05:43:48.595296+00:00"
}
```

## E15 · no token PUT

- 요청: PUT /api/posts/1 / 무토큰
- 예상: HTTP 401 / TOKEN_REQUIRED
- 실제: HTTP 401 / TOKEN_REQUIRED / PASS
- 헤더: Location=None, WWW-Authenticate=Bearer
- 응답 본문 바이트: 67

요청 JSON(민감값 마스킹):
```json
{
  "title": "타인 수정 시도",
  "content": "공통 API 검사에서 생성한 임시 게시글입니다."
}
```

실제 응답 JSON(토큰 마스킹):
```json
{
  "code": "TOKEN_REQUIRED",
  "message": "로그인이 필요합니다."
}
```

## E16 · Bob denied PUT

- 요청: PUT /api/posts/1 / Bob
- 예상: HTTP 403 / FORBIDDEN
- 실제: HTTP 403 / FORBIDDEN / PASS
- 헤더: Location=None, WWW-Authenticate=None
- 응답 본문 바이트: 95

요청 JSON(민감값 마스킹):
```json
{
  "title": "타인 수정 시도",
  "content": "공통 API 검사에서 생성한 임시 게시글입니다."
}
```

실제 응답 JSON(토큰 마스킹):
```json
{
  "code": "FORBIDDEN",
  "message": "본인이 작성한 글만 수정·삭제할 수 있습니다."
}
```

## E17 · failed request leaves data unchanged

- 요청: GET /api/posts/1 / 무토큰
- 예상: HTTP 200 / 해당 없음
- 실제: HTTP 200 / 해당 없음 / PASS
- 헤더: Location=None, WWW-Authenticate=None
- 응답 본문 바이트: 241

요청 JSON(민감값 마스킹):
```json
null
```

실제 응답 JSON(토큰 마스킹):
```json
{
  "id": 1,
  "title": "API 검사 임시 글",
  "content": "공통 API 검사에서 생성한 임시 게시글입니다.",
  "authorId": 1,
  "authorName": "Alice",
  "createdAt": "2026-10-28T05:43:48.595296+00:00",
  "updatedAt": "2026-10-28T05:43:48.595296+00:00"
}
```

## E18 · no token DELETE

- 요청: DELETE /api/posts/1 / 무토큰
- 예상: HTTP 401 / TOKEN_REQUIRED
- 실제: HTTP 401 / TOKEN_REQUIRED / PASS
- 헤더: Location=None, WWW-Authenticate=Bearer
- 응답 본문 바이트: 67

요청 JSON(민감값 마스킹):
```json
null
```

실제 응답 JSON(토큰 마스킹):
```json
{
  "code": "TOKEN_REQUIRED",
  "message": "로그인이 필요합니다."
}
```

## E19 · Bob denied DELETE

- 요청: DELETE /api/posts/1 / Bob
- 예상: HTTP 403 / FORBIDDEN
- 실제: HTTP 403 / FORBIDDEN / PASS
- 헤더: Location=None, WWW-Authenticate=None
- 응답 본문 바이트: 95

요청 JSON(민감값 마스킹):
```json
null
```

실제 응답 JSON(토큰 마스킹):
```json
{
  "code": "FORBIDDEN",
  "message": "본인이 작성한 글만 수정·삭제할 수 있습니다."
}
```

## E20 · failed request leaves data unchanged

- 요청: GET /api/posts/1 / 무토큰
- 예상: HTTP 200 / 해당 없음
- 실제: HTTP 200 / 해당 없음 / PASS
- 헤더: Location=None, WWW-Authenticate=None
- 응답 본문 바이트: 241

요청 JSON(민감값 마스킹):
```json
null
```

실제 응답 JSON(토큰 마스킹):
```json
{
  "id": 1,
  "title": "API 검사 임시 글",
  "content": "공통 API 검사에서 생성한 임시 게시글입니다.",
  "authorId": 1,
  "authorName": "Alice",
  "createdAt": "2026-10-28T05:43:48.595296+00:00",
  "updatedAt": "2026-10-28T05:43:48.595296+00:00"
}
```

## E21 · reject authorId

- 요청: POST /api/posts / Bob
- 예상: HTTP 400 / BAD_INPUT
- 실제: HTTP 400 / BAD_INPUT / PASS
- 헤더: Location=None, WWW-Authenticate=None
- 응답 본문 바이트: 71

요청 JSON(민감값 마스킹):
```json
{
  "title": "위조",
  "content": "공통 API 검사에서 생성한 임시 게시글입니다.",
  "authorId": 1
}
```

실제 응답 JSON(토큰 마스킹):
```json
{
  "code": "BAD_INPUT",
  "message": "허용된 JSON 필드만 보내세요."
}
```

## E22 · reject userId

- 요청: POST /api/posts / Bob
- 예상: HTTP 400 / BAD_INPUT
- 실제: HTTP 400 / BAD_INPUT / PASS
- 헤더: Location=None, WWW-Authenticate=None
- 응답 본문 바이트: 71

요청 JSON(민감값 마스킹):
```json
{
  "title": "위조",
  "content": "공통 API 검사에서 생성한 임시 게시글입니다.",
  "userId": 1
}
```

실제 응답 JSON(토큰 마스킹):
```json
{
  "code": "BAD_INPUT",
  "message": "허용된 JSON 필드만 보내세요."
}
```

## E23 · input validation

- 요청: POST /api/posts / Alice
- 예상: HTTP 400 / BAD_INPUT
- 실제: HTTP 400 / BAD_INPUT / PASS
- 헤더: Location=None, WWW-Authenticate=None
- 응답 본문 바이트: 65

요청 JSON(민감값 마스킹):
```json
{
  "title": " ",
  "content": "공통 API 검사에서 생성한 임시 게시글입니다."
}
```

실제 응답 JSON(토큰 마스킹):
```json
{
  "code": "BAD_INPUT",
  "message": "title 입력을 확인하세요."
}
```

## E24 · input validation

- 요청: POST /api/posts / Alice
- 예상: HTTP 400 / BAD_INPUT
- 실제: HTTP 400 / BAD_INPUT / PASS
- 헤더: Location=None, WWW-Authenticate=None
- 응답 본문 바이트: 67

요청 JSON(민감값 마스킹):
```json
{
  "title": "제목",
  "content": " "
}
```

실제 응답 JSON(토큰 마스킹):
```json
{
  "code": "BAD_INPUT",
  "message": "content 입력을 확인하세요."
}
```

## E25 · input validation

- 요청: POST /api/posts / Alice
- 예상: HTTP 400 / BAD_INPUT
- 실제: HTTP 400 / BAD_INPUT / PASS
- 헤더: Location=None, WWW-Authenticate=None
- 응답 본문 바이트: 65

요청 JSON(민감값 마스킹):
```json
{
  "title": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "content": "공통 API 검사에서 생성한 임시 게시글입니다."
}
```

실제 응답 JSON(토큰 마스킹):
```json
{
  "code": "BAD_INPUT",
  "message": "title 입력을 확인하세요."
}
```

## E26 · input validation

- 요청: POST /api/posts / Alice
- 예상: HTTP 400 / BAD_INPUT
- 실제: HTTP 400 / BAD_INPUT / PASS
- 헤더: Location=None, WWW-Authenticate=None
- 응답 본문 바이트: 67

요청 JSON(민감값 마스킹):
```json
{
  "title": "제목",
  "content": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

실제 응답 JSON(토큰 마스킹):
```json
{
  "code": "BAD_INPUT",
  "message": "content 입력을 확인하세요."
}
```

## E27 · tampered GET /me

- 요청: GET /api/me / 변조된 토큰
- 예상: HTTP 401 / INVALID_TOKEN
- 실제: HTTP 401 / INVALID_TOKEN / PASS
- 헤더: Location=None, WWW-Authenticate=Bearer
- 응답 본문 바이트: 111

요청 JSON(민감값 마스킹):
```json
null
```

실제 응답 JSON(토큰 마스킹):
```json
{
  "code": "INVALID_TOKEN",
  "message": "로그인 정보를 확인할 수 없습니다. 다시 로그인하세요."
}
```

## E28 · tampered POST /posts

- 요청: POST /api/posts / 변조된 토큰
- 예상: HTTP 401 / INVALID_TOKEN
- 실제: HTTP 401 / INVALID_TOKEN / PASS
- 헤더: Location=None, WWW-Authenticate=Bearer
- 응답 본문 바이트: 111

요청 JSON(민감값 마스킹):
```json
{
  "title": "변조",
  "content": "공통 API 검사에서 생성한 임시 게시글입니다."
}
```

실제 응답 JSON(토큰 마스킹):
```json
{
  "code": "INVALID_TOKEN",
  "message": "로그인 정보를 확인할 수 없습니다. 다시 로그인하세요."
}
```

## E29 · tampered PUT /posts/1

- 요청: PUT /api/posts/1 / 변조된 토큰
- 예상: HTTP 401 / INVALID_TOKEN
- 실제: HTTP 401 / INVALID_TOKEN / PASS
- 헤더: Location=None, WWW-Authenticate=Bearer
- 응답 본문 바이트: 111

요청 JSON(민감값 마스킹):
```json
{
  "title": "변조",
  "content": "공통 API 검사에서 생성한 임시 게시글입니다."
}
```

실제 응답 JSON(토큰 마스킹):
```json
{
  "code": "INVALID_TOKEN",
  "message": "로그인 정보를 확인할 수 없습니다. 다시 로그인하세요."
}
```

## E30 · tampered DELETE /posts/1

- 요청: DELETE /api/posts/1 / 변조된 토큰
- 예상: HTTP 401 / INVALID_TOKEN
- 실제: HTTP 401 / INVALID_TOKEN / PASS
- 헤더: Location=None, WWW-Authenticate=Bearer
- 응답 본문 바이트: 111

요청 JSON(민감값 마스킹):
```json
null
```

실제 응답 JSON(토큰 마스킹):
```json
{
  "code": "INVALID_TOKEN",
  "message": "로그인 정보를 확인할 수 없습니다. 다시 로그인하세요."
}
```

## E31 · failed request leaves data unchanged

- 요청: GET /api/posts/1 / 무토큰
- 예상: HTTP 200 / 해당 없음
- 실제: HTTP 200 / 해당 없음 / PASS
- 헤더: Location=None, WWW-Authenticate=None
- 응답 본문 바이트: 241

요청 JSON(민감값 마스킹):
```json
null
```

실제 응답 JSON(토큰 마스킹):
```json
{
  "id": 1,
  "title": "API 검사 임시 글",
  "content": "공통 API 검사에서 생성한 임시 게시글입니다.",
  "authorId": 1,
  "authorName": "Alice",
  "createdAt": "2026-10-28T05:43:48.595296+00:00",
  "updatedAt": "2026-10-28T05:43:48.595296+00:00"
}
```

## E32 · owner update

- 요청: PUT /api/posts/1 / Alice
- 예상: HTTP 200 / 해당 없음
- 실제: HTTP 200 / 해당 없음 / PASS
- 헤더: Location=None, WWW-Authenticate=None
- 응답 본문 바이트: 240

요청 JSON(민감값 마스킹):
```json
{
  "title": "본인 수정 완료",
  "content": "공통 API 검사에서 생성한 임시 게시글입니다."
}
```

실제 응답 JSON(토큰 마스킹):
```json
{
  "id": 1,
  "title": "본인 수정 완료",
  "content": "공통 API 검사에서 생성한 임시 게시글입니다.",
  "authorId": 1,
  "authorName": "Alice",
  "createdAt": "2026-10-28T05:43:48.595296+00:00",
  "updatedAt": "2026-10-28T05:43:48.605945+00:00"
}
```

## E33 · create post

- 요청: POST /api/posts / Bob
- 예상: HTTP 201 / 해당 없음
- 실제: HTTP 201 / 해당 없음 / PASS
- 헤더: Location=/api/posts/2, WWW-Authenticate=None
- 응답 본문 바이트: 239

요청 JSON(민감값 마스킹):
```json
{
  "title": "API 검사 임시 글",
  "content": "공통 API 검사에서 생성한 임시 게시글입니다."
}
```

실제 응답 JSON(토큰 마스킹):
```json
{
  "id": 2,
  "title": "API 검사 임시 글",
  "content": "공통 API 검사에서 생성한 임시 게시글입니다.",
  "authorId": 2,
  "authorName": "Bob",
  "createdAt": "2026-10-28T05:43:48.607058+00:00",
  "updatedAt": "2026-10-28T05:43:48.607058+00:00"
}
```

## E34 · Bob own update

- 요청: PUT /api/posts/2 / Bob
- 예상: HTTP 200 / 해당 없음
- 실제: HTTP 200 / 해당 없음 / PASS
- 헤더: Location=None, WWW-Authenticate=None
- 응답 본문 바이트: 228

요청 JSON(민감값 마스킹):
```json
{
  "title": "Bob 수정",
  "content": "공통 API 검사에서 생성한 임시 게시글입니다."
}
```

실제 응답 JSON(토큰 마스킹):
```json
{
  "id": 2,
  "title": "Bob 수정",
  "content": "공통 API 검사에서 생성한 임시 게시글입니다.",
  "authorId": 2,
  "authorName": "Bob",
  "createdAt": "2026-10-28T05:43:48.607058+00:00",
  "updatedAt": "2026-10-28T05:43:48.608197+00:00"
}
```

## E35 · missing protected PUT

- 요청: PUT /api/posts/9007199254740991 / Alice
- 예상: HTTP 404 / NOT_FOUND
- 실제: HTTP 404 / NOT_FOUND / PASS
- 헤더: Location=None, WWW-Authenticate=None
- 응답 본문 바이트: 59

요청 JSON(민감값 마스킹):
```json
{
  "title": "없음",
  "content": "공통 API 검사에서 생성한 임시 게시글입니다."
}
```

실제 응답 JSON(토큰 마스킹):
```json
{
  "code": "NOT_FOUND",
  "message": "게시글이 없습니다."
}
```

## E36 · missing protected DELETE

- 요청: DELETE /api/posts/9007199254740991 / Alice
- 예상: HTTP 404 / NOT_FOUND
- 실제: HTTP 404 / NOT_FOUND / PASS
- 헤더: Location=None, WWW-Authenticate=None
- 응답 본문 바이트: 59

요청 JSON(민감값 마스킹):
```json
null
```

실제 응답 JSON(토큰 마스킹):
```json
{
  "code": "NOT_FOUND",
  "message": "게시글이 없습니다."
}
```

## E37 · login alice@class.test

- 요청: POST /api/auth/login / 무토큰
- 예상: HTTP 200 / 해당 없음
- 실제: HTTP 200 / 해당 없음 / PASS
- 헤더: Location=None, WWW-Authenticate=None
- 응답 본문 바이트: 266

요청 JSON(민감값 마스킹):
```json
{
  "email": "alice@class.test",
  "password": "<redacted>"
}
```

실제 응답 JSON(토큰 마스킹):
```json
{
  "accessToken": "<redacted>",
  "expiresIn": 3,
  "user": {
    "id": 1,
    "name": "Alice",
    "email": "alice@class.test"
  }
}
```

## E38 · expired GET /me

- 요청: GET /api/me / Alice
- 예상: HTTP 401 / TOKEN_EXPIRED
- 실제: HTTP 401 / TOKEN_EXPIRED / PASS
- 헤더: Location=None, WWW-Authenticate=Bearer
- 응답 본문 바이트: 106

요청 JSON(민감값 마스킹):
```json
null
```

실제 응답 JSON(토큰 마스킹):
```json
{
  "code": "TOKEN_EXPIRED",
  "message": "로그인 시간이 만료되었습니다. 다시 로그인하세요."
}
```

## E39 · expired POST /posts

- 요청: POST /api/posts / Alice
- 예상: HTTP 401 / TOKEN_EXPIRED
- 실제: HTTP 401 / TOKEN_EXPIRED / PASS
- 헤더: Location=None, WWW-Authenticate=Bearer
- 응답 본문 바이트: 106

요청 JSON(민감값 마스킹):
```json
{
  "title": "만료",
  "content": "공통 API 검사에서 생성한 임시 게시글입니다."
}
```

실제 응답 JSON(토큰 마스킹):
```json
{
  "code": "TOKEN_EXPIRED",
  "message": "로그인 시간이 만료되었습니다. 다시 로그인하세요."
}
```

## E40 · expired PUT /posts/1

- 요청: PUT /api/posts/1 / Alice
- 예상: HTTP 401 / TOKEN_EXPIRED
- 실제: HTTP 401 / TOKEN_EXPIRED / PASS
- 헤더: Location=None, WWW-Authenticate=Bearer
- 응답 본문 바이트: 106

요청 JSON(민감값 마스킹):
```json
{
  "title": "만료",
  "content": "공통 API 검사에서 생성한 임시 게시글입니다."
}
```

실제 응답 JSON(토큰 마스킹):
```json
{
  "code": "TOKEN_EXPIRED",
  "message": "로그인 시간이 만료되었습니다. 다시 로그인하세요."
}
```

## E41 · expired DELETE /posts/1

- 요청: DELETE /api/posts/1 / Alice
- 예상: HTTP 401 / TOKEN_EXPIRED
- 실제: HTTP 401 / TOKEN_EXPIRED / PASS
- 헤더: Location=None, WWW-Authenticate=Bearer
- 응답 본문 바이트: 106

요청 JSON(민감값 마스킹):
```json
null
```

실제 응답 JSON(토큰 마스킹):
```json
{
  "code": "TOKEN_EXPIRED",
  "message": "로그인 시간이 만료되었습니다. 다시 로그인하세요."
}
```

## E42 · failed request leaves data unchanged

- 요청: GET /api/posts/1 / 무토큰
- 예상: HTTP 200 / 해당 없음
- 실제: HTTP 200 / 해당 없음 / PASS
- 헤더: Location=None, WWW-Authenticate=None
- 응답 본문 바이트: 240

요청 JSON(민감값 마스킹):
```json
null
```

실제 응답 JSON(토큰 마스킹):
```json
{
  "id": 1,
  "title": "본인 수정 완료",
  "content": "공통 API 검사에서 생성한 임시 게시글입니다.",
  "authorId": 1,
  "authorName": "Alice",
  "createdAt": "2026-10-28T05:43:48.595296+00:00",
  "updatedAt": "2026-10-28T05:43:48.605945+00:00"
}
```

## E43 · login alice@class.test

- 요청: POST /api/auth/login / 무토큰
- 예상: HTTP 200 / 해당 없음
- 실제: HTTP 200 / 해당 없음 / PASS
- 헤더: Location=None, WWW-Authenticate=None
- 응답 본문 바이트: 266

요청 JSON(민감값 마스킹):
```json
{
  "email": "alice@class.test",
  "password": "<redacted>"
}
```

실제 응답 JSON(토큰 마스킹):
```json
{
  "accessToken": "<redacted>",
  "expiresIn": 3,
  "user": {
    "id": 1,
    "name": "Alice",
    "email": "alice@class.test"
  }
}
```

## E44 · login bob@class.test

- 요청: POST /api/auth/login / 무토큰
- 예상: HTTP 200 / 해당 없음
- 실제: HTTP 200 / 해당 없음 / PASS
- 헤더: Location=None, WWW-Authenticate=None
- 응답 본문 바이트: 262

요청 JSON(민감값 마스킹):
```json
{
  "email": "bob@class.test",
  "password": "<redacted>"
}
```

실제 응답 JSON(토큰 마스킹):
```json
{
  "accessToken": "<redacted>",
  "expiresIn": 3,
  "user": {
    "id": 2,
    "name": "Bob",
    "email": "bob@class.test"
  }
}
```

## E45 · delete owned test post

- 요청: DELETE /api/posts/1 / Alice
- 예상: HTTP 204 / 해당 없음
- 실제: HTTP 204 / 해당 없음 / PASS
- 헤더: Location=None, WWW-Authenticate=None
- 응답 본문 바이트: 0

요청 JSON(민감값 마스킹):
```json
null
```

실제 응답 JSON(토큰 마스킹):
```json
null
```

## E46 · deleted post missing

- 요청: GET /api/posts/1 / 무토큰
- 예상: HTTP 404 / NOT_FOUND
- 실제: HTTP 404 / NOT_FOUND / PASS
- 헤더: Location=None, WWW-Authenticate=None
- 응답 본문 바이트: 59

요청 JSON(민감값 마스킹):
```json
null
```

실제 응답 JSON(토큰 마스킹):
```json
{
  "code": "NOT_FOUND",
  "message": "게시글이 없습니다."
}
```

## E47 · delete owned test post

- 요청: DELETE /api/posts/2 / Bob
- 예상: HTTP 204 / 해당 없음
- 실제: HTTP 204 / 해당 없음 / PASS
- 헤더: Location=None, WWW-Authenticate=None
- 응답 본문 바이트: 0

요청 JSON(민감값 마스킹):
```json
null
```

실제 응답 JSON(토큰 마스킹):
```json
null
```

## E48 · deleted post missing

- 요청: GET /api/posts/2 / 무토큰
- 예상: HTTP 404 / NOT_FOUND
- 실제: HTTP 404 / NOT_FOUND / PASS
- 헤더: Location=None, WWW-Authenticate=None
- 응답 본문 바이트: 59

요청 JSON(민감값 마스킹):
```json
null
```

실제 응답 JSON(토큰 마스킹):
```json
{
  "code": "NOT_FOUND",
  "message": "게시글이 없습니다."
}
```

