// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";

const { Button, Textarea, Label, Table, THead, TBody, TR, TH, TD, Avatar, Empty } = UI;

const { X, ChevronRight, Bell, Calendar, Clock, ArrowRight, AlertCircle, CheckCircle } = Icons;

const MANAGER = { full_name: "Priya Raman", role: "Manager", reports: 3 };

const PENDING = [
  {
    id: "LR-1042",
    employee: "Sam Okafor",
    first: "Sam",
    employee_id: "u-11",
    dates: "2–6 Mar 2026",
    start_date: "2026-03-02",
    end_date: "2026-03-06",
    leave_type: "annual",
    working_days: 5,
    reason: "Family holiday",
    remaining: 3,
    has_overlap: false,
    overlap_note: "",
    submitted: "20 Feb 2026, 08:41",
  },
  {
    id: "LR-1039",
    employee: "Mara Lindqvist",
    first: "Mara",
    employee_id: "u-07",
    dates: "23–24 Feb 2026",
    start_date: "2026-02-23",
    end_date: "2026-02-24",
    leave_type: "sick",
    working_days: 2,
    reason: "Flu — GP note already sent to HR",
    remaining: 12,
    has_overlap: false,
    overlap_note: "",
    submitted: "23 Feb 2026, 07:12",
  },
  {
    id: "LR-1045",
    employee: "Tobias Hale",
    first: "Tobias",
    employee_id: "u-19",
    dates: "16–20 Mar 2026",
    start_date: "2026-03-16",
    end_date: "2026-03-20",
    leave_type: "annual",
    working_days: 5,
    reason: "Moving flat, then handover of the Ridge account",
    remaining: 11,
    has_overlap: true,
    overlap_note: "18–19 Mar already approved for Tobias (LR-1021).",
    submitted: "23 Feb 2026, 16:55",
  },
];

const DECISION_TIMES = ["09:17", "09:21", "09:26"];
const WARN = "#8a3b12";

export default function Screen() {
  const navigate = useNavigate();
  const [requests, setRequests] = React.useState(PENDING);
  const [selectedId, setSelectedId] = React.useState(PENDING[0].id);
  const [comment, setComment] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(null);
  const [decisions, setDecisions] = React.useState([]);

  const timerRef = React.useRef(null);
  const panelRef = React.useRef(null);
  const textRef = React.useRef(null);
  const mounted = React.useRef(false);

  const selected = requests.find((r) => r.id === selectedId) || null;
  const blocked =
    !!selected && selected.leave_type === "annual" && selected.working_days > selected.remaining;

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  React.useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (selected && panelRef.current) panelRef.current.focus();
  }, [selectedId]);

  React.useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape" && selected && !busy) {
        setSelectedId(null);
        setError("");
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selected, busy]);

  const ink = brand.primaryColor;
  const hairline = "rgba(10,10,10,0.15)";
  const block = {
    border: `3px solid ${ink}`,
    boxShadow: `6px 6px 0 ${ink}`,
    backgroundColor: "#ffffff",
    borderRadius: brand.radius,
  };
  const mono = { fontFamily: brand.fontBody };
  const nums = { fontVariantNumeric: "tabular-nums" };

  function openRequest(id) {
    setSelectedId(id);
    setComment("");
    setError("");
  }

  function decide(action) {
    if (!selected || busy) return;
    if (!comment.trim()) {
      setError("A comment is required — the employee sees it and it is written to the audit log.");
      if (textRef.current) textRef.current.focus();
      return;
    }
    if (action === "approve" && blocked) return;
    setError("");
    setBusy(action);
    timerRef.current = setTimeout(() => {
      const r = selected;
      const index = decisions.length;
      const entry = {
        id: r.id,
        action,
        employee: r.employee,
        first: r.first,
        dates: r.dates,
        leave_type: r.leave_type,
        working_days: r.working_days,
        left: r.leave_type === "annual" ? r.remaining - r.working_days : r.remaining,
        comment: comment.trim(),
        audit: "A-" + (2291 + index),
        time: DECISION_TIMES[index] || "09:31",
      };
      const rest = requests.filter((x) => x.id !== r.id);
      setDecisions((prev) => [entry, ...prev]);
      setRequests(rest);
      setSelectedId(rest.length ? rest[0].id : null);
      setComment("");
      setBusy(null);
    }, 700);
  }

  const typeLabel = (t) => (t === "annual" ? "Annual" : "Sick");

  function panelSentence(r) {
    if (r.leave_type === "sick") {
      return `Reason: “${r.reason}”. Sick leave is uncapped and tracked separately, so approving this leaves ${r.first}’s annual balance at ${r.remaining} of 20 days.`;
    }
    if (r.working_days > r.remaining) {
      return `Reason: “${r.reason}”. Remaining annual balance: ${r.remaining} days — approving ${r.working_days} days would exceed the balance, so approval is blocked.`;
    }
    return `Reason: “${r.reason}”. Remaining annual balance: ${r.remaining} days — approving ${r.working_days} days leaves ${r.remaining - r.working_days} days.`;
  }

  const css = `
    .bs-focus:focus-visible { outline: 3px solid ${brand.accentColor}; outline-offset: 2px; }
    .bs-row { transition: background-color 140ms ease; }
    .bs-row:hover { background-color: rgba(10,10,10,0.04); }
    .bs-enter { animation: bsIn 220ms cubic-bezier(.2,.7,.3,1) both; }
    @keyframes bsIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
    .bs-line { animation: bsLine 200ms ease both; }
    @keyframes bsLine { from { opacity: 0; transform: translateX(-6px); } to { opacity: 1; transform: none; } }
    .bs-ghost:hover { background-color: rgba(10,10,10,0.06); }
    .bs-accent-btn { transition: transform 90ms ease, box-shadow 90ms ease; }
    .bs-accent-btn:active:not(:disabled) { transform: translate(3px,3px); box-shadow: 0 0 0 ${ink} !important; }
    @media (prefers-reduced-motion: reduce) {
      .bs-enter, .bs-line { animation: none !important; }
      .bs-row, .bs-accent-btn { transition: none !important; }
    }
  `;

  return (
    <div
      className="min-h-full w-full"
      style={{ backgroundColor: brand.backgroundColor, color: ink, fontFamily: brand.fontBody }}
    >
      <style>{css}</style>

      <div className="mx-auto w-full max-w-[1180px] px-6 py-10 md:px-10 md:py-14">
        {/* b-0-0 page title */}
        <header data-wf="b-0-0" className="mb-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="min-w-0">
              <p
                className="mb-4 text-[11px] uppercase tracking-[0.22em]"
                style={{ color: brand.neutralColor, ...nums }}
              >
                № 03 — Decisions desk · 24 Feb 2026
              </p>
              <h1
                className="text-[38px] leading-[1.04] md:text-[54px]"
                style={{ fontFamily: brand.fontHeading, letterSpacing: "-0.01em" }}
              >
                Approvals — my direct reports
              </h1>
            </div>
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{ border: `3px solid ${ink}`, borderRadius: brand.radius }}
            >
              <Avatar name={MANAGER.full_name} />
              <div className="text-[12px] leading-[1.5]">
                <div className="font-semibold">{MANAGER.full_name}</div>
                <div style={{ color: brand.neutralColor, ...nums }}>
                  {MANAGER.role} · {MANAGER.reports} direct reports
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8" style={{ borderTop: `3px solid ${ink}` }} />
        </header>

        {/* b-1-0 notice */}
        <section data-wf="b-1-0" className="mb-10" aria-labelledby="notice-heading">
          <h2 id="notice-heading" className="sr-only">
            Activity waiting for you
          </h2>
          <div
            className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-start md:gap-5"
            style={{
              border: `3px solid ${ink}`,
              borderLeft: `10px solid ${brand.accentColor}`,
              borderRadius: brand.radius,
              backgroundColor: "#ffffff",
            }}
          >
            <Bell className="mt-[2px] h-5 w-5 shrink-0" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] leading-[1.6]" aria-live="polite" style={nums}>
                {requests.length > 0
                  ? `${requests.length} request${requests.length === 1 ? "" : "s"} ${
                      requests.length === 1 ? "is" : "are"
                    } awaiting your decision. Only requests from your direct reports appear here.`
                  : "No requests are awaiting your decision. Only requests from your direct reports appear here."}
              </p>

              {decisions.length > 0 && (
                <ul className="mt-4 space-y-2" aria-live="polite">
                  {decisions.slice(0, 3).map((d) => (
                    <li
                      key={d.audit}
                      className="bs-line flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] leading-[1.6]"
                      style={{ color: brand.neutralColor, ...nums }}
                    >
                      <CheckCircle
                        className="h-4 w-4 shrink-0"
                        aria-hidden="true"
                        style={{ color: brand.accentColor }}
                      />
                      <span style={{ color: ink, fontWeight: 600 }}>
                        {d.action === "approve" ? "Approved" : "Rejected"}
                      </span>
                      <span>
                        {d.employee}, {d.dates}, {typeLabel(d.leave_type)}.
                      </span>
                      <span>
                        {d.action === "approve" && d.leave_type === "annual"
                          ? `${d.working_days} days deducted — ${d.left} of 20 days left.`
                          : d.action === "approve"
                            ? "Annual balance unchanged (sick leave)."
                            : "No balance deducted."}
                      </span>
                      <span>
                        Audit entry {d.audit} recorded {d.time}.
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        {/* b-2-0 table */}
        <section data-wf="b-2-0" className="mb-12" style={block} aria-labelledby="pending-heading">
          <div
            className="flex flex-wrap items-end justify-between gap-4 px-6 py-5"
            style={{ borderBottom: `3px solid ${ink}` }}
          >
            <div>
              <h2
                id="pending-heading"
                className="text-[24px] leading-tight md:text-[28px]"
                style={{ fontFamily: brand.fontHeading }}
              >
                Pending requests
              </h2>
              <p className="mt-2 text-[12px]" style={{ color: brand.neutralColor, ...nums }}>
                {requests.length} awaiting · Mara Lindqvist, Sam Okafor, Tobias Hale
              </p>
            </div>
            <p
              className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em]"
              style={{ color: brand.neutralColor, ...nums }}
            >
              <Clock className="h-4 w-4" aria-hidden="true" />
              Last synced 09:14
            </p>
          </div>

          {requests.length === 0 ? (
            <div className="px-6 py-14">
              <Empty
                title="No requests waiting on you"
                description="Mara, Sam and Tobias all have a decision. Anything new from your direct reports lands here the moment it is submitted — nothing is sent by email in v1."
                action={
                  <Button
                    className="bs-focus bs-accent-btn px-5 py-3 text-[12px] uppercase tracking-[0.16em]"
                    style={{
                      backgroundColor: brand.accentColor,
                      color: "#ffffff",
                      border: `3px solid ${ink}`,
                      borderRadius: brand.radius,
                      boxShadow: `4px 4px 0 ${ink}`,
                    }}
                    onClick={() => navigate("team-calendar")}
                  >
                    Open team calendar
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="w-full min-w-[900px] text-left" style={nums}>
                <THead>
                  <TR style={{ borderBottom: `3px solid ${ink}` }}>
                    {[
                      ["i-2-0-0", "Employee"],
                      ["i-2-0-1", "Dates"],
                      ["i-2-0-2", "Type"],
                      ["i-2-0-3", "Working days"],
                      ["i-2-0-4", "Reason"],
                      ["i-2-0-5", "Remaining balance"],
                      ["i-2-0-6", "Overlap"],
                    ].map(([id, label]) => (
                      <TH
                        key={id}
                        data-wf={id}
                        scope="col"
                        className="px-4 py-4 text-[10px] uppercase tracking-[0.18em] align-bottom"
                        style={{ color: brand.neutralColor, fontWeight: 600 }}
                      >
                        {label}
                      </TH>
                    ))}
                    <TH scope="col" className="px-4 py-4">
                      <span className="sr-only">Decision</span>
                    </TH>
                  </TR>
                </THead>
                <TBody>
                  {requests.map((r) => {
                    const isSelected = r.id === selectedId;
                    const over = r.leave_type === "annual" && r.working_days > r.remaining;
                    return (
                      <TR
                        key={r.id}
                        className="bs-row align-top"
                        style={{
                          borderBottom: `1px solid ${hairline}`,
                          backgroundColor: isSelected ? "rgba(29,63,255,0.06)" : "transparent",
                        }}
                      >
                        <TD className="px-4 py-5">
                          <div
                            className="flex items-start gap-3"
                            style={{
                              boxShadow: isSelected ? `inset 4px 0 0 ${brand.accentColor}` : "none",
                              paddingLeft: isSelected ? 10 : 0,
                            }}
                          >
                            <div>
                              <div className="text-[14px] font-semibold leading-tight">
                                {r.employee}
                              </div>
                              <div
                                className="mt-1 text-[11px]"
                                style={{ color: brand.neutralColor }}
                              >
                                {r.id} · sent {r.submitted}
                              </div>
                              {isSelected && (
                                <div
                                  className="mt-2 inline-block px-2 py-[2px] text-[10px] uppercase tracking-[0.14em]"
                                  style={{
                                    border: `1px solid ${brand.accentColor}`,
                                    color: brand.accentColor,
                                  }}
                                >
                                  Deciding
                                </div>
                              )}
                            </div>
                          </div>
                        </TD>
                        <TD className="px-4 py-5 text-[13px] leading-[1.5]">{r.dates}</TD>
                        <TD className="px-4 py-5">
                          <span
                            className="inline-block px-2 py-1 text-[11px] uppercase tracking-[0.12em]"
                            style={{
                              border: `1px solid ${ink}`,
                              backgroundColor:
                                r.leave_type === "sick" ? "rgba(10,10,10,0.06)" : "transparent",
                            }}
                          >
                            {typeLabel(r.leave_type)}
                          </span>
                        </TD>
                        <TD className="px-4 py-5">
                          <span className="text-[20px] leading-none">{r.working_days}</span>
                          <span className="ml-1 text-[11px]" style={{ color: brand.neutralColor }}>
                            days
                          </span>
                        </TD>
                        <TD className="px-4 py-5 max-w-[240px]">
                          <p className="text-[13px] leading-[1.55]">{r.reason}</p>
                          {r.leave_type === "sick" && (
                            <p
                              className="mt-1 text-[10px] uppercase tracking-[0.14em]"
                              style={{ color: brand.neutralColor }}
                            >
                              Sensitive — manager & HR only
                            </p>
                          )}
                        </TD>
                        <TD className="px-4 py-5">
                          <div className="text-[13px]">{r.remaining} / 20 days</div>
                          <div
                            className="mt-1 text-[11px]"
                            style={{ color: over ? WARN : brand.neutralColor }}
                          >
                            {r.leave_type === "sick"
                              ? "sick does not deduct"
                              : over
                                ? `short by ${r.working_days - r.remaining} days`
                                : `${r.remaining - r.working_days} days after approval`}
                          </div>
                        </TD>
                        <TD className="px-4 py-5">
                          {r.has_overlap ? (
                            <span
                              className="inline-flex items-center gap-2 px-2 py-1 text-[11px] uppercase tracking-[0.12em]"
                              style={{ border: `1px solid ${WARN}`, color: WARN }}
                            >
                              <AlertCircle className="h-4 w-4" aria-hidden="true" />
                              Overlap
                            </span>
                          ) : (
                            <span className="text-[12px]" style={{ color: brand.neutralColor }}>
                              None
                            </span>
                          )}
                        </TD>
                        <TD className="px-4 py-5 text-right">
                          <Button
                            className="bs-focus bs-ghost inline-flex items-center gap-1 px-3 py-2 text-[11px] uppercase tracking-[0.16em]"
                            style={{
                              border: `3px solid ${ink}`,
                              borderRadius: brand.radius,
                              backgroundColor: isSelected ? ink : "transparent",
                              color: isSelected ? brand.backgroundColor : ink,
                            }}
                            aria-label={`Decide on ${r.employee}'s request ${r.id}`}
                            onClick={() => openRequest(r.id)}
                          >
                            Decide
                            <ChevronRight className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </TD>
                      </TR>
                    );
                  })}
                </TBody>
              </Table>
            </div>
          )}

          <p
            className="px-6 py-4 text-[11px] leading-[1.6]"
            style={{ borderTop: `1px solid ${hairline}`, color: brand.neutralColor }}
          >
            Requests from anyone who does not report to you route to their own manager and never
            appear in this list.
          </p>
        </section>

        {/* b-3-0 decision panel */}
        <section
          data-wf="b-3-0"
          ref={panelRef}
          tabIndex={-1}
          aria-labelledby="decide-heading"
          className="bs-enter bs-focus"
          style={{
            ...block,
            boxShadow: `10px 10px 0 ${ink}`,
            backgroundColor: selected ? "#ffffff" : brand.backgroundColor,
          }}
        >
          {!selected ? (
            <div className="px-6 py-10 md:px-10">
              <h2
                id="decide-heading"
                className="text-[22px] md:text-[26px]"
                style={{ fontFamily: brand.fontHeading }}
              >
                Decision panel
              </h2>
              <p
                className="mt-3 max-w-[60ch] text-[13px] leading-[1.7]"
                style={{ color: brand.neutralColor }}
              >
                {requests.length === 0
                  ? "Nothing left to decide today. When a direct report submits leave, open it here to approve or reject with a comment."
                  : "Choose Decide on a row above to review the request and record your decision."}
              </p>
            </div>
          ) : (
            <>
              <div
                className="flex items-start justify-between gap-4 px-6 py-6 md:px-10"
                style={{ borderBottom: `3px solid ${ink}` }}
              >
                <div>
                  <p
                    className="mb-3 text-[10px] uppercase tracking-[0.22em]"
                    style={{ color: brand.neutralColor, ...nums }}
                  >
                    {selected.id} · submitted {selected.submitted}
                  </p>
                  <h2
                    id="decide-heading"
                    className="text-[24px] leading-[1.15] md:text-[32px]"
                    style={{ fontFamily: brand.fontHeading }}
                  >
                    {`Decide: ${selected.employee}, ${selected.dates}, ${typeLabel(
                      selected.leave_type,
                    )}, ${selected.working_days} working days`}
                  </h2>
                </div>
                <Button
                  className="bs-focus bs-ghost shrink-0 p-2"
                  style={{
                    border: `3px solid ${ink}`,
                    borderRadius: brand.radius,
                    backgroundColor: "transparent",
                  }}
                  aria-label="Close decision panel"
                  onClick={() => {
                    setSelectedId(null);
                    setError("");
                  }}
                  disabled={!!busy}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>

              <div className="px-6 py-8 md:px-10">
                {/* b-4-0 */}
                <div data-wf="b-4-0" className="max-w-[72ch]">
                  <p className="text-[15px] leading-[1.75]" style={nums}>
                    {panelSentence(selected)}
                  </p>
                  {selected.leave_type === "sick" && (
                    <p
                      className="mt-3 text-[12px] leading-[1.7]"
                      style={{ color: brand.neutralColor }}
                    >
                      Sick-leave reason: visible to {selected.first}, to you as their manager, and
                      to HR/Admin. It is never shown on the team calendar.
                    </p>
                  )}
                  {selected.has_overlap && (
                    <p
                      className="mt-4 flex items-start gap-2 px-4 py-3 text-[12px] leading-[1.7]"
                      style={{ border: `1px solid ${WARN}`, color: WARN }}
                    >
                      <AlertCircle className="mt-[2px] h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>Overlap flagged: {selected.overlap_note}</span>
                    </p>
                  )}
                  {blocked && (
                    <p
                      id="approve-blocked"
                      role="status"
                      className="mt-4 flex items-start gap-3 px-4 py-4 text-[13px] leading-[1.7]"
                      style={{ border: `3px solid ${WARN}`, color: WARN }}
                    >
                      <AlertCircle className="mt-[2px] h-5 w-5 shrink-0" aria-hidden="true" />
                      <span>
                        <strong>Approval blocked.</strong> {selected.working_days} working days
                        exceeds {selected.first}’s remaining {selected.remaining} days. Ask HR/Admin
                        to adjust the balance, or reject with a comment explaining why.
                      </span>
                    </p>
                  )}
                </div>

                <div className="my-8" style={{ borderTop: `1px dashed ${hairline}` }} />

                {/* b-5-0 */}
                <div data-wf="b-5-0" className="max-w-[72ch]">
                  <Label
                    htmlFor="decision-comment"
                    className="mb-2 block text-[10px] uppercase tracking-[0.22em]"
                    style={{ color: brand.neutralColor }}
                  >
                    Comment
                  </Label>
                  <Textarea
                    id="decision-comment"
                    data-wf="b-5-0"
                    rows={3}
                    className="bs-focus w-full px-4 py-3 text-[14px] leading-[1.6]"
                    style={{
                      border: `3px solid ${error ? WARN : ink}`,
                      borderRadius: brand.radius,
                      backgroundColor: brand.backgroundColor,
                      fontFamily: brand.fontBody,
                      color: ink,
                    }}
                    ref={textRef}
                    value={comment}
                    onChange={(e) => {
                      setComment(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="e.g. Cover agreed with Nadia for the Ridge handover."
                    aria-describedby={error ? "comment-error comment-help" : "comment-help"}
                    aria-invalid={error ? "true" : undefined}
                    disabled={!!busy}
                  />
                  <p
                    id="comment-help"
                    className="mt-2 text-[11px] leading-[1.6]"
                    style={{ color: brand.neutralColor }}
                  >
                    {selected.first} sees this comment on their request. It is written to the audit
                    log with your name and the time.
                  </p>
                  {error && (
                    <p
                      id="comment-error"
                      role="alert"
                      className="bs-line mt-2 flex items-center gap-2 text-[12px]"
                      style={{ color: WARN }}
                    >
                      <AlertCircle className="h-4 w-4" aria-hidden="true" />
                      {error}
                    </p>
                  )}
                </div>

                {/* row 7 */}
                <div className="mt-8 grid grid-cols-12 items-center gap-4">
                  <div className="col-span-12 sm:col-span-6 md:col-span-3">
                    <Button
                      data-wf="b-6-0"
                      className="bs-focus bs-accent-btn w-full px-5 py-4 text-[12px] uppercase tracking-[0.18em]"
                      style={{
                        backgroundColor: blocked ? "rgba(10,10,10,0.08)" : brand.accentColor,
                        color: blocked ? brand.neutralColor : "#ffffff",
                        border: `3px solid ${blocked ? brand.neutralColor : ink}`,
                        borderRadius: brand.radius,
                        boxShadow: blocked ? "none" : `5px 5px 0 ${ink}`,
                        cursor: blocked ? "not-allowed" : "pointer",
                        opacity: busy === "reject" ? 0.5 : 1,
                      }}
                      onClick={() => decide("approve")}
                      disabled={blocked || !!busy}
                      aria-describedby={blocked ? "approve-blocked" : undefined}
                    >
                      {busy === "approve"
                        ? "Recording…"
                        : blocked
                          ? "Approve (blocked)"
                          : "Approve"}
                    </Button>
                  </div>
                  <div className="col-span-12 sm:col-span-6 md:col-span-3">
                    <Button
                      data-wf="b-6-1"
                      className="bs-focus bs-accent-btn w-full px-5 py-4 text-[12px] uppercase tracking-[0.18em]"
                      style={{
                        backgroundColor: "transparent",
                        color: ink,
                        border: `3px solid ${ink}`,
                        borderRadius: brand.radius,
                        boxShadow: `5px 5px 0 ${ink}`,
                        opacity: busy === "approve" ? 0.5 : 1,
                      }}
                      onClick={() => decide("reject")}
                      disabled={!!busy}
                    >
                      {busy === "reject" ? "Recording…" : "Reject"}
                    </Button>
                  </div>
                  <div className="col-span-12 md:col-span-6 md:text-right">
                    <Button
                      data-wf="b-6-2"
                      className="bs-focus inline-flex items-center gap-2 px-2 py-3 text-[13px]"
                      style={{
                        backgroundColor: "transparent",
                        color: brand.accentColor,
                        border: "none",
                        borderRadius: brand.radius,
                        textDecoration: "underline",
                        textUnderlineOffset: "4px",
                      }}
                      onClick={() => navigate("team-calendar")}
                    >
                      <Calendar className="h-4 w-4" aria-hidden="true" />
                      See team calendar for these dates
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>

                <p
                  className="mt-6 text-[11px] leading-[1.6]"
                  aria-live="polite"
                  style={{ color: brand.neutralColor, ...nums }}
                >
                  {busy
                    ? "Writing the decision and its audit entry…"
                    : "Decisions are final in v1 and are logged to the audit trail that HR/Admin reviews."}
                </p>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
