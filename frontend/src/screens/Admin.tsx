// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { Button, Input, Textarea, Label, Select, Badge, Table, THead, TBody, TR, TH, TD, Avatar, Empty } = UI;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { Plus, Search, Check, X, ChevronRight, Users, FileText, Clock, Edit, ArrowLeft, ArrowRight, AlertCircle, CheckCircle } = Icons;

const ROLES = ["Employee", "Manager", "HR/Admin"];

const USERS_SEED = [
  { id: "u-01", full_name: "Marguerite Okonjo", role: "HR/Admin", manager_id: null, is_active: true, created_at: "2024-01-08" },
  { id: "u-02", full_name: "Tomas Brandt", role: "Manager", manager_id: null, is_active: true, created_at: "2024-02-19" },
  { id: "u-03", full_name: "Priya Raghunathan", role: "Manager", manager_id: null, is_active: true, created_at: "2024-03-04" },
  { id: "u-04", full_name: "Dervla Finnegan", role: "Employee", manager_id: "u-02", is_active: true, created_at: "2024-06-17" },
  { id: "u-05", full_name: "Nils Sorensen", role: "Employee", manager_id: "u-02", is_active: true, created_at: "2025-01-13" },
  { id: "u-06", full_name: "Amara Bello", role: "Employee", manager_id: "u-03", is_active: true, created_at: "2025-02-24" },
  { id: "u-07", full_name: "Jonas Wexler", role: "Employee", manager_id: "u-03", is_active: false, created_at: "2023-09-11" },
  { id: "u-08", full_name: "Helene Duarte", role: "Employee", manager_id: "u-02", is_active: true, created_at: "2025-09-01" },
  { id: "u-09", full_name: "Rafiq Haddad", role: "Employee", manager_id: "u-03", is_active: true, created_at: "2026-03-02" },
  { id: "u-10", full_name: "Clara Vestergaard", role: "Employee", manager_id: null, is_active: true, created_at: "2026-10-06" },
];

const BALANCES_SEED = {
  "u-01": { year: 2026, allocated_days: 20, adjustment_days: 0, approved_annual_days: 6, adjustment_note: "", updated_at: "2026-01-02" },
  "u-02": { year: 2026, allocated_days: 20, adjustment_days: 0, approved_annual_days: 11, adjustment_note: "", updated_at: "2026-01-02" },
  "u-03": { year: 2026, allocated_days: 20, adjustment_days: 0, approved_annual_days: 17, adjustment_note: "", updated_at: "2026-01-02" },
  "u-04": { year: 2026, allocated_days: 20, adjustment_days: 0, approved_annual_days: 8, adjustment_note: "", updated_at: "2026-01-02" },
  "u-05": { year: 2026, allocated_days: 20, adjustment_days: 0, approved_annual_days: 3, adjustment_note: "", updated_at: "2026-01-02" },
  "u-06": { year: 2026, allocated_days: 20, adjustment_days: 0, approved_annual_days: 14, adjustment_note: "", updated_at: "2026-01-02" },
  "u-07": { year: 2026, allocated_days: 20, adjustment_days: 0, approved_annual_days: 9, adjustment_note: "", updated_at: "2026-01-02" },
  "u-08": { year: 2026, allocated_days: 20, adjustment_days: -6, approved_annual_days: 3, adjustment_note: "Pro-rata from start date 01 Sep 2025", updated_at: "2026-11-19" },
  "u-09": { year: 2026, allocated_days: 20, adjustment_days: -13, approved_annual_days: 2, adjustment_note: "Joined 02 Mar 2026, pro-rata entitlement", updated_at: "2026-03-05" },
  "u-10": { year: 2026, allocated_days: 20, adjustment_days: -16, approved_annual_days: 0, adjustment_note: "Joined 06 Oct 2026, pro-rata entitlement", updated_at: "2026-10-07" },
};

const AUDIT_SEED = [
  { id: "a-2091", created_at: "2026-11-19 09:41", actor: "Marguerite Okonjo", action_type: "ADJUST_BALANCE", leave_request_id: null, detail: "Remaining annual for Helene Duarte set to 11.0 (was 14.0) · note: Pro-rata from start date 01 Sep 2025" },
  { id: "a-2090", created_at: "2026-11-19 08:12", actor: "Tomas Brandt", action_type: "APPROVE_REQUEST", leave_request_id: "LR-2041", detail: "Approved 3 working days annual for Dervla Finnegan · comment: Enjoy Lisbon, cover agreed with Nils" },
  { id: "a-2089", created_at: "2026-11-18 17:55", actor: "Dervla Finnegan", action_type: "SUBMIT_REQUEST", leave_request_id: "LR-2044", detail: "Annual 2026-12-21 to 2026-12-24 · 4 working days · overlap flagged" },
  { id: "a-2088", created_at: "2026-11-18 14:30", actor: "Priya Raghunathan", action_type: "REJECT_REQUEST", leave_request_id: "LR-2039", detail: "Rejected 5 working days annual for Amara Bello · comment: Clashes with Q4 close, resubmit for w/c 11 Jan" },
  { id: "a-2087", created_at: "2026-11-18 10:02", actor: "Amara Bello", action_type: "SUBMIT_REQUEST", leave_request_id: "LR-2043", detail: "Sick 2026-11-18 to 2026-11-18 · 1 working day" },
  { id: "a-2086", created_at: "2026-11-17 16:20", actor: "Marguerite Okonjo", action_type: "CREATE_USER", leave_request_id: null, detail: "Clara Vestergaard created with role Employee · reporting line not yet set" },
  { id: "a-2085", created_at: "2026-11-17 11:09", actor: "Marguerite Okonjo", action_type: "SET_MANAGER", leave_request_id: null, detail: "Rafiq Haddad now reports to Priya Raghunathan (was Tomas Brandt)" },
  { id: "a-2084", created_at: "2026-11-16 11:48", actor: "Marguerite Okonjo", action_type: "DEACTIVATE_USER", leave_request_id: null, detail: "Jonas Wexler deactivated · left the team 13 Nov 2026 · session ended" },
  { id: "a-2083", created_at: "2026-11-16 09:05", actor: "Nils Sorensen", action_type: "SUBMIT_REQUEST", leave_request_id: "LR-2038", detail: "Annual 2026-11-30 to 2026-12-02 · 3 working days" },
  { id: "a-2082", created_at: "2026-11-13 15:31", actor: "Tomas Brandt", action_type: "APPROVE_REQUEST", leave_request_id: "LR-2036", detail: "Approved 1 working day sick for Helene Duarte · comment: Get well, no handover needed" },
];

const TAB_ITEMS = [
  { key: "users", label: "Users & reporting lines", wf: "i-1-0-0" },
  { key: "balances", label: "Balance adjustments", wf: "i-1-0-1" },
  { key: "audit", label: "Audit log", wf: "i-1-0-2" },
];

const ACTING_USER = { name: "Marguerite Okonjo", role: "HR/Admin" };

export default function Screen() {
  const navigate = useNavigate();
  const [tab, setTab] = React.useState("users");
  const [users, setUsers] = React.useState(USERS_SEED);
  const [balances, setBalances] = React.useState(BALANCES_SEED);
  const [audit, setAudit] = React.useState(AUDIT_SEED);
  const [query, setQuery] = React.useState("");
  const [editingId, setEditingId] = React.useState(null);
  const [editDraft, setEditDraft] = React.useState(null);
  const [newUserId, setNewUserId] = React.useState(null);
  const [rowError, setRowError] = React.useState("");
  const [confirmId, setConfirmId] = React.useState(null);
  const [freshIds, setFreshIds] = React.useState([]);
  const [adj, setAdj] = React.useState({ user_id: "", year: "2026", days: "", note: "" });
  const [adjErrors, setAdjErrors] = React.useState({});
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(null);
  const [freshAuditIds, setFreshAuditIds] = React.useState([]);

  const timerRef = React.useRef(null);
  const clockRef = React.useRef(11 * 60 + 24);
  const seqRef = React.useRef(2092);

  React.useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  React.useEffect(() => {
    if (!newUserId) return;
    const el = document.getElementById("edit-name-" + newUserId);
    if (el) el.focus();
  }, [newUserId]);

  const stamp = () => {
    clockRef.current += 3;
    const h = String(Math.floor(clockRef.current / 60)).padStart(2, "0");
    const m = String(clockRef.current % 60).padStart(2, "0");
    return "2026-11-19 " + h + ":" + m;
  };

  const logAudit = (action_type, detail, leave_request_id) => {
    const id = "a-" + seqRef.current++;
    setAudit((prev) => [{ id, created_at: stamp(), actor: ACTING_USER.name, action_type, leave_request_id: leave_request_id || null, detail }, ...prev]);
    setFreshAuditIds((prev) => [...prev, id]);
  };

  const byId = React.useMemo(() => {
    const map = {};
    users.forEach((u) => { map[u.id] = u; });
    return map;
  }, [users]);

  const managers = users.filter((u) => u.role === "Manager" && u.is_active);

  const remainingFor = (id) => {
    const b = balances[id];
    if (!b) return null;
    return b.allocated_days + b.adjustment_days - b.approved_annual_days;
  };

  const q = query.trim().toLowerCase();
  const visibleUsers = users.filter((u) => {
    if (u.is_new) return true;
    if (!q) return true;
    const mgr = u.manager_id && byId[u.manager_id] ? byId[u.manager_id].full_name : "unassigned";
    return (u.full_name + " " + u.role + " " + mgr).toLowerCase().includes(q);
  });

  const hair = "color-mix(in srgb, " + brand.primaryColor + " 16%, transparent)";
  const tint = "color-mix(in srgb, " + brand.accentColor + " 7%, transparent)";
  const surface = "color-mix(in srgb, " + brand.backgroundColor + " 45%, white)";

  const block = {
    border: "3px solid " + brand.primaryColor,
    borderRadius: brand.radius,
    boxShadow: "6px 6px 0 " + brand.primaryColor,
    backgroundColor: surface,
  };
  const primaryBtn = {
    backgroundColor: brand.accentColor,
    color: brand.backgroundColor,
    border: "3px solid " + brand.primaryColor,
    borderRadius: brand.radius,
    boxShadow: "4px 4px 0 " + brand.primaryColor,
    fontFamily: brand.fontBody,
  };
  const ghostBtn = {
    backgroundColor: "transparent",
    color: brand.primaryColor,
    border: "3px solid " + brand.primaryColor,
    borderRadius: brand.radius,
    fontFamily: brand.fontBody,
  };
  const miniBtn = {
    backgroundColor: "transparent",
    color: brand.primaryColor,
    border: "2px solid " + brand.primaryColor,
    borderRadius: brand.radius,
    fontFamily: brand.fontBody,
  };
  const fieldStyle = {
    border: "3px solid " + brand.primaryColor,
    borderRadius: brand.radius,
    backgroundColor: "transparent",
    color: brand.primaryColor,
    fontFamily: brand.fontBody,
  };
  const num = { fontVariantNumeric: "tabular-nums" };

  const css = `
    .adm *:focus-visible { outline: 3px solid ${brand.accentColor}; outline-offset: 2px; }
    @keyframes admIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
    @keyframes admPanel { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
    .adm-in { animation: admIn .3s cubic-bezier(.2,.75,.3,1) both; }
    .adm-panel { animation: admPanel .22s ease-out both; }
    .adm-row:hover { background: ${tint}; }
    .adm-press:active { transform: translate(2px, 2px); }
    @media (prefers-reduced-motion: reduce) {
      .adm-in, .adm-panel { animation: none; }
      .adm-press:active { transform: none; }
    }
  `;

  const discardNewRow = () => {
    if (!newUserId) return;
    setUsers((prev) => prev.filter((x) => x.id !== newUserId));
    setNewUserId(null);
  };

  const onKeyDownEscape = (e) => {
    if (e.key === "Escape") {
      setConfirmId(null);
      if (newUserId && editingId === newUserId) discardNewRow();
      setEditingId(null);
      setEditDraft(null);
      setRowError("");
    }
  };

  const tabKeyNav = (e) => {
    const i = TAB_ITEMS.findIndex((t) => t.key === tab);
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const next = e.key === "ArrowRight" ? (i + 1) % TAB_ITEMS.length : (i - 1 + TAB_ITEMS.length) % TAB_ITEMS.length;
      setTab(TAB_ITEMS[next].key);
      const el = document.getElementById("adm-tab-" + TAB_ITEMS[next].key);
      if (el) el.focus();
    }
  };

  const addUser = () => {
    if (newUserId) {
      const el = document.getElementById("edit-name-" + newUserId);
      if (el) el.focus();
      return;
    }
    const id = "u-" + String(users.length + 1).padStart(2, "0");
    setUsers((prev) => [{ id, full_name: "", role: "Employee", manager_id: null, is_active: true, created_at: "2026-11-19", is_new: true }, ...prev]);
    setFreshIds((prev) => [...prev, id]);
    setNewUserId(id);
    setEditingId(id);
    setEditDraft({ full_name: "", role: "Employee", manager_id: "" });
    setRowError("");
    setConfirmId(null);
  };

  const startEdit = (u) => {
    setConfirmId(null);
    setRowError("");
    setEditingId(u.id);
    setEditDraft({ full_name: u.full_name, role: u.role, manager_id: u.manager_id || "" });
  };

  const cancelEdit = (u) => {
    if (u && u.is_new) discardNewRow();
    setEditingId(null);
    setEditDraft(null);
    setRowError("");
  };

  const saveEdit = (u) => {
    if (u.is_new) {
      const name = editDraft.full_name.trim();
      if (!name) { setRowError("Enter the person's full name as it should appear on the sign-in list."); return; }
      if (users.some((x) => x.id !== u.id && x.full_name.toLowerCase() === name.toLowerCase())) {
        setRowError(name + " is already on the user list. Edit that record instead of adding a second one.");
        return;
      }
      const nextManager = editDraft.manager_id || null;
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, full_name: name, role: editDraft.role, manager_id: nextManager, is_new: false } : x)));
      setBalances((prev) => ({ ...prev, [u.id]: { year: 2026, allocated_days: 20, adjustment_days: 0, approved_annual_days: 0, adjustment_note: "", updated_at: "2026-11-19" } }));
      const mgr = nextManager && byId[nextManager] ? "reports to " + byId[nextManager].full_name : "reporting line not yet set";
      logAudit("CREATE_USER", name + " created with role " + editDraft.role + " · " + mgr);
      setNewUserId(null);
      setEditingId(null);
      setEditDraft(null);
      setRowError("");
      return;
    }
    const name = editDraft.full_name.trim() || u.full_name;
    const nextManager = editDraft.manager_id || null;
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, full_name: name, role: editDraft.role, manager_id: nextManager } : x)));
    if (nextManager !== u.manager_id) {
      const to = nextManager && byId[nextManager] ? byId[nextManager].full_name : "nobody (unassigned)";
      const from = u.manager_id && byId[u.manager_id] ? byId[u.manager_id].full_name : "nobody";
      logAudit("SET_MANAGER", name + " now reports to " + to + " (was " + from + ")");
    }
    if (editDraft.role !== u.role || name !== u.full_name) {
      logAudit("EDIT_USER", name + " updated · role " + u.role + " to " + editDraft.role);
    }
    setEditingId(null);
    setEditDraft(null);
    setRowError("");
  };

  const toggleActive = (u) => {
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, is_active: !x.is_active } : x)));
    if (u.is_active) logAudit("DEACTIVATE_USER", u.full_name + " deactivated · removed from the sign-in list, open sessions ended");
    else logAudit("REACTIVATE_USER", u.full_name + " reactivated · selectable on the sign-in list again");
    setConfirmId(null);
  };

  const pickEmployee = (id) => {
    const rem = remainingFor(id);
    setAdj((prev) => ({ ...prev, user_id: id, days: rem === null ? "" : rem.toFixed(1) }));
    setAdjErrors({});
    setSaved(null);
  };

  const submitAdjustment = (e) => {
    e.preventDefault();
    const errs = {};
    if (!adj.user_id) errs.user_id = "Choose the person whose balance you are correcting.";
    const n = Number(adj.days);
    if (adj.days === "") errs.days = "Enter the new remaining annual days for 2026.";
    else if (Number.isNaN(n) || n < 0 || n > 40) errs.days = "Remaining annual days must be a number between 0 and 40.";
    if (adj.note.trim().length < 4) errs.note = "Write a note. It is stored in the audit log next to your name.";
    setAdjErrors(errs);
    if (Object.keys(errs).length) { setSaved(null); return; }

    setSaving(true);
    timerRef.current = setTimeout(() => {
      const b = balances[adj.user_id];
      const was = b.allocated_days + b.adjustment_days - b.approved_annual_days;
      const newAdjustment = n - (b.allocated_days - b.approved_annual_days);
      setBalances((prev) => ({
        ...prev,
        [adj.user_id]: { ...prev[adj.user_id], adjustment_days: newAdjustment, adjustment_note: adj.note.trim(), updated_at: "2026-11-19" },
      }));
      const who = byId[adj.user_id].full_name;
      logAudit("ADJUST_BALANCE", "Remaining annual for " + who + " set to " + n.toFixed(1) + " (was " + was.toFixed(1) + ") · adjustment " + (newAdjustment >= 0 ? "+" : "") + newAdjustment.toFixed(1) + " days · note: " + adj.note.trim());
      setSaved({ name: who, days: n.toFixed(1), was: was.toFixed(1) });
      setAdj((prev) => ({ ...prev, note: "", days: n.toFixed(1) }));
      setSaving(false);
    }, 650);
  };

  const Eyebrow = ({ children }) => (
    <p className="text-[11px] uppercase tracking-[0.22em]" style={{ color: brand.neutralColor }}>{children}</p>
  );

  const statusBadge = (active) => (
    <Badge
      className="inline-flex items-center gap-1 px-2 py-1 text-[11px] uppercase tracking-[0.12em]"
      style={{
        borderRadius: brand.radius,
        border: "2px solid " + brand.primaryColor,
        backgroundColor: active ? "transparent" : "color-mix(in srgb, " + brand.neutralColor + " 18%, transparent)",
        color: brand.primaryColor,
        fontFamily: brand.fontBody,
      }}
    >
      {active ? <Check className="h-3 w-3" aria-hidden="true" /> : <X className="h-3 w-3" aria-hidden="true" />}
      {active ? "Active" : "Deactivated"}
    </Badge>
  );

  const thStyle = {
    borderBottom: "3px solid " + brand.primaryColor,
    color: brand.primaryColor,
    fontFamily: brand.fontBody,
  };
  const thClass = "px-4 py-3 text-left text-[11px] uppercase tracking-[0.18em] font-normal align-bottom";
  const tdClass = "px-4 py-4 align-top text-[13px]";

  return (
    <div className="adm min-h-full" style={{ backgroundColor: brand.backgroundColor, color: brand.primaryColor, fontFamily: brand.fontBody }}>
      <style>{css}</style>

      <div className="mx-auto w-full max-w-6xl px-6 py-10 md:px-10 md:py-14">

        {/* Row 1 — page title */}
        <header data-wf="b-0-0" className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <Eyebrow>Section 04 — People &amp; records</Eyebrow>
            <h1 className="mt-3 text-[38px] leading-[1.05] md:text-[52px]" style={{ fontFamily: brand.fontHeading, letterSpacing: "-0.01em" }}>
              Administration{" "}
              <span className="block text-[14px] uppercase tracking-[0.2em] md:inline md:text-[16px] md:tracking-[0.16em]" style={{ fontFamily: brand.fontBody, color: brand.neutralColor }}>
                (HR/Admin only)
              </span>
            </h1>
            <p className="mt-4 max-w-[62ch] text-[13px] leading-relaxed" style={{ color: brand.neutralColor }}>
              The user list, reporting lines and 2026 annual balances for the team. Everything you change here is written to the audit log below.
            </p>
          </div>
          <div className="flex items-center gap-3 px-4 py-3" style={{ border: "3px solid " + brand.primaryColor, borderRadius: brand.radius, backgroundColor: surface }}>
            <Avatar name={ACTING_USER.name} />
            <div>
              <p className="text-[13px]">{ACTING_USER.name}</p>
              <p className="text-[11px] uppercase tracking-[0.18em]" style={{ color: brand.accentColor }}>Acting as {ACTING_USER.role}</p>
            </div>
          </div>
        </header>

        <div className="my-8" style={{ borderTop: "3px solid " + brand.primaryColor }} />

        {/* Row 2 — tabs */}
        <div data-wf="b-1-0" role="tablist" aria-label="Administration sections" onKeyDown={tabKeyNav} className="flex flex-wrap gap-0">
          {TAB_ITEMS.map((t) => {
            const on = tab === t.key;
            return (
              <button
                key={t.key}
                id={"adm-tab-" + t.key}
                data-wf={t.wf}
                role="tab"
                type="button"
                aria-selected={on}
                aria-controls={"adm-panel-" + t.key}
                tabIndex={on ? 0 : -1}
                onClick={() => setTab(t.key)}
                className="adm-press -ml-[3px] min-h-[48px] px-5 py-3 text-[12px] uppercase tracking-[0.16em] transition-colors first:ml-0"
                style={{
                  border: "3px solid " + brand.primaryColor,
                  borderRadius: brand.radius,
                  backgroundColor: on ? brand.primaryColor : "transparent",
                  color: on ? brand.backgroundColor : brand.neutralColor,
                  borderBottomColor: on ? brand.accentColor : brand.primaryColor,
                  borderBottomWidth: on ? "6px" : "3px",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* PANEL 1 — users & reporting lines */}
        <section id="adm-panel-users" role="tabpanel" aria-labelledby="adm-tab-users" hidden={tab !== "users"} tabIndex={-1} className="pt-8">
          <h2 className="sr-only">Users and reporting lines</h2>

          {/* Row 3 */}
          <div className="grid grid-cols-12 items-end gap-4" onKeyDown={onKeyDownEscape}>
            <div className="col-span-12 md:col-span-3">
              <Button
                data-wf="b-2-0"
                type="button"
                onClick={addUser}
                className="adm-press flex min-h-[52px] w-full items-center justify-center gap-2 px-5 text-[13px] uppercase tracking-[0.14em]"
                style={primaryBtn}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add user
              </Button>
            </div>
            <div data-wf="b-2-1" className="col-span-12 md:col-span-9">
              <Label htmlFor="adm-search" className="mb-2 block text-[11px] uppercase tracking-[0.18em]" style={{ color: brand.neutralColor }}>
                Search users
              </Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" aria-hidden="true" style={{ color: brand.neutralColor }} />
                <Input
                  id="adm-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Name, role or manager"
                  className="min-h-[52px] w-full pl-11 pr-4 text-[13px]"
                  style={fieldStyle}
                />
              </div>
            </div>
          </div>

          {/* Row 4 — users table */}
          <div data-wf="b-3-0" className="mt-8" onKeyDown={onKeyDownEscape}>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="text-[28px] leading-none" style={{ fontFamily: brand.fontHeading }}>Users</h3>
              <p className="text-[11px] uppercase tracking-[0.16em]" style={{ ...num, color: brand.neutralColor }}>
                Showing {visibleUsers.length} of {users.length} · {users.filter((u) => u.is_active).length} active
              </p>
            </div>

            <div className="mt-4 overflow-x-auto" style={block}>
              {visibleUsers.length === 0 ? (
                <div className="p-8">
                  <Empty
                    title={"No user matches " + '"' + query + '"'}
                    description="Deactivated people stay in this list, so try a shorter spelling or search by role, for example Manager."
                    action={<Button type="button" onClick={() => setQuery("")} className="adm-press min-h-[48px] px-5 text-[12px] uppercase tracking-[0.14em]" style={ghostBtn}>Clear search</Button>}
                  />
                </div>
              ) : (
                <Table className="w-full border-collapse text-left" style={num}>
                  <caption className="sr-only">Team users with role, reporting manager, active status and creation date</caption>
                  <THead>
                    <TR>
                      <TH data-wf="i-3-0-0" scope="col" className={thClass} style={thStyle}>Full name</TH>
                      <TH data-wf="i-3-0-1" scope="col" className={thClass} style={thStyle}>Role</TH>
                      <TH data-wf="i-3-0-2" scope="col" className={thClass} style={thStyle}>Reports to</TH>
                      <TH data-wf="i-3-0-3" scope="col" className={thClass} style={thStyle}>Active</TH>
                      <TH data-wf="i-3-0-4" scope="col" className={thClass} style={thStyle}>Created</TH>
                      <TH data-wf="i-3-0-5" scope="col" className={thClass + " text-right"} style={thStyle}>Actions</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {visibleUsers.map((u) => {
                      const editing = editingId === u.id;
                      const mgr = u.manager_id && byId[u.manager_id] ? byId[u.manager_id].full_name : null;
                      return (
                        <TR
                          key={u.id}
                          className={"adm-row transition-colors " + (freshIds.includes(u.id) ? "adm-in" : "")}
                          style={{ borderBottom: "1px solid " + hair, opacity: u.is_active ? 1 : 0.72 }}
                        >
                          <TD className={tdClass}>
                            {editing ? (
                              <>
                                <Label htmlFor={"edit-name-" + u.id} className="sr-only">{u.is_new ? "Full name for the new user" : "Full name for " + u.full_name}</Label>
                                <Input
                                  id={"edit-name-" + u.id}
                                  value={editDraft.full_name}
                                  onChange={(e) => { setEditDraft({ ...editDraft, full_name: e.target.value }); if (rowError) setRowError(""); }}
                                  placeholder={u.is_new ? "Name as it appears on the sign-in list" : undefined}
                                  aria-invalid={u.is_new && rowError ? "true" : undefined}
                                  aria-describedby={u.is_new && rowError ? "adm-row-error" : undefined}
                                  className="min-h-[44px] w-full px-2 text-[13px]"
                                  style={fieldStyle}
                                />
                                {u.is_new && rowError && (
                                  <p id="adm-row-error" role="alert" className="mt-2 flex items-start gap-2 px-2 py-2 text-[12px]" style={{ border: "2px solid " + brand.primaryColor, backgroundColor: tint }}>
                                    <AlertCircle className="mt-[2px] h-4 w-4 shrink-0" aria-hidden="true" />
                                    {rowError}
                                  </p>
                                )}
                                {u.is_new && !rowError && (
                                  <p className="mt-2 text-[11px] leading-relaxed" style={{ color: brand.neutralColor }}>
                                    New record — no password is set, identity is picked from the sign-in list.
                                  </p>
                                )}
                              </>
                            ) : (
                              <>
                                <span>{u.full_name}</span>
                                <span className="block text-[11px] uppercase tracking-[0.14em]" style={{ color: brand.neutralColor }}>{u.id}</span>
                              </>
                            )}
                          </TD>
                          <TD className={tdClass}>
                            {editing ? (
                              <>
                                <Label htmlFor={"edit-role-" + u.id} className="sr-only">{u.is_new ? "Role for the new user" : "Role for " + u.full_name}</Label>
                                <Select id={"edit-role-" + u.id} value={editDraft.role} onChange={(e) => setEditDraft({ ...editDraft, role: e.target.value })} className="min-h-[44px] w-full px-2 text-[13px]" style={fieldStyle}>
                                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                                </Select>
                              </>
                            ) : (
                              <span className="text-[11px] uppercase tracking-[0.14em]">{u.role}</span>
                            )}
                          </TD>
                          <TD className={tdClass}>
                            {editing ? (
                              <>
                                <Label htmlFor={"edit-mgr-" + u.id} className="sr-only">{u.is_new ? "Reporting manager for the new user" : "Reporting manager for " + u.full_name}</Label>
                                <Select id={"edit-mgr-" + u.id} value={editDraft.manager_id} onChange={(e) => setEditDraft({ ...editDraft, manager_id: e.target.value })} className="min-h-[44px] w-full px-2 text-[13px]" style={fieldStyle}>
                                  <option value="">Unassigned</option>
                                  {managers.filter((m) => m.id !== u.id).map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                                </Select>
                              </>
                            ) : mgr ? (
                              <span>{mgr}</span>
                            ) : u.role === "Employee" ? (
                              <span className="inline-flex items-center gap-1 text-[12px]" style={{ color: brand.accentColor }}>
                                <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                                Unassigned — approvals have nowhere to go
                              </span>
                            ) : (
                              <span style={{ color: brand.neutralColor }}>—</span>
                            )}
                          </TD>
                          <TD className={tdClass}>{statusBadge(u.is_active)}</TD>
                          <TD className={tdClass} style={num}>{u.created_at}</TD>
                          <TD className={tdClass + " text-right"}>
                            {editing ? (
                              <div className="flex flex-wrap justify-end gap-2">
                                <Button type="button" onClick={() => saveEdit(u)} className="adm-press min-h-[44px] px-3 text-[11px] uppercase tracking-[0.12em]" style={{ ...miniBtn, backgroundColor: brand.primaryColor, color: brand.backgroundColor }}>{u.is_new ? "Create user" : "Save"}</Button>
                                <Button type="button" onClick={() => cancelEdit(u)} className="adm-press min-h-[44px] px-3 text-[11px] uppercase tracking-[0.12em]" style={miniBtn}>{u.is_new ? "Discard" : "Cancel"}</Button>
                              </div>
                            ) : confirmId === u.id ? (
                              <div className="adm-panel flex flex-wrap items-center justify-end gap-2" role="group" aria-label={"Confirm deactivating " + u.full_name}>
                                <span className="text-[12px]">Deactivate {u.full_name}?</span>
                                <Button type="button" onClick={() => toggleActive(u)} className="adm-press min-h-[44px] px-3 text-[11px] uppercase tracking-[0.12em]" style={{ ...miniBtn, backgroundColor: brand.primaryColor, color: brand.backgroundColor }}>Yes, deactivate</Button>
                                <Button type="button" onClick={() => setConfirmId(null)} className="adm-press min-h-[44px] px-3 text-[11px] uppercase tracking-[0.12em]" style={miniBtn}>Keep active</Button>
                              </div>
                            ) : (
                              <div className="flex flex-wrap justify-end gap-2">
                                <Button type="button" onClick={() => startEdit(u)} className="adm-press inline-flex min-h-[44px] items-center gap-1 px-3 text-[11px] uppercase tracking-[0.12em]" style={miniBtn}>
                                  <Edit className="h-3.5 w-3.5" aria-hidden="true" />
                                  Edit
                                </Button>
                                {u.is_active ? (
                                  <Button type="button" onClick={() => setConfirmId(u.id)} className="adm-press min-h-[44px] px-3 text-[11px] uppercase tracking-[0.12em]" style={miniBtn}>Deactivate</Button>
                                ) : (
                                  <Button type="button" onClick={() => toggleActive(u)} className="adm-press min-h-[44px] px-3 text-[11px] uppercase tracking-[0.12em]" style={miniBtn}>Reactivate</Button>
                                )}
                              </div>
                            )}
                          </TD>
                        </TR>
                      );
                    })}
                  </TBody>
                </Table>
              )}
            </div>
            <p className="mt-3 text-[12px]" style={{ color: brand.neutralColor }}>
              Add user opens a blank row at the top of this list. Deactivating removes someone from the sign-in list and ends any session running as them. Press Escape to back out of an edit.
            </p>
          </div>
        </section>

        {/* PANEL 2 — balance adjustments */}
        <section id="adm-panel-balances" role="tabpanel" aria-labelledby="adm-tab-balances" hidden={tab !== "balances"} tabIndex={-1} className="pt-8">
          <h2 className="sr-only">Balance adjustments</h2>

          <form data-wf="b-4-0" onSubmit={submitAdjustment} className="p-6 md:p-8" style={block}>
            <Eyebrow>Correction — leave year 2026</Eyebrow>
            <h3 className="mt-2 text-[30px] leading-none md:text-[36px]" style={{ fontFamily: brand.fontHeading }}>Adjust annual balance</h3>
            <p className="mt-3 max-w-[64ch] text-[13px] leading-relaxed" style={{ color: brand.neutralColor }}>
              Set the remaining annual days for a mid-year joiner or to correct a mistake. Sick leave is uncapped and is never touched here.
            </p>

            <div className="mt-7 grid grid-cols-12 gap-5">
              <div className="col-span-12 md:col-span-6">
                <Label htmlFor="adm-adj-employee" className="mb-2 block text-[11px] uppercase tracking-[0.18em]" style={{ color: brand.neutralColor }}>Employee</Label>
                <Select
                  id="adm-adj-employee"
                  data-wf="i-4-0-0"
                  value={adj.user_id}
                  onChange={(e) => pickEmployee(e.target.value)}
                  aria-invalid={adjErrors.user_id ? "true" : undefined}
                  aria-describedby={adjErrors.user_id ? "adm-adj-employee-err" : "adm-adj-employee-help"}
                  className="min-h-[52px] w-full px-3 text-[13px]"
                  style={fieldStyle}
                >
                  <option value="">Choose a person</option>
                  {users.filter((u) => u.is_active && !u.is_new).map((u) => (
                    <option key={u.id} value={u.id}>{u.full_name} — {(remainingFor(u.id) || 0).toFixed(1)} days remaining</option>
                  ))}
                </Select>
                {adjErrors.user_id ? (
                  <p id="adm-adj-employee-err" role="alert" className="mt-2 flex items-start gap-2 text-[12px]" style={{ color: brand.primaryColor }}>
                    <AlertCircle className="mt-[2px] h-4 w-4 shrink-0" aria-hidden="true" />{adjErrors.user_id}
                  </p>
                ) : (
                  <p id="adm-adj-employee-help" className="mt-2 text-[12px]" style={{ color: brand.neutralColor }}>Deactivated people are not listed.</p>
                )}
              </div>

              <div className="col-span-6 md:col-span-3">
                <Label htmlFor="adm-adj-year" className="mb-2 block text-[11px] uppercase tracking-[0.18em]" style={{ color: brand.neutralColor }}>Year</Label>
                <Input id="adm-adj-year" data-wf="i-4-0-1" value={adj.year} readOnly aria-describedby="adm-adj-year-help" className="min-h-[52px] w-full px-3 text-[13px]" style={{ ...fieldStyle, ...num, backgroundColor: "color-mix(in srgb, " + brand.neutralColor + " 10%, transparent)" }} />
                <p id="adm-adj-year-help" className="mt-2 text-[12px]" style={{ color: brand.neutralColor }}>Resets 1 Jan. No carryover.</p>
              </div>

              <div className="col-span-6 md:col-span-3">
                <Label htmlFor="adm-adj-days" className="mb-2 block text-[11px] uppercase tracking-[0.18em]" style={{ color: brand.neutralColor }}>New remaining annual days</Label>
                <Input
                  id="adm-adj-days"
                  data-wf="i-4-0-2"
                  inputMode="decimal"
                  value={adj.days}
                  onChange={(e) => { setAdj({ ...adj, days: e.target.value }); setSaved(null); }}
                  aria-invalid={adjErrors.days ? "true" : undefined}
                  aria-describedby={adjErrors.days ? "adm-adj-days-err" : "adm-adj-days-help"}
                  className="min-h-[52px] w-full px-3 text-[13px]"
                  style={{ ...fieldStyle, ...num }}
                />
                {adjErrors.days ? (
                  <p id="adm-adj-days-err" role="alert" className="mt-2 flex items-start gap-2 text-[12px]">
                    <AlertCircle className="mt-[2px] h-4 w-4 shrink-0" aria-hidden="true" />{adjErrors.days}
                  </p>
                ) : (
                  <p id="adm-adj-days-help" className="mt-2 text-[12px]" style={{ color: brand.neutralColor }}>Out of 20 allocated.</p>
                )}
              </div>

              <div className="col-span-12">
                <Label htmlFor="adm-adj-note" className="mb-2 block text-[11px] uppercase tracking-[0.18em]" style={{ color: brand.neutralColor }}>Adjustment note</Label>
                <Textarea
                  id="adm-adj-note"
                  data-wf="i-4-0-3"
                  rows={3}
                  value={adj.note}
                  onChange={(e) => { setAdj({ ...adj, note: e.target.value }); setSaved(null); }}
                  placeholder="Pro-rata entitlement for a start date of 06 Oct 2026"
                  aria-invalid={adjErrors.note ? "true" : undefined}
                  aria-describedby={adjErrors.note ? "adm-adj-note-err" : undefined}
                  className="w-full px-3 py-3 text-[13px] leading-relaxed"
                  style={fieldStyle}
                />
                {adjErrors.note && (
                  <p id="adm-adj-note-err" role="alert" className="mt-2 flex items-start gap-2 text-[12px]">
                    <AlertCircle className="mt-[2px] h-4 w-4 shrink-0" aria-hidden="true" />{adjErrors.note}
                  </p>
                )}
              </div>
            </div>

            {adj.user_id && balances[adj.user_id] && (
              <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 px-4 py-3 text-[12px]" style={{ border: "2px dashed " + brand.primaryColor, ...num }}>
                <span><span style={{ color: brand.neutralColor }}>Allocated</span> {balances[adj.user_id].allocated_days.toFixed(1)}</span>
                <span><span style={{ color: brand.neutralColor }}>Approved annual taken</span> {balances[adj.user_id].approved_annual_days.toFixed(1)}</span>
                <span><span style={{ color: brand.neutralColor }}>Current adjustment</span> {(balances[adj.user_id].adjustment_days >= 0 ? "+" : "") + balances[adj.user_id].adjustment_days.toFixed(1)}</span>
                <span><span style={{ color: brand.neutralColor }}>Remaining now</span> {(remainingFor(adj.user_id) || 0).toFixed(1)}</span>
              </div>
            )}

            {saved && (
              <p role="status" className="adm-panel mt-6 flex items-start gap-2 px-4 py-3 text-[13px]" style={{ border: "3px solid " + brand.accentColor, color: brand.primaryColor, backgroundColor: tint }}>
                <CheckCircle className="mt-[2px] h-4 w-4 shrink-0" aria-hidden="true" style={{ color: brand.accentColor }} />
                <span style={num}>Saved. {saved.name} now has {saved.days} annual days remaining for 2026 (was {saved.was}). The entry is in the audit log.</span>
              </p>
            )}

            {/* Row 6 */}
            <div className="mt-8 grid grid-cols-12 items-center gap-5">
              <div className="col-span-12 md:col-span-4">
                <Button
                  data-wf="b-5-0"
                  type="submit"
                  disabled={saving}
                  aria-busy={saving}
                  className="adm-press flex min-h-[56px] w-full items-center justify-center gap-2 px-6 text-[13px] uppercase tracking-[0.14em] disabled:cursor-wait"
                  style={{ ...primaryBtn, opacity: saving ? 0.75 : 1 }}
                >
                  {saving ? <Clock className="h-4 w-4 animate-pulse" aria-hidden="true" /> : <Check className="h-4 w-4" aria-hidden="true" />}
                  {saving ? "Writing to audit log…" : "Save adjustment"}
                </Button>
              </div>
              <p data-wf="b-5-1" className="col-span-12 text-[12px] leading-relaxed md:col-span-8" style={{ color: brand.neutralColor }}>
                Every adjustment is written to the audit log with your identity, a timestamp and the note.
              </p>
            </div>
          </form>
        </section>

        {/* PANEL 3 — audit log */}
        <section id="adm-panel-audit" role="tabpanel" aria-labelledby="adm-tab-audit" hidden={tab !== "audit"} tabIndex={-1} className="pt-8">
          <h2 className="sr-only">Audit log</h2>

          <div data-wf="b-6-0">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="text-[30px] leading-none md:text-[36px]" style={{ fontFamily: brand.fontHeading }}>Audit log</h3>
              <p className="text-[11px] uppercase tracking-[0.16em]" style={{ ...num, color: brand.neutralColor }}>
                {audit.length} entries · newest first · read-only
              </p>
            </div>
            <p className="mt-3 max-w-[66ch] text-[13px] leading-relaxed" style={{ color: brand.neutralColor }}>
              Submissions, approve and reject decisions with their comment, and balance adjustments. Visible to HR/Admin only.
            </p>

            <div className="mt-5 overflow-x-auto" style={block}>
              {audit.length === 0 ? (
                <div className="p-8">
                  <Empty
                    title="Nothing logged yet"
                    description="The first entry appears as soon as someone submits a request, a manager decides on one, or you adjust a balance."
                  />
                </div>
              ) : (
                <Table className="w-full border-collapse text-left" style={num}>
                  <caption className="sr-only">Audit entries with timestamp, acting user, action type, leave request and detail</caption>
                  <THead>
                    <TR>
                      <TH data-wf="i-6-0-0" scope="col" className={thClass} style={thStyle}>Timestamp</TH>
                      <TH data-wf="i-6-0-1" scope="col" className={thClass} style={thStyle}>Acting user</TH>
                      <TH data-wf="i-6-0-2" scope="col" className={thClass} style={thStyle}>Action type</TH>
                      <TH data-wf="i-6-0-3" scope="col" className={thClass} style={thStyle}>Leave request</TH>
                      <TH data-wf="i-6-0-4" scope="col" className={thClass} style={thStyle}>Detail</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {audit.map((a) => (
                      <TR key={a.id} className={"adm-row transition-colors " + (freshAuditIds.includes(a.id) ? "adm-in" : "")} style={{ borderBottom: "1px solid " + hair }}>
                        <TD className={tdClass + " whitespace-nowrap"}>{a.created_at}</TD>
                        <TD className={tdClass + " whitespace-nowrap"}>{a.actor}</TD>
                        <TD className={tdClass}>
                          <span className="inline-block px-2 py-1 text-[11px] uppercase tracking-[0.12em]" style={{ border: "2px solid " + brand.primaryColor }}>
                            {a.action_type}
                          </span>
                        </TD>
                        <TD className={tdClass + " whitespace-nowrap"}>
                          {a.leave_request_id ? a.leave_request_id : <span style={{ color: brand.neutralColor }}>—</span>}
                        </TD>
                        <TD className={tdClass + " max-w-[46ch] leading-relaxed"}>{a.detail}</TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              )}
            </div>

            <p className="mt-3 flex items-center gap-2 text-[12px]" style={{ color: brand.neutralColor }}>
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              Entries are written as actions happen. This view was loaded at 09:41 and does not refresh on its own.
            </p>
          </div>
        </section>

        {/* Row 8 — link */}
        <div className="mt-12" style={{ borderTop: "3px solid " + brand.primaryColor }}>
          <button
            data-wf="b-7-0"
            type="button"
            onClick={() => navigate("getting-started")}
            className="adm-press group mt-6 inline-flex min-h-[48px] items-center gap-3 px-4 py-3 text-[13px]"
            style={{ border: "3px solid " + brand.primaryColor, borderRadius: brand.radius, backgroundColor: "transparent", color: brand.primaryColor }}
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            <span className="underline decoration-2 underline-offset-4">HR administration steps in Getting Started</span>
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" style={{ color: brand.accentColor }} />
          </button>
        </div>
      </div>
    </div>
  );
}
