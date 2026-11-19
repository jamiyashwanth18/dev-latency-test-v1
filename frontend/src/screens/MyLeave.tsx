// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.

import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";

const {
  Button,
  Card,
  CardContent,
  Input,
  Textarea,
  Label,
  Select,
  Badge,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
  Separator,
  Empty,
} = UI;

const { Plus, Check, X, Bell, Clock, ArrowRight, AlertCircle, CheckCircle } = Icons;

const ME = {
  id: "u-004",
  full_name: "Sam Okafor",
  role: "Employee",
  manager_name: "Priya Nair",
  session_expires: "18:00 GMT",
  last_synced: "09:12",
};

const TODAY = "2026-02-19";
const YEAR = 2026;
const ALLOCATED_DAYS = 20;
const ADJUSTMENT_DAYS = 0;

const SEED_REQUESTS = [
  {
    id: "LR-2110",
    start_date: "2026-04-20",
    end_date: "2026-04-24",
    leave_type: "annual",
    reason: "Walking the Pennine Way with my brother.",
    working_days: 5,
    status: "Pending",
    has_overlap: false,
    manager_comment: "",
    decided_by: "",
    decided_at: "",
    created_at: "2026-02-18",
  },
  {
    id: "LR-2101",
    start_date: "2026-03-12",
    end_date: "2026-03-13",
    leave_type: "annual",
    reason: "Moving flat — van booked for the Thursday.",
    working_days: 2,
    status: "Pending",
    has_overlap: false,
    manager_comment: "",
    decided_by: "",
    decided_at: "",
    created_at: "2026-02-17",
  },
  {
    id: "LR-2088",
    start_date: "2026-03-02",
    end_date: "2026-03-06",
    leave_type: "annual",
    reason: "Family visit in Manchester.",
    working_days: 5,
    status: "Approved",
    has_overlap: false,
    manager_comment: "Approved — Mehdi covers the Tuesday standup.",
    decided_by: "Priya Nair",
    decided_at: "2026-02-18",
    created_at: "2026-02-16",
  },
  {
    id: "LR-2052",
    start_date: "2026-02-09",
    end_date: "2026-02-10",
    leave_type: "annual",
    reason: "Long weekend in Lisbon.",
    working_days: 2,
    status: "Rejected",
    has_overlap: true,
    manager_comment:
      "Rejected — both of us can't be out during the Q1 close. Try the week after and I'll sign it off.",
    decided_by: "Priya Nair",
    decided_at: "2026-02-02",
    created_at: "2026-01-30",
  },
  {
    id: "LR-2064",
    start_date: "2026-01-27",
    end_date: "2026-01-29",
    leave_type: "sick",
    reason: "Chest infection — GP note filed with HR.",
    working_days: 3,
    status: "Approved",
    has_overlap: false,
    manager_comment: "Get well. Logged as sick, not deducted from your annual.",
    decided_by: "Priya Nair",
    decided_at: "2026-01-29",
    created_at: "2026-01-27",
  },
  {
    id: "LR-2041",
    start_date: "2026-01-02",
    end_date: "2026-01-02",
    leave_type: "annual",
    reason: "Bridging day after New Year.",
    working_days: 1,
    status: "Approved",
    has_overlap: false,
    manager_comment: "Approved. Nothing in the diary that Friday.",
    decided_by: "Priya Nair",
    decided_at: "2025-12-19",
    created_at: "2025-12-18",
  },
];

const SEED_NOTIFICATIONS = [
  {
    id: "n-0091",
    type: "decision",
    leave_request_id: "LR-2088",
    text: "Your request for 2–6 Mar 2026 was approved by Priya Nair on 18 Feb 2026.",
    is_read: false,
  },
  {
    id: "n-0088",
    type: "decision",
    leave_request_id: "LR-2052",
    text: "Your request for 9–10 Feb 2026 was rejected by Priya Nair on 2 Feb 2026 — “both of us can't be out during the Q1 close”.",
    is_read: false,
  },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parseDay(iso) {
  const parts = String(iso).split("-");
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

function countWorkingDays(startIso, endIso) {
  if (!startIso || !endIso) return 0;
  const start = parseDay(startIso);
  const end = parseDay(endIso);
  if (end < start) return 0;
  let days = 0;
  const cursor = new Date(start.getTime());
  while (cursor <= end) {
    const dow = cursor.getDay();
    if (dow !== 0 && dow !== 6) days += 1;
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

function fmtDay(iso) {
  if (!iso) return "—";
  const d = parseDay(iso);
  return d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear();
}

function fmtRange(startIso, endIso) {
  if (!startIso || !endIso) return "—";
  const a = parseDay(startIso);
  const b = parseDay(endIso);
  if (startIso === endIso) return fmtDay(startIso);
  if (a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()) {
    return a.getDate() + "–" + b.getDate() + " " + MONTHS[b.getMonth()] + " " + b.getFullYear();
  }
  if (a.getFullYear() === b.getFullYear()) {
    return (
      a.getDate() +
      " " +
      MONTHS[a.getMonth()] +
      " – " +
      b.getDate() +
      " " +
      MONTHS[b.getMonth()] +
      " " +
      b.getFullYear()
    );
  }
  return fmtDay(startIso) + " – " + fmtDay(endIso);
}

function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return parseDay(aStart) <= parseDay(bEnd) && parseDay(bStart) <= parseDay(aEnd);
}

export default function Screen() {
  const navigate = useNavigate();
  const ink = brand.primaryColor;
  const cream = brand.backgroundColor;
  const blue = brand.accentColor;
  const neutral = brand.neutralColor;

  const hardBox = {
    border: "3px solid " + ink,
    borderRadius: 0,
    boxShadow: "6px 6px 0 " + ink,
    backgroundColor: cream,
  };
  const mono = { fontFamily: brand.fontBody, fontVariantNumeric: "tabular-nums" };
  const serif = { fontFamily: brand.fontHeading };

  const [requests, setRequests] = React.useState(SEED_REQUESTS);
  const [notifications, setNotifications] = React.useState(SEED_NOTIFICATIONS);
  const [form, setForm] = React.useState({
    start_date: "2026-03-11",
    end_date: "2026-03-17",
    leave_type: "annual",
    reason: "Driving my mother to her clinic appointments in Leeds.",
  });
  const [errors, setErrors] = React.useState({});
  const [banner, setBanner] = React.useState(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [newRowId, setNewRowId] = React.useState(null);
  const [nextNumber, setNextNumber] = React.useState(2114);
  const timerRef = React.useRef(null);

  React.useEffect(function () {
    return function () {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const approvedAnnualDays = requests.reduce(function (sum, r) {
    const inYear = parseDay(r.start_date).getFullYear() === YEAR;
    return r.status === "Approved" && r.leave_type === "annual" && inYear
      ? sum + r.working_days
      : sum;
  }, 0);

  const approvedSickDays = requests.reduce(function (sum, r) {
    const inYear = parseDay(r.start_date).getFullYear() === YEAR;
    return r.status === "Approved" && r.leave_type === "sick" && inYear
      ? sum + r.working_days
      : sum;
  }, 0);

  const remaining = Math.max(0, ALLOCATED_DAYS + ADJUSTMENT_DAYS - approvedAnnualDays);

  const draftDays = React.useMemo(
    function () {
      return countWorkingDays(form.start_date, form.end_date);
    },
    [form.start_date, form.end_date],
  );

  const overlapWith = React.useMemo(
    function () {
      if (!form.start_date || !form.end_date) return null;
      if (parseDay(form.end_date) < parseDay(form.start_date)) return null;
      const hit = requests.filter(function (r) {
        return (
          (r.status === "Pending" || r.status === "Approved") &&
          rangesOverlap(form.start_date, form.end_date, r.start_date, r.end_date)
        );
      });
      return hit.length ? hit[0] : null;
    },
    [form.start_date, form.end_date, requests],
  );

  const unread = notifications.filter(function (n) {
    return !n.is_read;
  });

  function setField(name, value) {
    setForm(function (prev) {
      const next = Object.assign({}, prev);
      next[name] = value;
      return next;
    });
    setErrors(function (prev) {
      if (!prev[name]) return prev;
      const next = Object.assign({}, prev);
      delete next[name];
      return next;
    });
  }

  function markRead(id) {
    setNotifications(function (prev) {
      return prev.map(function (n) {
        return n.id === id ? Object.assign({}, n, { is_read: true }) : n;
      });
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    const next = {};
    if (!form.start_date) next.start_date = "Pick a start date.";
    if (!form.end_date) next.end_date = "Pick an end date.";
    if (form.start_date && parseDay(form.start_date) < parseDay(TODAY)) {
      next.start_date =
        fmtDay(form.start_date) + " has already passed. Backdated leave goes through HR.";
    }
    if (form.start_date && form.end_date && parseDay(form.end_date) < parseDay(form.start_date)) {
      next.end_date = "End date falls before the start date.";
    }
    if (!form.leave_type) next.leave_type = "Choose annual or sick.";
    if (!form.reason.trim()) next.reason = "Add a reason — Priya Nair reads this before deciding.";
    if (!Object.keys(next).length && draftDays === 0) {
      next.end_date =
        "That range is weekend only. Leave is counted in whole working days, Mon–Fri.";
    }

    if (Object.keys(next).length) {
      setErrors(next);
      setBanner({
        kind: "error",
        title: "Not filed yet",
        body:
          Object.keys(next).length === 1
            ? "One field needs completing. Nothing you typed has been lost."
            : Object.keys(next).length +
              " fields need completing. Nothing you typed has been lost.",
      });
      return;
    }

    setErrors({});
    setBanner(null);
    setSubmitting(true);
    timerRef.current = setTimeout(function () {
      const id = "LR-" + nextNumber;
      const created = {
        id: id,
        start_date: form.start_date,
        end_date: form.end_date,
        leave_type: form.leave_type,
        reason: form.reason.trim(),
        working_days: draftDays,
        status: "Pending",
        has_overlap: !!overlapWith,
        manager_comment: "",
        decided_by: "",
        decided_at: "",
        created_at: TODAY,
      };
      setRequests(function (prev) {
        return [created].concat(prev);
      });
      setNextNumber(nextNumber + 1);
      setNewRowId(id);
      setSubmitting(false);
      setBanner({
        kind: "success",
        title: "Filed as " + id,
        body:
          fmtRange(created.start_date, created.end_date) +
          " · " +
          draftDays +
          " working day" +
          (draftDays === 1 ? "" : "s") +
          " · waiting on Priya Nair.",
      });
      setForm({ start_date: "", end_date: "", leave_type: "annual", reason: "" });
    }, 850);
  }

  const css =
    "@keyframes bsRowIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}" +
    "@keyframes bsBannerIn{from{opacity:0;transform:translate(-4px,-4px)}to{opacity:1;transform:none}}" +
    ".bs-row-in{animation:bsRowIn .4s ease-out both}" +
    ".bs-banner-in{animation:bsBannerIn .3s ease-out both}" +
    ".bs-focus:focus-visible{outline:3px solid " +
    blue +
    ";outline-offset:3px}" +
    ".bs-press{transition:transform .08s ease-out,box-shadow .08s ease-out}" +
    ".bs-press:hover{transform:translate(-1px,-1px);box-shadow:7px 7px 0 " +
    ink +
    "}" +
    ".bs-press:active{transform:translate(3px,3px);box-shadow:2px 2px 0 " +
    ink +
    "}" +
    ".bs-link{transition:background-color .12s ease-out}" +
    ".bs-link:hover{background-color:" +
    blue +
    ";color:" +
    cream +
    "}" +
    ".bs-ghost{transition:background-color .12s ease-out,color .12s ease-out}" +
    ".bs-ghost:hover{background-color:" +
    ink +
    ";color:" +
    cream +
    "}" +
    "@media (prefers-reduced-motion: reduce){*{animation-duration:.001ms !important;transition-duration:.001ms !important}}";

  const inputStyle = {
    border: "3px solid " + ink,
    borderRadius: 0,
    backgroundColor: cream,
    color: ink,
    fontFamily: brand.fontBody,
    fontVariantNumeric: "tabular-nums",
    minHeight: 48,
    width: "100%",
    padding: "8px 12px",
    fontSize: 14,
  };

  function Label2(props) {
    return (
      <Label
        htmlFor={props.htmlFor}
        className="block mb-2 uppercase tracking-[0.18em]"
        style={{ fontFamily: brand.fontBody, fontSize: 11, fontWeight: 700, color: ink }}
      >
        {props.children}
      </Label>
    );
  }

  function FieldError(props) {
    if (!props.message) return null;
    return (
      <p
        id={props.id}
        role="alert"
        className="mt-2 flex items-start gap-2"
        style={Object.assign({ fontSize: 12, color: ink }, mono)}
      >
        <AlertCircle aria-hidden="true" className="h-4 w-4 shrink-0 mt-[1px]" />
        <span>{props.message}</span>
      </p>
    );
  }

  function StatusCell(props) {
    const s = props.status;
    const base = {
      border: "2px solid " + ink,
      borderRadius: 0,
      fontFamily: brand.fontBody,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.1em",
      padding: "3px 8px",
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      whiteSpace: "nowrap",
    };
    if (s === "Approved") {
      return (
        <span style={Object.assign({}, base, { backgroundColor: ink, color: cream })}>
          <Check aria-hidden="true" className="h-3.5 w-3.5" />
          APPROVED
        </span>
      );
    }
    if (s === "Rejected") {
      return (
        <span
          style={Object.assign({}, base, {
            backgroundColor: cream,
            color: ink,
            textDecoration: "line-through",
          })}
        >
          <X aria-hidden="true" className="h-3.5 w-3.5" />
          REJECTED
        </span>
      );
    }
    return (
      <span
        style={Object.assign({}, base, {
          backgroundColor: cream,
          color: ink,
          borderStyle: "dashed",
        })}
      >
        <Clock aria-hidden="true" className="h-3.5 w-3.5" />
        PENDING
      </span>
    );
  }

  const ledger = [];
  for (let i = 0; i < ALLOCATED_DAYS; i++) {
    const used = i >= remaining;
    ledger.push(
      <span
        key={i}
        aria-hidden="true"
        style={{
          width: 18,
          height: 26,
          border: "2px solid " + ink,
          backgroundColor: used ? "transparent" : blue,
          backgroundImage: used
            ? "repeating-linear-gradient(45deg," + ink + " 0 1px, transparent 1px 5px)"
            : "none",
          display: "block",
        }}
      />,
    );
  }

  return (
    <div
      style={{ backgroundColor: cream, color: ink, fontFamily: brand.fontBody }}
      className="w-full"
    >
      <style>{css}</style>

      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 py-10">
        {/* ── b-0-0 ─────────────────────────────────────────── */}
        <header data-wf="b-0-0" className="mb-12">
          <p
            className="uppercase tracking-[0.3em]"
            style={Object.assign({ fontSize: 11, color: neutral }, mono)}
          >
            Leave ledger · {YEAR}
          </p>
          <h1
            className="mt-3 leading-[0.95]"
            style={Object.assign(
              { fontSize: 52, fontWeight: 400, letterSpacing: "-0.02em" },
              serif,
            )}
          >
            My Leave
          </h1>
          <p className="mt-4" style={Object.assign({ fontSize: 14, color: ink }, mono)}>
            Sam Okafor <span style={{ color: neutral }}>(Employee)</span> · reports to Priya Nair
          </p>
          <div
            className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2"
            style={Object.assign({ fontSize: 11, color: neutral }, mono)}
          >
            <span className="inline-flex items-center gap-2">
              <span
                aria-hidden="true"
                style={{ width: 8, height: 8, backgroundColor: blue, display: "block" }}
              />
              SESSION ACTIVE · ENDS {ME.session_expires}
            </span>
            <span aria-hidden="true">/</span>
            <span>SYNCED {ME.last_synced} — REFRESHES WHEN YOU FILE</span>
          </div>
          <div style={{ borderTop: "3px solid " + ink }} className="mt-6" />
        </header>

        {/* ── Row 2: balances ───────────────────────────────── */}
        <div className="grid grid-cols-12 gap-6 mb-12">
          <Card data-wf="b-1-0" className="col-span-12 md:col-span-6" style={hardBox}>
            <CardContent className="p-7">
              <h2
                className="uppercase tracking-[0.2em]"
                style={Object.assign({ fontSize: 11, fontWeight: 700 }, mono)}
              >
                01 / Annual leave remaining
              </h2>
              <p className="mt-5 flex items-baseline gap-3">
                <span
                  style={Object.assign({ fontSize: 68, lineHeight: 1, color: blue }, serif, {
                    fontVariantNumeric: "tabular-nums",
                  })}
                >
                  {remaining}
                </span>
                <span style={Object.assign({ fontSize: 16 }, mono)}>of {ALLOCATED_DAYS} days</span>
              </p>
              <div
                className="mt-6 flex flex-wrap gap-[3px]"
                role="img"
                aria-label={
                  remaining + " of " + ALLOCATED_DAYS + " annual leave days remaining in " + YEAR
                }
              >
                {ledger}
              </div>
              <p
                className="mt-5"
                style={Object.assign({ fontSize: 12, color: neutral, lineHeight: 1.6 }, mono)}
              >
                {approvedAnnualDays} day{approvedAnnualDays === 1 ? "" : "s"} approved so far in{" "}
                {YEAR}. The allowance resets each 1 January — nothing carries over.
              </p>
            </CardContent>
          </Card>

          <Card data-wf="b-1-1" className="col-span-12 md:col-span-6" style={hardBox}>
            <CardContent className="p-7">
              <h2
                className="uppercase tracking-[0.2em]"
                style={Object.assign({ fontSize: 11, fontWeight: 700 }, mono)}
              >
                02 / Sick leave taken
              </h2>
              <p className="mt-5 flex items-baseline gap-3">
                <span
                  style={Object.assign({ fontSize: 68, lineHeight: 1 }, serif, {
                    fontVariantNumeric: "tabular-nums",
                  })}
                >
                  {approvedSickDays}
                </span>
                <span style={Object.assign({ fontSize: 16 }, mono)}>days</span>
              </p>
              <div style={{ borderTop: "1px dashed " + ink, opacity: 0.4 }} className="mt-7" />
              <p
                className="mt-5"
                style={Object.assign({ fontSize: 12, color: ink, lineHeight: 1.6 }, mono)}
              >
                Tracked separately and uncapped — it does not reduce the 20 annual days.
              </p>
              <p
                className="mt-3"
                style={Object.assign({ fontSize: 12, color: neutral, lineHeight: 1.6 }, mono)}
              >
                Your sick-leave reasons are readable only by you, Priya Nair and HR.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ── b-2-0 (notifications) ─────────────────────────── */}
        <section data-wf="b-2-0" className="mb-12" aria-labelledby="activity-heading">
          <h2
            id="activity-heading"
            className="uppercase tracking-[0.2em] mb-4"
            style={Object.assign({ fontSize: 11, fontWeight: 700 }, mono)}
          >
            03 / Activity for you
          </h2>
          {unread.length > 0 ? (
            <ul className="list-none p-0 m-0" style={{ border: "3px solid " + ink }}>
              {unread.map(function (n, idx) {
                return (
                  <li
                    key={n.id}
                    className="flex flex-col sm:flex-row sm:items-start gap-4 p-5"
                    style={{ borderTop: idx === 0 ? "none" : "1px solid " + ink }}
                  >
                    <Bell aria-hidden="true" className="h-5 w-5 shrink-0" style={{ color: blue }} />
                    <p
                      className="flex-1 m-0"
                      style={Object.assign({ fontSize: 14, lineHeight: 1.6 }, mono)}
                    >
                      <span className="sr-only">Notification: </span>
                      {n.text}
                    </p>
                    <button
                      type="button"
                      onClick={function () {
                        markRead(n.id);
                      }}
                      className="bs-focus bs-ghost shrink-0 uppercase tracking-[0.14em] px-3 py-2"
                      style={Object.assign(
                        {
                          border: "2px solid " + ink,
                          borderRadius: 0,
                          fontSize: 11,
                          fontWeight: 700,
                          minHeight: 44,
                          backgroundColor: cream,
                          color: ink,
                        },
                        mono,
                      )}
                    >
                      Mark read
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p
              className="flex items-center gap-3 p-5"
              style={Object.assign(
                { border: "1px dashed " + ink, fontSize: 13, color: neutral },
                mono,
              )}
            >
              <Bell aria-hidden="true" className="h-4 w-4" />
              Nothing new since 18 Feb 2026. Decisions from Priya Nair land here — the app never
              emails you.
            </p>
          )}
        </section>

        {/* ── Form: b-3-0 fields, b-4-x, b-5-x ──────────────── */}
        <form onSubmit={handleSubmit} noValidate className="mb-16">
          <section
            data-wf="b-3-0"
            aria-labelledby="request-heading"
            style={Object.assign({}, hardBox, { boxShadow: "8px 8px 0 " + ink })}
            className="p-7 sm:p-9"
          >
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2
                id="request-heading"
                style={Object.assign({ fontSize: 34, lineHeight: 1 }, serif)}
              >
                Request leave
              </h2>
              <p
                className="uppercase tracking-[0.2em]"
                style={Object.assign({ fontSize: 11, color: neutral }, mono)}
              >
                04 / Goes to Priya Nair
              </p>
            </div>

            <div style={{ borderTop: "3px solid " + ink }} className="mt-5 mb-7" />

            {banner ? (
              <div
                className="bs-banner-in mb-7 p-5 flex items-start gap-3"
                role="status"
                style={{
                  border: "3px solid " + ink,
                  backgroundColor: banner.kind === "success" ? ink : cream,
                  color: banner.kind === "success" ? cream : ink,
                  borderStyle: banner.kind === "success" ? "solid" : "dashed",
                }}
              >
                {banner.kind === "success" ? (
                  <CheckCircle aria-hidden="true" className="h-5 w-5 shrink-0 mt-[2px]" />
                ) : (
                  <AlertCircle aria-hidden="true" className="h-5 w-5 shrink-0 mt-[2px]" />
                )}
                <span>
                  <strong
                    className="block uppercase tracking-[0.16em]"
                    style={Object.assign({ fontSize: 11 }, mono)}
                  >
                    {banner.title}
                  </strong>
                  <span
                    className="block mt-2"
                    style={Object.assign({ fontSize: 13, lineHeight: 1.6 }, mono)}
                  >
                    {banner.body}
                  </span>
                </span>
              </div>
            ) : null}

            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 sm:col-span-4">
                <Label2 htmlFor="start_date">Start date</Label2>
                <Input
                  data-wf="i-3-0-0"
                  id="start_date"
                  name="start_date"
                  type="date"
                  className="bs-focus"
                  style={inputStyle}
                  value={form.start_date}
                  aria-invalid={errors.start_date ? "true" : undefined}
                  aria-describedby={errors.start_date ? "start_date-error" : undefined}
                  onChange={function (e) {
                    setField("start_date", e.target.value);
                  }}
                />
                <FieldError id="start_date-error" message={errors.start_date} />
              </div>

              <div className="col-span-12 sm:col-span-4">
                <Label2 htmlFor="end_date">End date</Label2>
                <Input
                  data-wf="i-3-0-1"
                  id="end_date"
                  name="end_date"
                  type="date"
                  className="bs-focus"
                  style={inputStyle}
                  value={form.end_date}
                  aria-invalid={errors.end_date ? "true" : undefined}
                  aria-describedby={errors.end_date ? "end_date-error" : undefined}
                  onChange={function (e) {
                    setField("end_date", e.target.value);
                  }}
                />
                <FieldError id="end_date-error" message={errors.end_date} />
              </div>

              <div className="col-span-12 sm:col-span-4">
                <Label2 htmlFor="leave_type">Leave type</Label2>
                <Select
                  data-wf="i-3-0-2"
                  id="leave_type"
                  name="leave_type"
                  className="bs-focus"
                  style={inputStyle}
                  value={form.leave_type}
                  aria-invalid={errors.leave_type ? "true" : undefined}
                  aria-describedby={errors.leave_type ? "leave_type-error" : "leave_type-hint"}
                  onChange={function (e) {
                    setField("leave_type", e.target.value);
                  }}
                >
                  <option value="annual">Annual</option>
                  <option value="sick">Sick</option>
                </Select>
                <p
                  id="leave_type-hint"
                  className="mt-2"
                  style={Object.assign({ fontSize: 12, color: neutral }, mono)}
                >
                  Sick leave never touches the 20-day balance.
                </p>
                <FieldError id="leave_type-error" message={errors.leave_type} />
              </div>

              <div className="col-span-12">
                <Label2 htmlFor="reason">Reason</Label2>
                <Textarea
                  data-wf="i-3-0-3"
                  id="reason"
                  name="reason"
                  rows={3}
                  className="bs-focus"
                  style={Object.assign({}, inputStyle, {
                    minHeight: 104,
                    lineHeight: 1.6,
                    resize: "vertical",
                  })}
                  placeholder="A line is enough — Priya Nair reads this before deciding."
                  value={form.reason}
                  aria-invalid={errors.reason ? "true" : undefined}
                  aria-describedby={errors.reason ? "reason-error" : "reason-hint"}
                  onChange={function (e) {
                    setField("reason", e.target.value);
                  }}
                />
                <p
                  id="reason-hint"
                  className="mt-2"
                  style={Object.assign({ fontSize: 12, color: neutral, lineHeight: 1.6 }, mono)}
                >
                  For sick leave, only you, Priya Nair and HR can read this. It is never shown on
                  the team calendar.
                </p>
                <FieldError id="reason-error" message={errors.reason} />
              </div>
            </div>
          </section>

          {/* ── Row 5 ───────────────────────────────────────── */}
          <div className="grid grid-cols-12 gap-6 mt-8">
            <div
              data-wf="b-4-0"
              className="col-span-12 md:col-span-7 p-5"
              style={{ border: "1px solid " + ink, borderLeft: "3px solid " + blue }}
              aria-live="polite"
            >
              <p
                className="uppercase tracking-[0.2em]"
                style={Object.assign({ fontSize: 11, color: neutral }, mono)}
              >
                Length
              </p>
              <p className="mt-2" style={Object.assign({ fontSize: 15, lineHeight: 1.6 }, mono)}>
                {form.start_date &&
                form.end_date &&
                parseDay(form.end_date) >= parseDay(form.start_date) ? (
                  <React.Fragment>
                    <strong style={{ fontSize: 22 }}>{draftDays}</strong> working day
                    {draftDays === 1 ? "" : "s"}{" "}
                    <span style={{ color: neutral }}>
                      (Mon–Fri only; weekends not counted, no half-days, no public holidays in v1).
                    </span>
                  </React.Fragment>
                ) : (
                  <span style={{ color: neutral }}>
                    Pick both dates and the length appears here, counted Mon–Fri in whole days.
                  </span>
                )}
              </p>
              {form.leave_type === "annual" && draftDays > remaining && draftDays > 0 ? (
                <p
                  className="mt-3 flex items-start gap-2"
                  style={Object.assign({ fontSize: 12, lineHeight: 1.6 }, mono)}
                >
                  <AlertCircle aria-hidden="true" className="h-4 w-4 shrink-0 mt-[2px]" />
                  <span>
                    That is {draftDays - remaining} day{draftDays - remaining === 1 ? "" : "s"} more
                    than your {remaining} remaining — Priya Nair cannot approve beyond the balance.
                  </span>
                </p>
              ) : null}
            </div>

            <div
              data-wf="b-4-1"
              className="col-span-12 md:col-span-5 p-5"
              style={{
                border: overlapWith ? "3px solid " + ink : "1px solid " + ink,
                backgroundColor: cream,
              }}
              aria-live="polite"
            >
              <p
                className="uppercase tracking-[0.2em]"
                style={Object.assign({ fontSize: 11, color: neutral }, mono)}
              >
                Overlap check
              </p>
              {overlapWith ? (
                <p
                  className="mt-2 flex items-start gap-2"
                  style={Object.assign({ fontSize: 13, lineHeight: 1.6 }, mono)}
                >
                  <AlertCircle
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 mt-[3px]"
                    style={{ color: blue }}
                  />
                  <span>
                    <strong>Overlap flagged:</strong> these dates overlap your{" "}
                    {overlapWith.status.toLowerCase()} request{" "}
                    {fmtRange(overlapWith.start_date, overlapWith.end_date)} ({overlapWith.id}). You
                    can still file it — Priya Nair sees the flag too.
                  </span>
                </p>
              ) : (
                <p
                  className="mt-2 flex items-start gap-2"
                  style={Object.assign({ fontSize: 13, lineHeight: 1.6, color: neutral }, mono)}
                >
                  <Check aria-hidden="true" className="h-4 w-4 shrink-0 mt-[3px]" />
                  <span>
                    Clear — these dates do not overlap any pending or approved request of yours.
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* ── Row 6 ───────────────────────────────────────── */}
          <div className="grid grid-cols-12 gap-6 mt-8 items-center">
            <div className="col-span-12 md:col-span-4">
              <Button
                data-wf="b-5-0"
                type="submit"
                disabled={submitting}
                className="bs-focus bs-press w-full uppercase tracking-[0.18em] inline-flex items-center justify-center gap-3"
                style={Object.assign(
                  {
                    backgroundColor: submitting ? neutral : blue,
                    color: cream,
                    border: "3px solid " + ink,
                    borderRadius: 0,
                    boxShadow: "6px 6px 0 " + ink,
                    minHeight: 60,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: submitting ? "progress" : "pointer",
                  },
                  mono,
                )}
              >
                {submitting ? (
                  <React.Fragment>
                    <Clock aria-hidden="true" className="h-4 w-4" />
                    Filing…
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <Plus aria-hidden="true" className="h-4 w-4" />
                    Submit request
                  </React.Fragment>
                )}
              </Button>
            </div>
            <div className="col-span-12 md:col-span-8">
              <button
                data-wf="b-5-1"
                type="button"
                onClick={function () {
                  navigate("team-calendar");
                }}
                className="bs-focus bs-link inline-flex items-center gap-2 px-2 py-3"
                style={Object.assign(
                  {
                    fontSize: 14,
                    color: ink,
                    textDecoration: "underline",
                    textUnderlineOffset: 5,
                    minHeight: 44,
                    background: "none",
                    border: "none",
                  },
                  mono,
                )}
              >
                Check who else is off on these dates
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          </div>
        </form>

        {/* ── b-6-0: table ──────────────────────────────────── */}
        <section data-wf="b-6-0" aria-labelledby="requests-heading" className="mb-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="requests-heading" style={Object.assign({ fontSize: 34, lineHeight: 1 }, serif)}>
              My requests
            </h2>
            <p
              className="uppercase tracking-[0.2em]"
              style={Object.assign({ fontSize: 11, color: neutral }, mono)}
            >
              05 / {requests.length} filed ·{" "}
              {
                requests.filter(function (r) {
                  return r.status === "Pending";
                }).length
              }{" "}
              awaiting Priya Nair
            </p>
          </div>
          <div style={{ borderTop: "3px solid " + ink }} className="mt-5" />

          {requests.length === 0 ? (
            <div className="mt-8" style={{ border: "1px dashed " + ink, padding: 8 }}>
              <Empty
                title="No leave filed yet"
                description="When you submit a request it lands here with its status and Priya Nair's comment. Your 20 annual days are untouched."
                action={
                  <Button
                    type="button"
                    onClick={function () {
                      const el = document.getElementById("start_date");
                      if (el) el.focus();
                    }}
                    className="bs-focus uppercase tracking-[0.16em]"
                    style={Object.assign(
                      {
                        backgroundColor: blue,
                        color: cream,
                        border: "3px solid " + ink,
                        borderRadius: 0,
                        minHeight: 48,
                        fontSize: 12,
                        fontWeight: 700,
                      },
                      mono,
                    )}
                  >
                    Start a request
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto" style={{ border: "3px solid " + ink }}>
              <Table
                className="w-full"
                style={Object.assign({ borderCollapse: "collapse", minWidth: 940 }, mono)}
              >
                <THead>
                  <TR style={{ backgroundColor: ink, color: cream }}>
                    <TH
                      data-wf="i-6-0-0"
                      scope="col"
                      className="text-left uppercase tracking-[0.16em] px-4 py-3"
                      style={{ fontSize: 11, color: cream }}
                    >
                      Dates
                    </TH>
                    <TH
                      data-wf="i-6-0-1"
                      scope="col"
                      className="text-left uppercase tracking-[0.16em] px-4 py-3"
                      style={{ fontSize: 11, color: cream }}
                    >
                      Type
                    </TH>
                    <TH
                      data-wf="i-6-0-2"
                      scope="col"
                      className="text-right uppercase tracking-[0.16em] px-4 py-3"
                      style={{ fontSize: 11, color: cream }}
                    >
                      Working days
                    </TH>
                    <TH
                      data-wf="i-6-0-3"
                      scope="col"
                      className="text-left uppercase tracking-[0.16em] px-4 py-3"
                      style={{ fontSize: 11, color: cream }}
                    >
                      Status
                    </TH>
                    <TH
                      data-wf="i-6-0-4"
                      scope="col"
                      className="text-left uppercase tracking-[0.16em] px-4 py-3"
                      style={{ fontSize: 11, color: cream }}
                    >
                      Overlap
                    </TH>
                    <TH
                      data-wf="i-6-0-5"
                      scope="col"
                      className="text-left uppercase tracking-[0.16em] px-4 py-3"
                      style={{ fontSize: 11, color: cream }}
                    >
                      Manager comment
                    </TH>
                    <TH
                      data-wf="i-6-0-6"
                      scope="col"
                      className="text-left uppercase tracking-[0.16em] px-4 py-3"
                      style={{ fontSize: 11, color: cream }}
                    >
                      Submitted
                    </TH>
                  </TR>
                </THead>
                <TBody>
                  {requests.map(function (r, i) {
                    return (
                      <TR
                        key={r.id}
                        className={r.id === newRowId ? "bs-row-in" : ""}
                        style={{ borderTop: i === 0 ? "none" : "1px solid " + ink }}
                      >
                        <TD className="px-4 py-4 align-top" style={{ fontSize: 13 }}>
                          <span className="block">{fmtRange(r.start_date, r.end_date)}</span>
                          <span className="block mt-1" style={{ fontSize: 11, color: neutral }}>
                            {r.id}
                          </span>
                        </TD>
                        <TD className="px-4 py-4 align-top" style={{ fontSize: 13 }}>
                          <Badge
                            style={Object.assign(
                              {
                                border: "2px solid " + ink,
                                borderRadius: 0,
                                backgroundColor: cream,
                                color: ink,
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: "0.1em",
                                padding: "2px 8px",
                              },
                              mono,
                            )}
                          >
                            {r.leave_type === "annual" ? "ANNUAL" : "SICK"}
                          </Badge>
                        </TD>
                        <TD className="px-4 py-4 align-top text-right" style={{ fontSize: 15 }}>
                          {r.working_days}
                        </TD>
                        <TD className="px-4 py-4 align-top">
                          <StatusCell status={r.status} />
                        </TD>
                        <TD className="px-4 py-4 align-top" style={{ fontSize: 12 }}>
                          {r.has_overlap ? (
                            <span className="inline-flex items-center gap-2" style={{ color: ink }}>
                              <AlertCircle
                                aria-hidden="true"
                                className="h-4 w-4"
                                style={{ color: blue }}
                              />
                              Flagged
                            </span>
                          ) : (
                            <span style={{ color: neutral }}>Clear</span>
                          )}
                        </TD>
                        <TD
                          className="px-4 py-4 align-top"
                          style={{ fontSize: 12, lineHeight: 1.6, maxWidth: 300 }}
                        >
                          {r.manager_comment ? (
                            <span>
                              {r.manager_comment}
                              <span className="block mt-1" style={{ color: neutral, fontSize: 11 }}>
                                — {r.decided_by}, {fmtDay(r.decided_at)}
                              </span>
                            </span>
                          ) : (
                            <span style={{ color: neutral }}>Awaiting Priya Nair</span>
                          )}
                        </TD>
                        <TD
                          className="px-4 py-4 align-top"
                          style={{ fontSize: 12, color: neutral, whiteSpace: "nowrap" }}
                        >
                          {fmtDay(r.created_at)}
                        </TD>
                      </TR>
                    );
                  })}
                </TBody>
              </Table>
            </div>
          )}

          <div className="mt-6">
            <Separator className="opacity-30" />
          </div>
          <p
            className="mt-5 max-w-[68ch]"
            style={Object.assign({ fontSize: 12, color: neutral, lineHeight: 1.7 }, mono)}
          >
            Only approved leave reaches the shared team calendar, and sick-leave reasons never
            appear there. Approved annual days are the only thing that reduces your {ALLOCATED_DAYS}
            -day balance.
          </p>
        </section>
      </div>
    </div>
  );
}
