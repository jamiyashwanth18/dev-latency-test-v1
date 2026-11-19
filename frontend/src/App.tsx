import * as React from "react";
import { NavLink, Navigate, Outlet, Route, Routes } from "react-router-dom";

import { Icons } from "@/lib/icons";
import {
  apiFetch,
  ApiError,
  clearSessionToken,
  getSessionToken,
  type MeResponse,
  type SessionUser,
} from "@/lib/api";
import SignIn from "@/screens/SignIn";
import MyLeave from "@/screens/MyLeave";
import Approvals from "@/screens/Approvals";
import TeamCalendar from "@/screens/TeamCalendar";
import Admin from "@/screens/Admin";
import GettingStarted from "@/screens/GettingStarted";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "flex items-center gap-2 rounded-[var(--brand-radius)] px-3 py-2 text-sm font-medium transition-colors",
    isActive ? "bg-[var(--brand-hover)] text-[var(--brand-fg)]" : "text-[var(--brand-fg-muted)]",
  ].join(" ");

// The app's menu, drawn around every screen except the ones routed outside it below.
function AppShellLayout({ user, onSignOut }: { user: SessionUser; onSignOut: () => void }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header
        className="border-b"
        style={{
          backgroundColor: "var(--brand-surface)",
          borderColor: "var(--brand-border)",
        }}
      >
        <div className="flex items-center gap-6 px-6 py-2">
          <p
            className="shrink-0 text-sm font-semibold"
            style={{ fontFamily: "var(--brand-font-heading)" }}
          >
            {"Leave Manager"}
          </p>
          <nav aria-label="App menu" className="flex flex-wrap items-center gap-1">
            <NavLink to="/my-leave" className={navLinkClass}>
              <Icons.Home size={16} />
              {"My Leave"}
            </NavLink>
            <NavLink to="/approvals" className={navLinkClass}>
              <Icons.Check size={16} />
              {"Approvals"}
            </NavLink>
            <NavLink to="/team-calendar" className={navLinkClass}>
              {"Team Calendar"}
            </NavLink>
            <NavLink to="/admin" className={navLinkClass}>
              <Icons.Settings size={16} />
              {"Administration"}
            </NavLink>
            <NavLink to="/getting-started" className={navLinkClass}>
              {"Getting Started"}
            </NavLink>
          </nav>
          <div className="ml-auto flex shrink-0 items-center gap-3 text-sm text-[var(--brand-fg-muted)]">
            <span>{user.full_name}</span>
            <button
              type="button"
              onClick={onSignOut}
              className="flex items-center gap-2 rounded-[var(--brand-radius)] px-3 py-2 text-sm font-medium text-[var(--brand-fg-muted)] hover:bg-[var(--brand-hover)]"
            >
              <Icons.User size={16} />
              {"Sign out"}
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  const [session, setSession] = React.useState<SessionUser | null>(null);
  const [restoring, setRestoring] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;

    async function restore() {
      const token = getSessionToken();
      if (!token) {
        if (!cancelled) setRestoring(false);
        return;
      }
      try {
        const me = await apiFetch<MeResponse>("/me");
        if (!cancelled) setSession({ id: me.id, full_name: me.full_name, role: me.role });
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) clearSessionToken();
        if (!cancelled) setSession(null);
      } finally {
        if (!cancelled) setRestoring(false);
      }
    }

    void restore();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSignOut = React.useCallback(async () => {
    try {
      await apiFetch("/sessions/current", { method: "DELETE" });
    } catch {
      // Already revoked, expired, or unreachable: the token is cleared below regardless.
    }
    clearSessionToken();
    setSession(null);
  }, []);

  if (restoring) return null;

  if (!session) {
    return (
      <Routes>
        <Route path="/sign-in" element={<SignIn onSignedIn={setSession} />} />
        <Route path="*" element={<Navigate to="/sign-in" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<AppShellLayout user={session} onSignOut={handleSignOut} />}>
        <Route path="/my-leave" element={<MyLeave />} />
        <Route path="/approvals" element={<Approvals />} />
        <Route path="/team-calendar" element={<TeamCalendar />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/getting-started" element={<GettingStarted />} />
      </Route>
      <Route path="/sign-in" element={<Navigate to="/my-leave" replace />} />
      <Route path="*" element={<Navigate to="/my-leave" replace />} />
    </Routes>
  );
}
