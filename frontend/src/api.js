// 토큰은 이 탭의 메모리에만 보관합니다. 새로고침하면 로그아웃됩니다.
let session = { accessToken: "", user: null };
const listeners = new Set();
export const getSession = () => session;
export function subscribeSession(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
function setSession(next) {
  session = next;
  listeners.forEach((listener) => listener());
}
export function clearSession() {
  setSession({ accessToken: "", user: null });
}
function authorizationHeaders() {
  return session.accessToken
    ? { Authorization: `Bearer ${session.accessToken}` }
    : {};
}
const errorMessages = {
  BAD_INPUT: "입력 내용을 확인해 주세요. 제목은 100자, 내용은 5,000자까지 입력할 수 있어요.",
  INVALID_CREDENTIALS: "이메일 또는 비밀번호가 올바르지 않아요.",
  TOKEN_REQUIRED: "로그인이 필요해요. 로그인한 뒤 다시 시도해 주세요.",
  INVALID_TOKEN: "로그인 정보를 확인할 수 없어요. 다시 로그인해 주세요.",
  TOKEN_EXPIRED: "로그인 시간이 만료되었어요. 다시 로그인해 주세요.",
  FORBIDDEN: "본인이 작성한 기록만 수정하거나 삭제할 수 있어요.",
  NOT_FOUND: "해당 기록이 없어요. 목록을 다시 확인해 주세요.",
};
export async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`/api${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...authorizationHeaders(),
        ...options.headers,
      },
    });
  } catch {
    throw new Error("서버에 연결할 수 없어요. 백엔드가 실행 중인지 확인해 주세요.");
  }
  if (response.status === 401) clearSession();
  // DELETE의 204 응답에는 파싱할 JSON이 없습니다.
  let data;
  try {
    data = response.status === 204 ? null : await response.json();
  } catch {
    const error = new Error("서버 응답을 읽을 수 없어요. 서버 상태를 확인하고 다시 시도해 주세요.");
    error.status = response.status;
    error.code = "BAD_RESPONSE";
    throw error;
  }
  if (!response.ok) {
    const error = new Error(
      errorMessages[data?.code] || data?.message || `요청에 실패했어요. (${response.status})`,
    );
    error.status = response.status;
    error.code = data?.code;
    throw error;
  }
  return data;
}
export async function login(email, password) {
  const data = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setSession({ accessToken: data.accessToken, user: data.user });
  return data.user;
}
export function canEdit(post) {
  return Boolean(session.user && post && session.user.id === post.authorId);
}
export const api = {
  list: () => request("/posts"),
  detail: (id) => request(`/posts/${id}`),
  create: (input) => request("/posts", { method: "POST", body: JSON.stringify(input) }),
  update: (id, input) =>
    request(`/posts/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  remove: (id) => request(`/posts/${id}`, { method: "DELETE" }),
  me: () => request("/me"),
};
