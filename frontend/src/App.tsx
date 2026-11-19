import { NavLink, Navigate, Outlet, Route, Routes } from "react-router-dom";

import { Icons } from "@/lib/icons";
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
function AppShellLayout() {
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
            <NavLink to="/sign-in" className={navLinkClass}>
              <Icons.User size={16} />
              {"Sign out (Sam Okafor)"}
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppShellLayout />}>
        <Route path="/my-leave" element={<MyLeave />} />
        <Route path="/approvals" element={<Approvals />} />
        <Route path="/team-calendar" element={<TeamCalendar />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/getting-started" element={<GettingStarted />} />
      </Route>
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="*" element={<Navigate to="/sign-in" replace />} />
    </Routes>
  );
}
