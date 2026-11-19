// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";

const { Button, Label, Select, Table, THead, TBody, TR, TH, TD, Avatar, Empty } = UI;

const { Calendar } = Icons;

const TODAY = "2026-11-19";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const MON_ABBR = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAY_ABBR = ["Mon", "Tue", "Wed", "Thu", "Fri"];

const TEAM = [
  { id: "u-01", full_name: "Maya Lindqvist", team: "Design" },
  { id: "u-02", full_name: "Tom Becker", team: "Engineering" },
  { id: "u-03", full_name: "Priya Raman", team: "Engineering" },
  { id: "u-04", full_name: "Jonas Weber", team: "Finance" },
  { id: "u-05", full_name: "Sofia Marchetti", team: "Design" },
  { id: "u-06", full_name: "Daniel Okonkwo", team: "Support" },
  { id: "u-07", full_name: "Hannah Reeves", team: "Engineering" },
  { id: "u-08", full_name: "Aisha Nkemdirim", team: "People Ops" },
];

// Only Approved rows reach the shared calendar. Pending / Rejected are kept in the
// sample set so the filter rule is visibly doing its job.
const LEAVE_REQUESTS = [
  {
    id: "lr-1039",
    employee_id: "u-04",
    start_date: "2026-02-23",
    end_date: "2026-02-27",
    leave_type: "annual",
    working_days: 5,
    status: "Approved",
  },
  {
    id: "lr-1040",
    employee_id: "u-08",
    start_date: "2026-02-26",
    end_date: "2026-02-27",
    leave_type: "sick",
    working_days: 2,
    status: "Approved",
  },
  {
    id: "lr-1041",
    employee_id: "u-01",
    start_date: "2026-03-02",
    end_date: "2026-03-06",
    leave_type: "annual",
    working_days: 5,
    status: "Approved",
  },
  {
    id: "lr-1042",
    employee_id: "u-02",
    start_date: "2026-03-03",
    end_date: "2026-03-04",
    leave_type: "sick",
    working_days: 2,
    status: "Approved",
  },
  {
    id: "lr-1043",
    employee_id: "u-03",
    start_date: "2026-03-05",
    end_date: "2026-03-11",
    leave_type: "annual",
    working_days: 5,
    status: "Approved",
  },
  {
    id: "lr-1044",
    employee_id: "u-05",
    start_date: "2026-03-06",
    end_date: "2026-03-06",
    leave_type: "sick",
    working_days: 1,
    status: "Approved",
  },
  {
    id: "lr-1047",
    employee_id: "u-05",
    start_date: "2026-03-04",
    end_date: "2026-03-05",
    leave_type: "annual",
    working_days: 2,
    status: "Pending",
  },
  {
    id: "lr-1048",
    employee_id: "u-07",
    start_date: "2026-03-03",
    end_date: "2026-03-03",
    leave_type: "annual",
    working_days: 1,
    status: "Rejected",
  },
  {
    id: "lr-1045",
    employee_id: "u-06",
    start_date: "2026-03-09",
    end_date: "2026-03-13",
    leave_type: "annual",
    working_days: 5,
    status: "Approved",
  },
  {
    id: "lr-1049",
    employee_id: "u-02",
    start_date: "2026-03-12",
    end_date: "2026-03-12",
    leave_type: "annual",
    working_days: 1,
    status: "Pending",
  },
  {
    id: "lr-1046",
    employee_id: "u-07",
    start_date: "2026-03-16",
    end_date: "2026-03-20",
    leave_type: "annual",
    working_days: 5,
    status: "Approved",
  },
  {
    id: "lr-1050",
    employee_id: "u-03",
    start_date: "2026-03-17",
    end_date: "2026-03-18",
    leave_type: "sick",
    working_days: 2,
    status: "Approved",
  },
  {
    id: "lr-1052",
    employee_id: "u-01",
    start_date: "2026-11-18",
    end_date: "2026-11-20",
    leave_type: "annual",
    working_days: 3,
    status: "Approved",
  },
  {
    id: "lr-1053",
    employee_id: "u-02",
    start_date: "2026-11-19",
    end_date: "2026-11-19",
    leave_type: "sick",
    working_days: 1,
    status: "Approved",
  },
  {
    id: "lr-1054",
    employee_id: "u-06",
    start_date: "2026-11-19",
    end_date: "2026-11-23",
    leave_type: "annual",
    working_days: 3,
    status: "Pending",
  },
];

const TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "annual", label: "Annual" },
  { value: "sick", label: "Sick" },
];

function addDays(iso, n) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function parts(iso) {
  const d = new Date(iso + "T00:00:00Z");
  return { day: d.getUTCDate(), month: d.getUTCMonth(), year: d.getUTCFullYear() };
}

function longDate(iso) {
  const p = parts(iso);
  return p.day + " " + MON_ABBR[p.month] + " " + p.year;
}

function covers(req, iso) {
  return iso >= req.start_date && iso <= req.end_date;
}

export default function Screen() {
  const navigate = useNavigate();
  const ink = brand.primaryColor;
  const paper = brand.backgroundColor;
  const accent = brand.accentColor;
  const muted = brand.neutralColor;

  const [weekStart, setWeekStart] = React.useState("2026-03-02");
  const [leaveType, setLeaveType] = React.useState("all");
  const [loading, setLoading] = React.useState(false);
  const mounted = React.useRef(false);

  React.useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 420);
    return () => clearTimeout(t);
  }, [weekStart, leaveType]);

  const weekDays = React.useMemo(
    () => [0, 1, 2, 3, 4].map((i) => addDays(weekStart, i)),
    [weekStart],
  );

  const first = parts(weekDays[0]);
  const last = parts(weekDays[4]);

  const monthTitle =
    first.month === last.month
      ? MONTHS[first.month] + " " + first.year
      : MON_ABBR[first.month] + "–" + MON_ABBR[last.month] + " " + last.year;

  const weekLabel =
    first.month === last.month
      ? "Week of " + first.day + "–" + last.day + " " + MON_ABBR[last.month] + " " + last.year
      : "Week of " +
        first.day +
        " " +
        MON_ABBR[first.month] +
        " – " +
        last.day +
        " " +
        MON_ABBR[last.month] +
        " " +
        last.year;

  const approvedThisWeek = React.useMemo(
    () =>
      LEAVE_REQUESTS.filter((r) => r.status === "Approved" && weekDays.some((d) => covers(r, d))),
    [weekDays],
  );

  const pendingThisWeek = React.useMemo(
    () =>
      LEAVE_REQUESTS.filter((r) => r.status === "Pending" && weekDays.some((d) => covers(r, d)))
        .length,
    [weekDays],
  );

  const rows = React.useMemo(() => {
    return TEAM.map((person) => {
      const cells = weekDays.map((day) => {
        const hit = approvedThisWeek.find(
          (r) =>
            r.employee_id === person.id &&
            covers(r, day) &&
            (leaveType === "all" || r.leave_type === leaveType),
        );
        return hit || null;
      });
      return { person, cells };
    }).filter((row) => row.cells.some(Boolean));
  }, [approvedThisWeek, weekDays, leaveType]);

  const daysAway = rows.reduce((sum, row) => sum + row.cells.filter(Boolean).length, 0);

  const onLeaveToday = React.useMemo(
    () =>
      LEAVE_REQUESTS.filter((r) => r.status === "Approved" && covers(r, TODAY)).map((r) => ({
        req: r,
        person: TEAM.find((p) => p.id === r.employee_id),
      })),
    [],
  );

  const boxStyle = {
    border: "3px solid " + ink,
    boxShadow: "6px 6px 0 " + ink,
    backgroundColor: paper,
    borderRadius: 0,
  };

  const labelStyle = {
    fontFamily: brand.fontBody,
    letterSpacing: "0.16em",
    color: muted,
  };

  const cssVars = {
    "--ink": ink,
    "--paper": paper,
    "--accent": accent,
    "--muted": muted,
  };

  const chipFor = (req) => {
    const isAnnual = req.leave_type === "annual";
    return {
      backgroundColor: isAnnual ? accent : ink,
      color: paper,
      border: "3px solid " + ink,
    };
  };

  return (
    <div
      className="bs-root w-full"
      style={{ ...cssVars, fontFamily: brand.fontBody, color: ink, backgroundColor: paper }}
    >
      <style>{`
        .bs-btn { border: 3px solid var(--ink); background: var(--paper); color: var(--ink);
          box-shadow: 4px 4px 0 var(--ink); border-radius: 0;
          transition: transform .12s ease, box-shadow .12s ease, background-color .12s ease, color .12s ease; }
        .bs-btn:hover:not(:disabled) { transform: translate(2px, 2px); box-shadow: 2px 2px 0 var(--ink); }
        .bs-btn:active:not(:disabled) { transform: translate(4px, 4px); box-shadow: 0 0 0 var(--ink); }
        .bs-btn:disabled { opacity: .4; cursor: not-allowed; box-shadow: 0 0 0 var(--ink); }
        .bs-btn:focus-visible { outline: 3px solid var(--accent); outline-offset: 3px; }
        .bs-primary { background: var(--accent); color: var(--paper); }
        .bs-primary:focus-visible { outline: 3px solid var(--ink); outline-offset: 3px; }
        .bs-field { border: 3px solid var(--ink); background: var(--paper); color: var(--ink);
          border-radius: 0; box-shadow: 4px 4px 0 var(--ink); }
        .bs-field:focus-visible, .bs-field:focus { outline: 3px solid var(--accent); outline-offset: 2px; }
        .bs-link:focus-visible { outline: 3px solid var(--accent); outline-offset: 3px; }
        .bs-in { animation: bsIn .3s ease both; }
        @keyframes bsIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
        .bs-skel { animation: bsPulse 1.2s ease-in-out infinite; }
        @keyframes bsPulse { 0%, 100% { opacity: .25; } 50% { opacity: .6; } }
        .bs-run { animation: bsInk .3s ease both; }
        @keyframes bsInk { from { transform: scaleX(.7); opacity: 0; } to { transform: none; opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          .bs-in, .bs-skel, .bs-run { animation: none; }
          .bs-btn { transition: none; }
          .bs-btn:hover:not(:disabled), .bs-btn:active:not(:disabled) { transform: none; }
        }
      `}</style>

      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-12 gap-y-12">
          {/* ── Row 1 ── page title */}
          <header data-wf="b-0-0" className="col-span-12">
            <p className="text-[11px] uppercase" style={labelStyle}>
              § 03 — Shared view · Approved leave only
            </p>
            <h1
              className="mt-3 leading-[0.92]"
              style={{
                fontFamily: brand.fontHeading,
                fontSize: "clamp(42px, 7vw, 72px)",
                letterSpacing: "-0.015em",
                color: ink,
              }}
            >
              Team Calendar
            </h1>
            <p className="mt-4 max-w-[62ch] text-sm leading-relaxed" style={{ color: muted }}>
              Who is away, by whole working day. Monday to Friday, no half-days.
            </p>
            <div className="mt-6" style={{ borderTop: "3px solid " + ink }} />
            <div className="mt-[3px]" style={{ borderTop: "1px solid " + ink, opacity: 0.35 }} />
          </header>

          {/* ── Row 2 ── filter bar */}
          <section
            data-wf="b-1-0"
            aria-label="Calendar week and filters"
            className="col-span-12 p-5 sm:p-6"
            style={boxStyle}
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] uppercase" style={labelStyle}>
                  Viewing
                </p>
                <h2
                  className="mt-1"
                  style={{
                    fontFamily: brand.fontHeading,
                    fontSize: "clamp(26px, 3.4vw, 36px)",
                    color: ink,
                  }}
                >
                  {monthTitle}
                </h2>
              </div>

              <div className="flex flex-wrap items-end gap-4">
                <div className="flex items-end gap-3">
                  <Button
                    data-wf="i-1-0-0"
                    type="button"
                    className="bs-btn inline-flex h-11 min-w-[44px] items-center gap-2 px-4 text-xs uppercase tracking-[0.14em]"
                    onClick={() => setWeekStart(addDays(weekStart, -7))}
                  >
                    <Icons.ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Previous week</span>
                    <span className="sm:hidden">Prev</span>
                  </Button>

                  <p
                    data-wf="i-1-0-1"
                    aria-live="polite"
                    className="flex h-11 items-center px-4 text-xs uppercase tracking-[0.14em]"
                    style={{
                      border: "3px solid " + ink,
                      backgroundColor: ink,
                      color: paper,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {weekLabel}
                  </p>

                  <Button
                    type="button"
                    className="bs-btn inline-flex h-11 min-w-[44px] items-center gap-2 px-4 text-xs uppercase tracking-[0.14em]"
                    onClick={() => setWeekStart(addDays(weekStart, 7))}
                  >
                    <span className="hidden sm:inline">Next week</span>
                    <span className="sm:hidden">Next</span>
                    <Icons.ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="leave-type-filter"
                    className="flex items-center gap-1.5 text-[11px] uppercase"
                    style={labelStyle}
                  >
                    <Icons.Filter className="h-3.5 w-3.5" aria-hidden="true" />
                    Leave type
                  </Label>
                  <Select
                    data-wf="i-1-0-2"
                    id="leave-type-filter"
                    className="bs-field h-11 px-3 text-xs uppercase tracking-[0.12em]"
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                  >
                    {TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>
          </section>

          {/* ── Row 3 ── table */}
          <section
            data-wf="b-2-0"
            aria-label="Who is on approved leave"
            className="col-span-12"
            style={boxStyle}
          >
            <div
              className="flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6"
              style={{ borderBottom: "3px solid " + ink }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: brand.fontHeading,
                    fontSize: "clamp(24px, 3vw, 32px)",
                    color: ink,
                  }}
                >
                  Who is on approved leave
                </h2>
                <p
                  className="mt-2 text-xs"
                  style={{ color: muted, fontVariantNumeric: "tabular-nums" }}
                  aria-live="polite"
                >
                  {loading
                    ? "Fetching the week…"
                    : rows.length +
                      (rows.length === 1 ? " person away · " : " people away · ") +
                      daysAway +
                      " working days"}
                </p>
              </div>

              <ul
                className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] uppercase"
                style={labelStyle}
              >
                <li className="flex items-center gap-2">
                  <span
                    className="inline-block h-3.5 w-3.5"
                    style={{ backgroundColor: accent, border: "2px solid " + ink }}
                    aria-hidden="true"
                  />
                  Annual
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className="inline-block h-3.5 w-3.5"
                    style={{ backgroundColor: ink, border: "2px solid " + ink }}
                    aria-hidden="true"
                  />
                  Sick
                </li>
                <li className="flex items-center gap-2">
                  <Icons.Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  Synced 08:12 GMT
                </li>
              </ul>
            </div>

            <div className="overflow-x-auto">
              <Table
                className="w-full min-w-[720px] border-collapse text-left"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                <caption className="sr-only">
                  Approved leave for {weekLabel}, by person and working day
                </caption>
                <THead>
                  <TR style={{ borderBottom: "3px solid " + ink }}>
                    <TH
                      data-wf="i-2-0-0"
                      scope="col"
                      className="px-5 py-3 text-[11px] uppercase sm:px-6"
                      style={{ ...labelStyle, width: "28%" }}
                    >
                      Person
                    </TH>
                    {weekDays.map((day, i) => {
                      const p = parts(day);
                      return (
                        <TH
                          key={day}
                          data-wf={"i-2-0-" + (i + 1)}
                          scope="col"
                          className="px-3 py-3 text-[11px] uppercase"
                          style={{ ...labelStyle, borderLeft: "1px solid " + ink, width: "14.4%" }}
                        >
                          {DAY_ABBR[i]} {p.day} {MON_ABBR[p.month]}
                        </TH>
                      );
                    })}
                  </TR>
                </THead>
                <TBody>
                  {loading
                    ? [0, 1, 2].map((r) => (
                        <TR key={"skel-" + r} style={{ borderBottom: "1px solid " + ink }}>
                          <TD className="px-5 py-5 sm:px-6">
                            <span
                              className="bs-skel block h-4 w-40"
                              style={{ backgroundColor: ink }}
                              aria-hidden="true"
                            />
                            <span className="sr-only">Loading leave data</span>
                          </TD>
                          {weekDays.map((d) => (
                            <TD
                              key={d}
                              className="px-3 py-5"
                              style={{ borderLeft: "1px solid " + ink }}
                            >
                              <span
                                className="bs-skel block h-7 w-full"
                                style={{ backgroundColor: muted }}
                                aria-hidden="true"
                              />
                            </TD>
                          ))}
                        </TR>
                      ))
                    : rows.map(({ person, cells }) => (
                        <TR
                          key={person.id}
                          className="bs-in"
                          style={{ borderBottom: "1px solid " + ink }}
                        >
                          <TH
                            scope="row"
                            className="px-5 py-5 text-left align-middle sm:px-6"
                            style={{ fontWeight: 400 }}
                          >
                            <span className="flex items-center gap-3">
                              <Avatar name={person.full_name} className="h-9 w-9 shrink-0" />
                              <span className="flex flex-col">
                                <span className="text-sm" style={{ color: ink }}>
                                  {person.full_name}
                                </span>
                                <span className="text-[11px] uppercase" style={labelStyle}>
                                  {person.team}
                                </span>
                              </span>
                            </span>
                          </TH>
                          {cells.map((req, i) => {
                            const p = parts(weekDays[i]);
                            const dayText = DAY_ABBR[i] + " " + p.day + " " + MON_ABBR[p.month];
                            if (!req) {
                              return (
                                <TD
                                  key={weekDays[i]}
                                  className="px-3 py-5 text-center"
                                  style={{ borderLeft: "1px solid " + ink, color: muted }}
                                >
                                  <span aria-hidden="true">·</span>
                                  <span className="sr-only">
                                    {person.full_name} available {dayText}
                                  </span>
                                </TD>
                              );
                            }
                            const isStart = i === 0 || cells[i - 1] !== req;
                            return (
                              <TD
                                key={weekDays[i]}
                                className="px-0 py-3"
                                style={{ borderLeft: "1px solid " + ink }}
                              >
                                <span
                                  className="bs-run flex h-10 items-center justify-center px-2 text-[10px] uppercase tracking-[0.14em]"
                                  style={chipFor(req)}
                                  aria-hidden="true"
                                >
                                  {isStart
                                    ? req.leave_type === "annual"
                                      ? "Annual"
                                      : "Sick"
                                    : "→"}
                                </span>
                                <span className="sr-only">
                                  {person.full_name} on {req.leave_type} leave, {dayText}
                                </span>
                              </TD>
                            );
                          })}
                        </TR>
                      ))}
                </TBody>
              </Table>
            </div>

            {!loading && rows.length === 0 && (
              <div className="bs-in p-6 sm:p-8">
                {approvedThisWeek.length === 0 ? (
                  <Empty
                    title="Nobody is away this week"
                    description={
                      "No approved leave falls between " +
                      longDate(weekDays[0]) +
                      " and " +
                      longDate(weekDays[4]) +
                      ". Full team in, Monday to Friday."
                    }
                  />
                ) : (
                  <Empty
                    title={"No " + leaveType + " leave that week"}
                    description={
                      "Colleagues are away between " +
                      longDate(weekDays[0]) +
                      " and " +
                      longDate(weekDays[4]) +
                      ", but none of it is " +
                      leaveType +
                      " leave. Clear the filter to see the whole week."
                    }
                    action={
                      <Button
                        type="button"
                        className="bs-btn h-11 px-4 text-xs uppercase tracking-[0.14em]"
                        onClick={() => setLeaveType("all")}
                      >
                        Show all leave types
                      </Button>
                    }
                  />
                )}
              </div>
            )}

            {!loading && pendingThisWeek > 0 && (
              <p
                className="px-5 py-4 text-xs sm:px-6"
                style={{
                  borderTop: "1px solid " + ink,
                  color: muted,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {pendingThisWeek} pending {pendingThisWeek === 1 ? "request" : "requests"}{" "}
                overlapping this week is not shown — decisions appear here once a manager approves.
              </p>
            )}
          </section>

          {/* ── Row 4 ── on leave today */}
          <section data-wf="b-3-0" className="col-span-12 p-5 sm:p-6" style={boxStyle}>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2
                style={{
                  fontFamily: brand.fontHeading,
                  fontSize: "clamp(22px, 2.6vw, 28px)",
                  color: ink,
                }}
              >
                On leave today, {longDate(TODAY)}
              </h2>
              <span
                className="text-[11px] uppercase"
                style={{ ...labelStyle, fontVariantNumeric: "tabular-nums" }}
              >
                {onLeaveToday.length} of {TEAM.length} away
              </span>
            </div>

            {onLeaveToday.length === 0 ? (
              <p className="mt-5 text-sm" style={{ color: muted }}>
                Nobody is on approved leave today — the whole team is in.
              </p>
            ) : (
              <ul className="mt-5" style={{ borderTop: "1px solid " + ink }}>
                {onLeaveToday.map((entry, i) => (
                  <li
                    key={entry.req.id}
                    data-wf={"i-3-0-" + i}
                    className="flex flex-wrap items-center justify-between gap-3 py-4"
                    style={{ borderBottom: "1px solid " + ink }}
                  >
                    <span className="flex items-center gap-3">
                      <Avatar name={entry.person.full_name} className="h-9 w-9" />
                      <span className="text-sm">{entry.person.full_name}</span>
                      <span className="text-[11px] uppercase" style={labelStyle}>
                        {entry.person.team}
                      </span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span
                        className="text-[11px] uppercase"
                        style={{ ...labelStyle, fontVariantNumeric: "tabular-nums" }}
                      >
                        Back {longDate(addDays(entry.req.end_date, 1))}
                      </span>
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em]"
                        style={{ border: "3px solid " + ink, backgroundColor: ink, color: paper }}
                      >
                        <Icons.Check className="h-3.5 w-3.5" aria-hidden="true" />
                        On leave
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* ── Row 5 ── privacy note */}
          <section data-wf="b-4-0" className="col-span-12">
            <div
              className="flex gap-4 p-5 sm:p-6"
              style={{ border: "3px dashed " + ink, backgroundColor: paper }}
            >
              <span
                className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center"
                style={{ backgroundColor: accent, color: paper }}
              >
                <Icons.AlertCircle className="h-4 w-4" aria-hidden="true" />
              </span>
              <p className="max-w-[72ch] text-sm leading-relaxed" style={{ color: ink }}>
                Only approved leave is shown; pending requests do not appear. Reasons, including
                sick-leave reasons, are never shown here.
              </p>
            </div>
          </section>

          {/* ── Row 6 ── primary action */}
          <div className="col-span-12 md:col-span-4">
            <Button
              data-wf="b-5-0"
              type="button"
              className="bs-btn bs-primary inline-flex h-14 w-full items-center justify-center gap-2 px-6 text-sm uppercase tracking-[0.16em]"
              onClick={() => navigate("my-leave")}
            >
              <Icons.Plus className="h-5 w-5" aria-hidden="true" />
              Request leave
            </Button>
            <p className="mt-3 text-xs leading-relaxed" style={{ color: muted }}>
              Opens My Leave, where you set dates, type and reason.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
