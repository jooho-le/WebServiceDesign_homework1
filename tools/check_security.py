"""임시 DB와 별도 서버로 인증 경계·클레임·실제 재시작을 검사합니다.

실행: backend/.venv/bin/python tools/check_security.py
실제 .env, 개발용 DB, 실행 중인 서버는 변경하지 않습니다.
"""
import json
import os
from pathlib import Path
import secrets
import socket
import subprocess
import sys
import tempfile
import time
import unittest
import urllib.error
import urllib.request

import jwt

ROOT = Path(__file__).resolve().parent.parent
BACKEND = ROOT / "backend"


class SecurityChecks(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temporary = tempfile.TemporaryDirectory()
        cls.secret = secrets.token_bytes(32)
        with socket.socket() as listener:
            listener.bind(("127.0.0.1", 0))
            cls.port = listener.getsockname()[1]
        cls.environment = {
            **os.environ,
            "JWT_SECRET": cls.secret.hex(),
            "JWT_ISSUER": "webservice-class",
            "JWT_AUDIENCE": "board-api",
            "TOKEN_TTL": "90",
            "DB_FILE": str(Path(cls.temporary.name) / "test.sqlite"),
        }
        cls.start_server()

    @classmethod
    def start_server(cls):
        cls.server = subprocess.Popen(
            [sys.executable, "-m", "uvicorn", "app:app", "--host", "127.0.0.1",
             "--port", str(cls.port), "--log-level", "error"],
            cwd=BACKEND, env=cls.environment,
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )
        deadline = time.monotonic() + 10
        while time.monotonic() < deadline:
            if cls.server.poll() is not None:
                raise RuntimeError("검사용 서버가 시작되지 않았습니다.")
            try:
                if cls.call("GET", "/health")[0] == 200:
                    return
            except urllib.error.URLError:
                pass
            time.sleep(0.1)
        cls.stop_server()
        raise RuntimeError("검사용 서버 시작 시간 초과")

    @classmethod
    def stop_server(cls):
        cls.server.terminate()
        cls.server.wait(timeout=5)

    @classmethod
    def tearDownClass(cls):
        cls.stop_server()
        cls.temporary.cleanup()

    @classmethod
    def call(cls, method, path, body=None, token=None, authorization=None, raw=None):
        headers = {"Content-Type": "application/json"}
        if token:
            headers["Authorization"] = "Bearer " + token
        if authorization is not None:
            headers["Authorization"] = authorization
        data = raw if raw is not None else json.dumps(body).encode() if body is not None else None
        req = urllib.request.Request(
            f"http://127.0.0.1:{cls.port}/api{path}", data=data, headers=headers, method=method
        )
        try:
            response = urllib.request.urlopen(req, timeout=5)
        except urllib.error.HTTPError as error:
            response = error
        with response:
            content = response.read()
            try:
                data = json.loads(content) if content else None
            except json.JSONDecodeError:
                data = {"code": "NON_JSON_RESPONSE", "message": content.decode(errors="replace")}
            return response.status, data, response.headers

    def account(self, name="alice"):
        status, data, _ = self.call("POST", "/auth/login", {
            "email": name + "@class.test", "password": "Classroom!2026",
        })
        self.assertEqual(status, 200)
        return data["accessToken"]

    def signed(self, claims, algorithm="HS256"):
        key = self.secret if algorithm == "HS256" else self.secret + bytes(16)
        # 발급 API가 거부하는 잘못된 타입도 시험하도록 PyJWT의 JWS 계층으로 서명합니다.
        return jwt.api_jws.encode(json.dumps(claims).encode(), key, algorithm=algorithm)

    def claims(self):
        return {"sub": "1", "exp": int(time.time()) + 90,
                "iss": "webservice-class", "aud": "board-api"}

    def expect_error(self, response, status, code):
        self.assertEqual(response[0], status, response[1])
        self.assertEqual(response[1]["code"], code)
        self.assertIsInstance(response[1]["message"], str)
        if status == 401:
            self.assertEqual(response[2].get("WWW-Authenticate"), "Bearer")

    def test_01_bad_server_configuration(self):
        for key in ("", "REPLACE_WITH_RANDOM_64_HEX_CHARACTERS", "g" * 64, "a" * 63, "0" * 64):
            with self.subTest(key_format="invalid"):
                result = subprocess.run(
                    [sys.executable, "-c", "import config"], cwd=BACKEND,
                    env={**self.environment, "JWT_SECRET": key}, capture_output=True,
                )
                self.assertNotEqual(result.returncode, 0)
                self.assertIn(b"JWT_SECRET", result.stderr)

    def test_02_bearer_and_invalid_token(self):
        for value in ("", "Basic abc", "Bearer", "Bearer abc def"):
            self.expect_error(self.call("GET", "/me", authorization=value), 401, "TOKEN_REQUIRED")
        for value in ("Bearer undefined", "Bearer abc.def.ghi"):
            self.expect_error(self.call("GET", "/me", authorization=value), 401, "INVALID_TOKEN")
        self.assertEqual(self.call("GET", "/me", authorization="bearer " + self.account())[0], 200)

    def test_03_issued_claims(self):
        token = self.account()
        claims = jwt.decode(token, self.secret, algorithms=["HS256"],
                            issuer="webservice-class", audience="board-api")
        self.assertEqual(set(claims), {"sub", "exp", "iss", "aud"})
        self.assertEqual(claims["sub"], "1")
        self.assertIs(type(claims["exp"]), int)

    def test_04_signed_invalid_claims(self):
        variants = []
        for field in self.claims():
            claims = self.claims()
            del claims[field]
            variants.append(claims)
        for field, value in [
            ("sub", 1), ("sub", "0"), ("sub", "01"), ("sub", "999"),
            ("exp", "12345678999"), ("exp", True), ("exp", []), ("exp", {}),
            ("iss", "another-server"), ("aud", "another-service"), ("aud", ["board-api"]),
        ]:
            variants.append({**self.claims(), field: value})
        variants.append({**self.claims(), "exp": 1, "aud": "wrong-audience"})
        for index, claims in enumerate(variants):
            with self.subTest(claim_case=index):
                self.expect_error(self.call("GET", "/me", token=self.signed(claims)), 401, "INVALID_TOKEN")
        self.expect_error(self.call("GET", "/me", token=self.signed(self.claims(), "HS384")), 401, "INVALID_TOKEN")
        self.expect_error(self.call("GET", "/me", token=self.signed({**self.claims(), "exp": 1})), 401, "TOKEN_EXPIRED")

    def test_05_permission_order_and_unchanged_data(self):
        alice, bob = self.account(), self.account("bob")
        post = self.call("POST", "/posts", {"title": "권한 검사", "content": "원문"}, alice)[1]
        path = f"/posts/{post['id']}"
        try:
            self.expect_error(self.call("PUT", path, {"title": " ", "content": " "}, bob), 403, "FORBIDDEN")
            self.expect_error(self.call("PUT", path, {"title": " ", "content": " "}, alice), 400, "BAD_INPUT")
            for field in ("id", "authorId", "userId"):
                self.expect_error(self.call("PUT", path, {"title": "위조", "content": "변경", field: 2}, alice), 400, "BAD_INPUT")
            for method in ("PUT", "DELETE"):
                body = {"title": "없음", "content": "없음"} if method == "PUT" else None
                self.expect_error(self.call(method, "/posts/9007199254740991", body), 401, "TOKEN_REQUIRED")
                self.expect_error(self.call(method, "/posts/9007199254740991", body, alice), 404, "NOT_FOUND")
            self.assertEqual(self.call("GET", path)[1], post)
        finally:
            self.call("DELETE", path, token=alice)

    def test_06_input_boundaries(self):
        for body in ([], {}, {"email": "alice@class.test", "password": "Classroom!2026", "id": 1},
                     {"email": "alice@class.test", "password": "x" * 128 + " "}):
            self.expect_error(self.call("POST", "/auth/login", body), 400, "BAD_INPUT")
        self.expect_error(self.call("POST", "/auth/login", {"email": "alice@class.test", "password": "Classroom!2026 "}), 401, "INVALID_CREDENTIALS")
        self.expect_error(self.call("POST", "/auth/login", raw=b"{bad json"), 400, "BAD_INPUT")
        self.expect_error(self.call("GET", "/posts/" + "9" * 5000), 400, "BAD_INPUT")
        alice = self.account()
        status, post, _ = self.call("POST", "/posts", {"title": "가" * 100, "content": "나" * 5000}, alice)
        self.assertEqual(status, 201)
        self.assertEqual(self.call("DELETE", f"/posts/{post['id']}", token=alice)[0], 204)

    def test_07_actual_server_restart(self):
        alice = self.account()
        post = self.call("POST", "/posts", {"title": "재시작 검사", "content": "작성자와 내용 유지"}, alice)[1]
        type(self).stop_server()
        type(self).start_server()
        self.assertEqual(self.call("GET", f"/posts/{post['id']}")[1], post)
        self.assertEqual(self.call("DELETE", f"/posts/{post['id']}", token=self.account())[0], 204)

    def test_08_malformed_unicode_is_bad_input(self):
        self.expect_error(self.call("POST", "/auth/login", {
            "email": "alice@class.test", "password": "\ud800",
        }), 400, "BAD_INPUT")
        alice = self.account()
        before = self.call("GET", "/posts")[1]
        for field in ("title", "content"):
            body = {"title": "유니코드 검사", "content": "정상 본문", field: "\ud800"}
            self.expect_error(self.call("POST", "/posts", body, alice), 400, "BAD_INPUT")
        self.assertEqual(self.call("GET", "/posts")[1], before)

    def test_09_additional_claim_types_and_unsigned_tokens(self):
        for field in ("sub", "iss", "aud", "exp"):
            for value in (None, [], {}, False, 1.5):
                with self.subTest(field=field, value_type=type(value).__name__):
                    self.expect_error(self.call("GET", "/me", token=self.signed({
                        **self.claims(), field: value,
                    })), 401, "INVALID_TOKEN")
        for field in ("iat", "nbf", "jti"):
            self.expect_error(self.call("GET", "/me", token=self.signed({
                **self.claims(), field: [],
            })), 401, "INVALID_TOKEN")
        unsigned = jwt.encode(self.claims(), key=None, algorithm="none")
        self.expect_error(self.call("GET", "/me", token=unsigned), 401, "INVALID_TOKEN")

    def test_10_success_headers_and_empty_delete_body(self):
        alice = self.account()
        status, post, headers = self.call("POST", "/posts", {
            "title": "  공백 정리  ", "content": "  본문  ",
        }, alice)
        path = f"/posts/{post['id']}"
        self.assertEqual(status, 201)
        self.assertEqual(headers.get("Location"), "/api" + path)
        self.assertEqual(post["title"], "공백 정리")
        self.assertEqual(post["content"], "본문")
        req = urllib.request.Request(
            f"http://127.0.0.1:{self.port}/api{path}", method="DELETE",
            headers={"Authorization": "Bearer " + alice},
        )
        with urllib.request.urlopen(req, timeout=5) as response:
            self.assertEqual(response.status, 204)
            self.assertEqual(response.read(), b"")


if __name__ == "__main__":
    unittest.main(verbosity=2)
