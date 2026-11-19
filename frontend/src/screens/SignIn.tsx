import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";
import {
  apiFetch,
  ApiError,
  setSessionToken,
  type ActiveUser,
  type SessionResponse,
  type SessionUser,
} from "@/lib/api";

const { Button, Empty } = UI;

const { Search, X, ChevronRight, User, Clock } = Icons;

const PRODUCT = "Dev latency test - v1";
const SCREEN = "Choose Your Identity";
const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

function roleLabel(role: ActiveUser["role"]): string {
  if (role === "hr_admin") return "HR/Admin";
  if (role === "manager") return "Manager";
  return "Employee";
}

type ListState = "loading" | "error" | "ready";

export default function Screen({ onSignedIn }: { onSignedIn?: (user: SessionUser) => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = React.useState("");
  const [listState, setListState] = React.useState<ListState>("loading");
  const [users, setUsers] = React.useState<ActiveUser[]>([]);
  const [listError, setListError] = React.useState("");
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [signInError, setSignInError] = React.useState("");
  const [noticeOpen, setNoticeOpen] = React.useState(true);
  const searchRef = React.useRef<HTMLInputElement>(null);

  const loadUsers = React.useCallback(() => {
    setListState("loading");
    setListError("");
    apiFetch<ActiveUser[]>("/users/active")
      .then((data) => {
        setUsers(data);
        setListState("ready");
      })
      .catch((err: unknown) => {
        setListError(err instanceof Error ? err.message : "Could not load active users.");
        setListState("error");
      });
  }, []);

  React.useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const thick = `3px solid ${brand.primaryColor}`;
  const hard = `8px 8px 0 ${brand.primaryColor}`;
  const field = {
    border: thick,
    borderRadius: brand.radius,
    height: 48,
    backgroundColor: "transparent",
    fontFamily: MONO,
  };
  const hair = { borderTop: `1px dashed ${brand.neutralColor}` };

  const q = query.trim().toLowerCase();
  const results = q
    ? users.filter(
        (u) => u.full_name.toLowerCase().includes(q) || roleLabel(u.role).toLowerCase().includes(q),
      )
    : users;

  async function pickUser(u: ActiveUser) {
    if (pendingId) return;
    setSignInError("");
    setPendingId(u.id);
    try {
      const session = await apiFetch<SessionResponse>("/sessions", {
        method: "POST",
        body: JSON.stringify({ user_id: u.id }),
      });
      setSessionToken(session.token);
      onSignedIn?.(session.user);
      navigate("my-leave");
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setSignInError("That user can no longer sign in.");
      } else {
        setSignInError(
          err instanceof Error ? err.message : "Could not start a session. Try again.",
        );
      }
      setPendingId(null);
    }
  }

  return (
    <div
      className="flex min-h-screen flex-col px-6 py-8 md:px-12"
      style={{
        color: brand.primaryColor,
        fontFamily: brand.fontBody,
        backgroundColor: brand.backgroundColor,
      }}
    >
      <style>{`
        @keyframes wfRowIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        .wf-row { animation: wfRowIn .26s ease-out both; }
        .wf-pick { transition: background-color .12s linear, color .12s linear, transform .12s ease-out; }
        .wf-pick:hover { background-color: ${brand.primaryColor}; color: ${brand.backgroundColor}; }
        .wf-pick:active { transform: translate(2px, 2px); }
        .wf-focus:focus-visible { outline: 3px solid ${brand.accentColor}; outline-offset: 3px; }
        @media (prefers-reduced-motion: reduce) {
          .wf-row { animation: none; }
          .wf-pick, .wf-pick:active { transition: none; transform: none; }
        }
      `}</style>

      <header
        className="flex flex-wrap items-center justify-between gap-2 pb-4"
        style={{ borderBottom: thick, fontFamily: MONO }}
      >
        <p className="text-sm font-bold uppercase tracking-[0.25em]">{PRODUCT}</p>
        <p className="text-xs uppercase" style={{ fontVariantNumeric: "tabular-nums" }}>
          Vol. 01 — Issue 10 — Leave Desk
        </p>
      </header>

      <div className="grid flex-1 grid-cols-1 items-start gap-10 py-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14">
        <div>
          <h1
            data-wf="b-0-0"
            className="text-[56px] font-bold leading-[0.85] tracking-tight sm:text-[76px] lg:text-[92px]"
            style={{ fontFamily: brand.fontHeading }}
          >
            {SCREEN}
            <span style={{ color: brand.accentColor }}>.</span>
          </h1>

          <div data-wf="b-1-0" className="mt-8 max-w-[52ch]">
            <p className="text-sm leading-relaxed" style={{ fontFamily: MONO }}>
              No password is needed. Pick your name to start a session. Your session ends when you
              sign out or after a period of inactivity.
            </p>

            {noticeOpen ? (
              <div
                className="wf-row mt-6 flex items-start gap-3 p-4"
                style={{ border: thick, borderRadius: brand.radius }}
              >
                <Clock className="mt-[2px] h-4 w-4 shrink-0" aria-hidden="true" />
                <p
                  className="flex-1 text-xs uppercase leading-relaxed tracking-[0.08em]"
                  style={{ fontFamily: MONO, fontVariantNumeric: "tabular-nums" }}
                >
                  Sessions end after a period of inactivity. Nothing is lost; pick your name to
                  carry on.
                </p>
                <button
                  type="button"
                  aria-label="Dismiss session notice"
                  onClick={() => setNoticeOpen(false)}
                  className="wf-focus shrink-0 p-1"
                  style={{ borderRadius: brand.radius }}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <main
          className="p-6 sm:p-8"
          style={{
            border: thick,
            boxShadow: hard,
            borderRadius: brand.radius,
            backgroundColor: brand.backgroundColor,
          }}
        >
          <div data-wf="b-2-0" className="space-y-2">
            <label
              htmlFor="ed-user-search"
              className="block text-xs font-bold uppercase tracking-[0.2em]"
              style={{ fontFamily: MONO }}
            >
              01 / Search active users
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                id="ed-user-search"
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Name or role"
                className="wf-focus w-full pl-10 pr-3 text-sm outline-none"
                style={field}
              />
            </div>
          </div>

          <div data-wf="b-3-0" className="mt-8">
            <div className="flex items-baseline justify-between">
              <h2
                className="text-xs font-bold uppercase tracking-[0.2em]"
                style={{ fontFamily: MONO }}
              >
                02 / Active users
              </h2>
              {listState === "ready" ? (
                <span
                  className="text-xs uppercase"
                  style={{
                    fontFamily: MONO,
                    color: brand.neutralColor,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {results.length} of {users.length}
                </span>
              ) : null}
            </div>

            {listState === "loading" ? (
              <p
                role="status"
                className="mt-4 text-sm"
                style={{ fontFamily: MONO, color: brand.neutralColor }}
              >
                Loading active users…
              </p>
            ) : listState === "error" ? (
              <div className="mt-4">
                <Empty
                  title="Could not load active users"
                  description={listError || "Something went wrong talking to the server."}
                  action={
                    <Button
                      type="button"
                      className="wf-focus h-11 px-5 text-xs font-bold uppercase tracking-[0.2em]"
                      style={{
                        backgroundColor: brand.primaryColor,
                        color: brand.backgroundColor,
                        border: thick,
                        borderRadius: brand.radius,
                        fontFamily: MONO,
                      }}
                      onClick={loadUsers}
                    >
                      Try again
                    </Button>
                  }
                />
              </div>
            ) : results.length === 0 ? (
              <div className="mt-4">
                <Empty
                  title={users.length === 0 ? "No active users yet" : "No active user by that name"}
                  description={
                    users.length === 0
                      ? "Nobody is set up to sign in yet. Ask HR/Admin to add a user."
                      : `Nobody active matches “${query.trim()}”. Check the spelling, or ask HR/Admin whether that account was deactivated.`
                  }
                  action={
                    users.length > 0 ? (
                      <Button
                        type="button"
                        className="wf-focus h-11 px-5 text-xs font-bold uppercase tracking-[0.2em]"
                        style={{
                          backgroundColor: brand.primaryColor,
                          color: brand.backgroundColor,
                          border: thick,
                          borderRadius: brand.radius,
                          fontFamily: MONO,
                        }}
                        onClick={() => {
                          setQuery("");
                          searchRef.current?.focus();
                        }}
                      >
                        Clear search
                      </Button>
                    ) : undefined
                  }
                />
              </div>
            ) : (
              <ul className="mt-4" style={{ borderTop: thick, borderBottom: thick }}>
                {results.map((u, i) => {
                  const isPending = pendingId === u.id;
                  const busy = pendingId !== null;
                  return (
                    <li key={u.id} className="wf-row" style={i === 0 ? undefined : hair}>
                      <button
                        type="button"
                        disabled={busy}
                        aria-busy={isPending}
                        onClick={() => pickUser(u)}
                        className="wf-pick wf-focus flex w-full items-center gap-4 px-3 py-4 text-left disabled:opacity-100"
                        style={{
                          borderRadius: brand.radius,
                          backgroundColor: isPending ? brand.primaryColor : "transparent",
                          color: isPending ? brand.backgroundColor : brand.primaryColor,
                          opacity: busy && !isPending ? 0.4 : 1,
                          cursor: busy ? "default" : "pointer",
                        }}
                      >
                        <User className="h-5 w-5 shrink-0" aria-hidden="true" />
                        <span className="min-w-0 flex-1">
                          <span
                            className="block text-xl font-bold leading-tight"
                            style={{ fontFamily: brand.fontHeading }}
                          >
                            {u.full_name}
                          </span>
                          <span
                            className="mt-1 block text-[11px] uppercase tracking-[0.14em]"
                            style={{ fontFamily: MONO, fontVariantNumeric: "tabular-nums" }}
                          >
                            {roleLabel(u.role)} · {u.id}
                          </span>
                        </span>
                        <span
                          className="shrink-0 text-[11px] font-bold uppercase tracking-[0.16em]"
                          style={{ fontFamily: MONO }}
                        >
                          {isPending ? (
                            "Starting…"
                          ) : (
                            <ChevronRight className="h-5 w-5" aria-hidden="true" />
                          )}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            <p
              role="status"
              aria-live="polite"
              className="mt-4 text-xs uppercase tracking-[0.14em]"
              style={{
                fontFamily: MONO,
                color: signInError ? "#b42318" : brand.accentColor,
                minHeight: 16,
              }}
            >
              {signInError ||
                (pendingId
                  ? `Starting session as ${users.find((u) => u.id === pendingId)?.full_name ?? ""}…`
                  : "")}
            </p>
          </div>

          <p
            data-wf="b-4-0"
            className="mt-6 text-xs leading-relaxed"
            style={{ fontFamily: MONO, color: brand.neutralColor }}
          >
            Deactivated users are not listed. If your name is missing, ask HR/Admin to reactivate
            your account.
          </p>

          <div className="mt-6 pt-6" style={{ borderTop: `1px dashed ${brand.neutralColor}` }}>
            <button
              type="button"
              data-wf="b-5-0"
              onClick={() => navigate("getting-started")}
              className="wf-focus text-xs font-bold uppercase tracking-[0.2em] underline underline-offset-4"
              style={{ fontFamily: MONO, color: brand.accentColor, borderRadius: brand.radius }}
            >
              New here? Read Getting Started →
            </button>
          </div>
        </main>
      </div>

      <footer
        className="flex flex-wrap justify-between gap-2 pt-3 text-xs uppercase"
        style={{ borderTop: thick, fontFamily: MONO }}
      >
        <span>© {PRODUCT}</span>
        <span style={{ fontVariantNumeric: "tabular-nums" }}>Internal team app</span>
      </footer>
    </div>
  );
}
