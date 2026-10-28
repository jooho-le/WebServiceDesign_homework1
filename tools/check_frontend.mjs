import assert from "node:assert/strict";
import { after, test } from "node:test";
import { api, canEdit, clearSession, getSession, login } from "../frontend/src/api.js";

const originalFetch = globalThis.fetch;
after(() => { globalThis.fetch = originalFetch; clearSession(); });
const user = { id: 1, name: "Alice", email: "alice@class.test" };
const respond = (data, status = 200) => new Response(
  status === 204 ? null : JSON.stringify(data), { status },
);
async function signIn() {
  globalThis.fetch = async () => respond({ accessToken: "test-token-placeholder", user });
  await login(user.email, "test-password");
}

test("frontend authentication and response contract", async (suite) => {
  await suite.test("public requests have no Authorization header", async () => {
    clearSession();
    globalThis.fetch = async (_url, options) => {
      assert.equal(options.headers.Authorization, undefined);
      return respond([]);
    };
    assert.deepEqual(await api.list(), []);
  });
  await suite.test("login sends JSON and stores the returned session", async () => {
    globalThis.fetch = async (url, options) => {
      assert.equal(url, "/api/auth/login");
      assert.deepEqual(JSON.parse(options.body), { email: user.email, password: "test-password" });
      return respond({ accessToken: "test-token-placeholder", user });
    };
    await login(user.email, "test-password");
    assert.deepEqual(getSession().user, user);
    assert.equal(canEdit({ authorId: 1 }), true);
    assert.equal(canEdit({ authorId: 2 }), false);
  });
  await suite.test("protected requests send the actual Bearer header", async () => {
    globalThis.fetch = async (_url, options) => {
      assert.equal(options.headers.Authorization, "Bearer test-token-placeholder");
      return respond(user);
    };
    assert.deepEqual(await api.me(), user);
  });
  await suite.test("403 preserves the login session", async () => {
    globalThis.fetch = async () => respond({ code: "FORBIDDEN", message: "denied" }, 403);
    await assert.rejects(() => api.update(2, {}), { status: 403, code: "FORBIDDEN" });
    assert.deepEqual(getSession().user, user);
  });
  await suite.test("400 preserves the login session and exposes BAD_INPUT", async () => {
    globalThis.fetch = async () => respond({ code: "BAD_INPUT", message: "invalid" }, 400);
    await assert.rejects(() => api.create({}), { status: 400, code: "BAD_INPUT" });
    assert.deepEqual(getSession().user, user);
  });
  await suite.test("204 deletion does not parse a JSON body", async () => {
    globalThis.fetch = async () => respond(null, 204);
    assert.equal(await api.remove(1), null);
  });
  await suite.test("all 401 variants clear token and user", async () => {
    for (const code of ["INVALID_CREDENTIALS", "TOKEN_REQUIRED", "INVALID_TOKEN", "TOKEN_EXPIRED"]) {
      await signIn();
      globalThis.fetch = async () => respond({ code, message: "unauthorized" }, 401);
      await assert.rejects(() => api.me(), { status: 401, code });
      assert.deepEqual(getSession(), { accessToken: "", user: null });
      assert.equal(canEdit({ authorId: 1 }), false);
    }
  });
  await suite.test("logout removes Authorization from subsequent requests", async () => {
    await signIn();
    clearSession();
    globalThis.fetch = async (_url, options) => {
      assert.equal(options.headers.Authorization, undefined);
      return respond(user);
    };
    await api.me();
  });
  await suite.test("non-JSON upstream errors show a useful message", async () => {
    await signIn();
    globalThis.fetch = async () => new Response("upstream unavailable", { status: 500 });
    await assert.rejects(() => api.list(), {
      status: 500, code: "BAD_RESPONSE", message: /서버 응답을 읽을 수 없어요/,
    });
    assert.deepEqual(getSession().user, user);
    globalThis.fetch = async () => new Response("unauthorized", { status: 401 });
    await assert.rejects(() => api.me(), { status: 401, code: "BAD_RESPONSE" });
    assert.equal(getSession().user, null);
  });
  await suite.test("network failures show a connection message", async () => {
    globalThis.fetch = async () => { throw new TypeError("fetch failed"); };
    await assert.rejects(() => api.list(), /서버에 연결할 수 없어요/);
  });
});
