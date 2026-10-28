# 배움노트 React 화면

Node.js 20.19 이상. 먼저 [루트 README](../README.md)에 따라 FastAPI를 8000번 포트에서 실행합니다.

```sh
npm ci
npm run build
npm run preview
```

빌드 화면: http://127.0.0.1:4173 . 개발 시에는 `npm run dev`와 http://127.0.0.1:5173 을 사용합니다. 종료는 Ctrl+C입니다.

- src/api.js: 로그인, 메모리 세션, Bearer 헤더, 오류 처리
- src/main.jsx: 로그인·작성·목록·상세 화면과 작성자 버튼
- src/style.css: 데스크톱·모바일 레이아웃
- 검사: `npm test`

/api 요청은 Vite 프록시가 8000번 백엔드로 전달합니다. 새로고침하면 메모리의 로그인 상태가 해제되고 글은 DB에 유지됩니다.
