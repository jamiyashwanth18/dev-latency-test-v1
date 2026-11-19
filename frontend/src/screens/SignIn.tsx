// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";

const { Button, Empty } = UI;

const { Search, Check, X, ChevronRight, User, Clock } = Icons;

const PRODUCT = "Dev latency test - v1";
const SCREEN = "Choose Your Identity";
const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

// GET /users/active — only is_active users are selectable (AC-002)
const ACTIVE_USERS = [
  {
    wf: "i-3-0-0",
    id: "u-1041",
    full_name: "Sam Okafor",
    role: "Employee",
    line: "Reports to Priya Nair",
  },
  {
    wf: "i-3-0-1",
    id: "u-1052",
    full_name: "Maya Lindqvist",
    role: "Employee",
    line: "Reports to Priya Nair",
  },
  {
    wf: "i-3-0-2",
    id: "u-1067",
    full_name: "Tom Becker",
    role: "Employee",
    line: "Reports to Priya Nair",
  },
  {
    wf: "i-3-0-3",
    id: "u-1018",
    full_name: "Priya Nair",
    role: "Manager",
    line: "3 direct reports",
  },
  {
    wf: "i-3-0-4",
    id: "u-1002",
    full_name: "Dana Weiss",
    role: "HR/Admin",
    line: "Manages users and balances",
  },
];

const LAST_SESSION_ENDED = "09:41";

export default function Screen() {
  const navigate = useNavigate();
  const [query, setQuery] = React.useState("");
  const [pendingId, setPendingId] = React.useState(null);
  const [noticeOpen, setNoticeOpen] = React.useState(true);
  const searchRef = React.useRef(null);

  React.useEffect(() => {
    if (!pendingId) return undefined;
    const t = setTimeout(() => navigate("my-leave"), 650);
    return () => clearTimeout(t);
  }, [pendingId]);

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
    ? ACTIVE_USERS.filter(
        (u) => u.full_name.toLowerCase().includes(q) || u.role.toLowerCase().includes(q),
      )
    : ACTIVE_USERS;
  const pendingUser = ACTIVE_USERS.find((u) => u.id === pendingId) || null;

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
                  Last session ended {LAST_SESSION_ENDED} — 30 minutes with no activity. Nothing was
                  lost; pick your name to carry on.
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
              <span
                className="text-xs uppercase"
                style={{
                  fontFamily: MONO,
                  color: brand.neutralColor,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {results.length} of {ACTIVE_USERS.length}
              </span>
            </div>

            {results.length === 0 ? (
              <div className="mt-4">
                <Empty
                  title="No active user by that name"
                  description={`Nobody active matches “${query.trim()}”. Check the spelling, or ask HR/Admin whether that account was deactivated.`}
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
                      onClick={() => {
                        setQuery("");
                        if (searchRef.current) searchRef.current.focus();
                      }}
                    >
                      Clear search
                    </Button>
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
                        data-wf={u.wf}
                        disabled={busy}
                        aria-busy={isPending}
                        onClick={() => setPendingId(u.id)}
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
                            {u.role} · {u.line} · {u.id}
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
              style={{ fontFamily: MONO, color: brand.accentColor, minHeight: 16 }}
            >
              {pendingUser
                ? `Starting session as ${pendingUser.full_name} (${pendingUser.role})…`
                : ""}
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
        <span style={{ fontVariantNumeric: "tabular-nums" }}>
          Internal team app · Sessions expire after 30 minutes idle
        </span>
      </footer>
    </div>
  );
}
