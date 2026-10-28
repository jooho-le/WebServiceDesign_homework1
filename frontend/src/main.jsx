import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createRoot } from "react-dom/client";
import { api, login, getSession, subscribeSession, clearSession, canEdit } from "./api";
import "./style.css";

const dateLabel = (value) => new Date(value).toLocaleString("ko-KR", {
  year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
});

function App() {
  const { user } = useSyncExternalStore(subscribeSession, getSession);
  const [posts, setPosts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [email, setEmail] = useState("alice@class.test");
  const [password, setPassword] = useState("Classroom!2026");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [onlyMine, setOnlyMine] = useState(false);
  const [notice, setNotice] = useState(null);
  const titleInput = useRef(null);
  const loginInput = useRef(null);

  useEffect(() => {
    // 계정이 바뀌면 이전 사용자의 글을 수정하던 상태를 해제합니다.
    setEditing(null);
    setOnlyMine(false);
  }, [user?.id]);

  useEffect(() => {
    let active = true;
    api.list()
      .then((data) => { if (active) setPosts(data); })
      .catch((error) => { if (active) setNotice({ text: error.message, error: true }); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  function reset() {
    setTitle("");
    setContent("");
    setEditing(null);
  }
  async function refresh() {
    setPosts(await api.list());
  }
  async function run(action, success) {
    setBusy(true);
    setNotice(null);
    try {
      await action();
      setNotice({ text: success, error: false });
    } catch (error) {
      if (error.status === 404) {
        setSelected(null);
        setEditing(null);
        try { await refresh(); } catch { /* 원래 오류 안내를 유지합니다. */ }
      }
      setNotice({ text: error.message, error: true });
    } finally {
      setBusy(false);
    }
  }
  function logout() {
    clearSession();
    reset();
    setOnlyMine(false);
    setNotice({ text: "로그아웃했어요. 기록은 계속 읽을 수 있어요.", error: false });
  }
  async function save(event) {
    event.preventDefault();
    if (!user) return;
    if (!title.trim() || !content.trim()) {
      setNotice({ text: "제목과 내용에 글자를 입력해 주세요.", error: true });
      return;
    }
    await run(async () => {
      const saved = editing
        ? await api.update(editing, { title, content })
        : await api.create({ title, content });
      setSelected(saved);
      reset();
      await refresh();
    }, editing ? "기록을 수정했어요." : "새로운 배움을 기록했어요.");
  }
  const visiblePosts = onlyMine && user
    ? posts.filter((post) => post.authorId === user.id)
    : posts;

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="/" aria-label="배움노트 홈">
          <span className="brand-mark" aria-hidden="true">배</span>
          배움노트<span className="version">BETA</span>
        </a>
        <span className="header-note">하루의 배움이 쌓이는 곳</span>
      </header>
      <section className="intro">
        <span className="eyebrow">MY LEARNING JOURNAL</span>
        <h1>오늘 배운 것,<br />내일의 나에게.</h1>
        <p>작은 발견부터 해결한 문제까지.<br className="mobile-break" /> 나의 배움을 차곡차곡 남겨 보세요.</p>
      </section>
      {notice && (
        <div className={`notice ${notice.error ? "notice-error" : ""}`}
          role={notice.error ? "alert" : "status"}>
          <span>{notice.text}</span>
          <button className="notice-close" aria-label="알림 닫기" onClick={() => setNotice(null)}>×</button>
        </div>
      )}
      <div className="workspace">
        <aside>
          <section className="card account-card" aria-labelledby="account-title">
            <div className="section-heading">
              <h2 id="account-title">{user ? "나의 공간" : "로그인"}</h2>
              <span className={`status-dot ${user ? "online" : ""}`}>
                {user ? "접속 중" : "둘러보는 중"}
              </span>
            </div>
            {user ? (
              <>
                <div className="profile">
                  <span className="avatar">{user.name.slice(0, 1)}</span>
                  <div><strong>{user.name}님, 반가워요.</strong><small>{user.email}</small></div>
                </div>
                <p className="muted small">오늘의 새로운 배움을 남겨 볼까요?</p>
                <div className="actions">
                  <button className="secondary" disabled={busy}
                    onClick={() => run(async () => {
                      const me = await api.me();
                      if (me.id !== user.id) throw new Error("사용자 정보를 다시 확인해 주세요.");
                    }, `${user.name}님의 로그인 정보를 확인했어요.`)}>내 정보 확인</button>
                  <button className="text-button" disabled={busy} onClick={logout}>로그아웃</button>
                </div>
              </>
            ) : (
              <>
                <p className="muted small">로그인하고 나만의 기록을 시작하세요.</p>
                <form onSubmit={(event) => {
                  event.preventDefault();
                  run(async () => {
                    await login(email, password);
                    setPassword("");
                  }, "로그인했어요. 오늘의 배움을 기록해 보세요.");
                }}>
                  <label htmlFor="email">이메일</label>
                  <input id="email" ref={loginInput} type="email" autoComplete="username"
                    value={email} maxLength={254} disabled={busy} required
                    onChange={(event) => setEmail(event.target.value)} />
                  <label htmlFor="password">비밀번호</label>
                  <input id="password" type="password" autoComplete="current-password"
                    value={password} maxLength={128} disabled={busy} required
                    onChange={(event) => setPassword(event.target.value)} />
                  <button className="full-width" disabled={busy}>로그인하기 <span aria-hidden="true">→</span></button>
                </form>
                <details className="test-accounts">
                  <summary>테스트 계정 안내</summary>
                  <p>Alice: alice@class.test<br />Bob: bob@class.test<br />공통 비밀번호: Classroom!2026</p>
                </details>
              </>
            )}
          </section>
          <section className="card editor-card" aria-labelledby="editor-title">
            <span className="eyebrow">WRITE A NOTE</span>
            <h2 id="editor-title">{editing ? "기록 다듬기" : "새로운 배움 남기기"}</h2>
            {user ? (
              <form onSubmit={save}>
                <label htmlFor="title">제목 <span className="field-count">{title.length}/100</span></label>
                <input id="title" ref={titleInput} value={title} maxLength={100} required
                  placeholder="어떤 것을 배웠나요?" disabled={busy}
                  onChange={(event) => setTitle(event.target.value)} />
                <label htmlFor="content">내용 <span className="field-count">{content.length.toLocaleString()}/5,000</span></label>
                <textarea id="content" value={content} maxLength={5000} required rows={7}
                  placeholder="배운 내용, 막혔던 문제, 다음에 시도할 것을 자유롭게 적어 보세요."
                  disabled={busy} onChange={(event) => setContent(event.target.value)} />
                <div className="actions">
                  <button disabled={busy}>{editing ? "수정 저장" : "기록 남기기"}</button>
                  <button type="button" className="text-button" disabled={busy} onClick={reset}>
                    {editing ? "수정 취소" : "비우기"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="login-prompt">
                <span className="note-icon" aria-hidden="true">✎</span>
                <p>나의 기록은 로그인 후<br />남길 수 있어요.</p>
                <button className="secondary" onClick={() => loginInput.current?.focus()}>로그인하러 가기</button>
              </div>
            )}
          </section>
        </aside>
        <div className="records">
          <section className="card list-card" aria-labelledby="records-title">
            <div className="section-heading list-heading">
              <h2 id="records-title">배움의 기록 <span className="count">{visiblePosts.length}</span></h2>
              <button className="text-button" disabled={busy || loading}
                onClick={() => run(refresh, "목록을 새로 불러왔어요.")}>새로고침 ↻</button>
            </div>
            <div className="tabs" aria-label="기록 필터">
              <button className={!onlyMine || !user ? "active" : ""} onClick={() => setOnlyMine(false)}>전체 기록</button>
              {user && <button className={onlyMine ? "active" : ""} onClick={() => setOnlyMine(true)}>내 기록</button>}
            </div>
            {loading ? <p className="empty-state">기록을 불러오고 있어요.</p> : visiblePosts.length === 0 ? (
              <div className="empty-state">
                <span className="empty-symbol" aria-hidden="true">↗</span>
                <h3>{onlyMine ? "아직 남긴 기록이 없어요." : "첫 번째 배움을 기다리고 있어요."}</h3>
                <p>{user ? "오늘 알게 된 작은 발견을 기록해 보세요." : "로그인하고 첫 번째 기록의 주인공이 되어 보세요."}</p>
              </div>
            ) : (
              <div className="post-list">
                {visiblePosts.map((post) => (
                  <button key={post.id} className={`post-row ${selected?.id === post.id ? "selected" : ""}`}
                    aria-pressed={selected?.id === post.id} disabled={busy}
                    onClick={() => run(async () => setSelected(await api.detail(post.id)), "기록을 불러왔어요.")}>
                    <span className="post-row-main">
                      <span className="post-title">{post.title}</span>
                      <span className="post-preview">{post.content.replace(/\n/g, " ")}</span>
                      <span className="post-meta">{post.authorName} · {dateLabel(post.createdAt)}</span>
                    </span>
                    <span className="post-arrow" aria-hidden="true">↗</span>
                  </button>
                ))}
              </div>
            )}
          </section>
          <section className="card detail-card" aria-labelledby="detail-title">
            <div className="section-heading">
              <span className="eyebrow" id="detail-title">NOTE DETAIL</span>
              {selected && <span className="muted small">기록 #{selected.id}</span>}
            </div>
            {selected ? (
              <article>
                <h2 className="detail-title">{selected.title}</h2>
                <p className="post-meta">{selected.authorName} · {dateLabel(selected.createdAt)}</p>
                <div className="detail-content">{selected.content}</div>
                {selected.updatedAt !== selected.createdAt && <p className="post-meta">수정 {dateLabel(selected.updatedAt)}</p>}
                {canEdit(selected) && (
                  <div className="actions detail-actions">
                    <button className="secondary" disabled={busy} onClick={() => {
                      setEditing(selected.id);
                      setTitle(selected.title);
                      setContent(selected.content);
                      requestAnimationFrame(() => {
                        titleInput.current?.focus();
                        titleInput.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                      });
                    }}>수정</button>
                    <button className="danger" disabled={busy} onClick={() => {
                      if (window.confirm("이 기록을 삭제할까요? 삭제한 기록은 복구할 수 없어요.")) {
                        run(async () => {
                          await api.remove(selected.id);
                          setSelected(null);
                          if (editing === selected.id) reset();
                          await refresh();
                        }, "기록을 삭제했어요.");
                      }
                    }}>삭제</button>
                  </div>
                )}
              </article>
            ) : <p className="detail-placeholder">위 목록에서 기록을 선택하면<br />자세한 내용을 읽을 수 있어요.</p>}
          </section>
        </div>
      </div>
      <footer><span>배움노트</span> 작게 배우고, 꾸준히 기록하기.</footer>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
