// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { Home, ArrowLeft, ArrowRight } = Icons;

const TABS = [
  { key: 'everyone', label: 'Everyone', wf: 'i-2-0-0' },
  { key: 'employee', label: 'Employee', wf: 'i-2-0-1' },
  { key: 'manager', label: 'Manager', wf: 'i-2-0-2' },
  { key: 'hr', label: 'HR/Admin', wf: 'i-2-0-3' },
];

const GUIDE = [
  {
    wf: 'b-3-0',
    n: '01',
    title: 'Pick your identity',
    icon: Icons.User,
    where: 'Choose Your Identity',
    lead:
      'Choose your name from the active user list to start a session; sign out when you finish.',
    roles: {
      everyone: {
        applies: true,
        steps: [
          'Open Choose Your Identity and select your name from the active list.',
          'Anyone deactivated is not listed — ask HR/Admin if your name is missing.',
          'Sign out when you finish. A long idle spell ends the session for you.',
        ],
      },
      employee: {
        applies: true,
        steps: [
          'Pick your own name. The app then shows your requests, your balance and the team calendar.',
          'You cannot decide requests, and colleagues never see the reason you wrote.',
          'On a shared machine, sign out at the end of the day.',
        ],
      },
      manager: {
        applies: true,
        steps: [
          'Pick your own name. Approvals opens with the pending requests of your direct reports.',
          'Requests from people who do not report to you never reach your queue.',
          'Sign out once you have cleared the queue.',
        ],
      },
      hr: {
        applies: true,
        steps: [
          'Pick your own name. Administration unlocks alongside everything an employee sees.',
          'Deactivate a leaver in Administration — they drop off this list and any open session as them ends.',
          'The audit log is yours alone; Employees and Managers are refused access to it.',
        ],
      },
    },
  },
  {
    wf: 'b-3-1',
    n: '02',
    title: 'Submit leave',
    icon: Icons.FileText,
    where: 'My Leave',
    lead:
      'Enter start and end dates, choose annual or sick, add a reason; length counts Mon–Fri only.',
    roles: {
      everyone: {
        applies: true,
        steps: [
          'Start date, end date, type and reason are all required — the form tells you which one is missing.',
          'Length counts Monday to Friday. No half-days, and version 1 has no public-holiday calendar.',
          'A new request is Pending until a manager decides on it.',
        ],
      },
      employee: {
        applies: true,
        steps: [
          'Annual leave draws on 20 days per calendar year. It resets each January with no carryover.',
          'Sick leave is uncapped and never touches the 20-day annual balance.',
          'Overlap an existing pending or approved request and the app flags it for you and your manager.',
        ],
      },
      manager: {
        applies: false,
        steps: [
          'You book your own leave exactly as your team does — it goes to whoever you report to.',
          'Your own request never appears in your own approvals queue.',
        ],
      },
      hr: {
        applies: false,
        steps: [
          'You book your own leave exactly as everyone else does.',
          'A balance correction is not a request — make it in Administration, step 04.',
        ],
      },
    },
  },
  {
    wf: 'b-4-0',
    n: '03',
    title: 'Approve as a manager',
    icon: Icons.CheckCircle,
    where: 'Approvals',
    lead:
      'Review pending requests from your direct reports and approve or reject with a comment.',
    roles: {
      everyone: {
        applies: true,
        steps: [
          'Managers see pending requests from their direct reports and nobody else.',
          'Every decision carries a comment, so the employee gets a reason and not just a verdict.',
        ],
      },
      employee: {
        applies: false,
        steps: [
          'Nothing to do here — your request sits with your manager until they decide.',
          'The decision and their comment appear on My Leave. You never resubmit.',
        ],
      },
      manager: {
        applies: true,
        steps: [
          'Each row shows employee, dates, type, working days, reason, remaining balance and any overlap flag.',
          'Approve or reject with a comment; the employee sees the outcome on My Leave straight away.',
          'Annual leave longer than the remaining balance is blocked. Sick leave can always be approved.',
        ],
      },
      hr: {
        applies: false,
        steps: [
          'HR/Admin does not decide requests — managers do.',
          'If a request lands in the wrong queue, correct the reporting line in Administration.',
        ],
      },
    },
  },
  {
    wf: 'b-4-1',
    n: '04',
    title: 'Administer as HR/Admin',
    icon: Icons.Settings,
    where: 'Administration',
    lead:
      'Add users, set reporting lines, correct balances with a note, review the audit log.',
    roles: {
      everyone: {
        applies: true,
        steps: [
          'HR/Admin keeps the user list, the reporting lines and the balances correct.',
          'Submissions, decisions and balance changes are all written to the audit log.',
        ],
      },
      employee: {
        applies: false,
        steps: [
          'HR/Admin only. If your balance looks wrong — a mid-year start, say — ask HR to correct it with a note.',
        ],
      },
      manager: {
        applies: false,
        steps: [
          'HR/Admin only. Ask HR to add a new starter, or to move a reporting line onto your team.',
        ],
      },
      hr: {
        applies: true,
        steps: [
          'Add a user with a name and a role — Employee, Manager or HR/Admin. They appear on the sign-in list at once.',
          'Set each employee’s manager so their future requests route to the right queue.',
          'Correct a remaining balance with a note; the change is logged with your name and the time.',
        ],
      },
    },
  },
];

export default function Screen() {
  const navigate = useNavigate();
  const [active, setActive] = React.useState('everyone');
  const tabRefs = React.useRef([]);

  const ink = brand.primaryColor;
  const paper = brand.backgroundColor;
  const neutral = brand.neutralColor;
  const accent = brand.accentColor;

  const hard = {
    border: `3px solid ${ink}`,
    borderRadius: 0,
    boxShadow: `6px 6px 0 ${ink}`,
  };

  const activeIndex = TABS.findIndex((t) => t.key === active);

  const onTabKeyDown = (e) => {
    const last = TABS.length - 1;
    let next = null;
    if (e.key === 'ArrowRight') next = activeIndex === last ? 0 : activeIndex + 1;
    if (e.key === 'ArrowLeft') next = activeIndex === 0 ? last : activeIndex - 1;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = last;
    if (next === null) return;
    e.preventDefault();
    setActive(TABS[next].key);
    const node = tabRefs.current[next];
    if (node) node.focus();
  };

  const roleWord =
    active === 'everyone'
      ? 'the whole team'
      : active === 'hr'
      ? 'HR/Admin'
      : active === 'manager'
      ? 'managers'
      : 'employees';

  const css = `
    .gs-focus:focus-visible { outline: 3px solid ${accent}; outline-offset: 3px; }
    .gs-press { transition: transform .12s ease, box-shadow .12s ease, background-color .12s ease, color .12s ease; }
    .gs-press:active { transform: translate(3px, 3px); box-shadow: 3px 3px 0 ${ink} !important; }
    .gs-panel > * { animation: gs-rise .3s cubic-bezier(.2,.7,.3,1) both; }
    .gs-panel > *:nth-child(2) { animation-delay: .05s; }
    .gs-panel > *:nth-child(3) { animation-delay: .1s; }
    .gs-panel > *:nth-child(4) { animation-delay: .15s; }
    @keyframes gs-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
    @media (prefers-reduced-motion: reduce) {
      .gs-panel > * { animation: none !important; }
      .gs-press, .gs-tab { transition: none !important; }
      .gs-press:active { transform: none; }
    }
  `;

  return (
    <div
      className="w-full"
      style={{ backgroundColor: paper, color: ink, fontFamily: brand.fontBody }}
    >
      <style>{css}</style>

      <div className="mx-auto w-full max-w-5xl px-6 py-10 md:px-10 md:py-16">
        {/* Row 1 — page title */}
        <header data-wf="b-0-0" className="w-full">
          <div
            className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 pb-3 text-[11px] uppercase tracking-[0.22em]"
            style={{ color: neutral, fontVariantNumeric: 'tabular-nums' }}
          >
            <span>Leave handbook — Version 1</span>
            <span>Revised 19 Nov 2026</span>
          </div>
          <div style={{ borderTop: `3px solid ${ink}` }} />
          <h1
            className="mt-6 text-[44px] leading-[1.02] md:text-[64px]"
            style={{ fontFamily: brand.fontHeading, letterSpacing: '-0.01em' }}
          >
            Getting Started
          </h1>
        </header>

        {/* Row 2 — intro text */}
        <p
          data-wf="b-1-0"
          className="mt-6 max-w-[68ch] text-[14px] leading-[1.65] md:text-[15px]"
          style={{ color: ink }}
        >
          This guide covers the four things a small team needs on day one. There are no
          passwords in this app; where a setup guide elsewhere mentions one, it shows a
          placeholder such as{' '}
          <code
            className="px-1.5 py-0.5 text-[13px]"
            style={{ border: `1px solid ${neutral}`, backgroundColor: 'transparent' }}
          >
            &lt;set-at-first-login&gt;
          </code>
          .
        </p>

        {/* Row 3 — tabs */}
        <div data-wf="b-2-0" className="mt-10">
          <p
            id="gs-tabs-label"
            className="mb-3 text-[11px] uppercase tracking-[0.22em]"
            style={{ color: neutral }}
          >
            Read it as
          </p>
          <div
            role="tablist"
            aria-labelledby="gs-tabs-label"
            onKeyDown={onTabKeyDown}
            className="flex flex-wrap"
          >
            {TABS.map((t, i) => {
              const isActive = t.key === active;
              return (
                <button
                  key={t.key}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  data-wf={t.wf}
                  type="button"
                  role="tab"
                  id={`gs-tab-${t.key}`}
                  aria-selected={isActive}
                  aria-controls="gs-panel"
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActive(t.key)}
                  className="gs-focus gs-tab relative -ml-[3px] min-h-[48px] px-5 text-[12px] uppercase tracking-[0.18em] first:ml-0"
                  style={{
                    border: `3px solid ${ink}`,
                    backgroundColor: isActive ? ink : 'transparent',
                    color: isActive ? paper : neutral,
                    fontFamily: brand.fontBody,
                    transition: 'background-color .12s ease, color .12s ease',
                  }}
                >
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 right-0 top-0 h-[5px]"
                      style={{ backgroundColor: accent }}
                    />
                  )}
                  {t.label}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-[12px]" style={{ color: neutral }}>
            Showing the steps as {roleWord} will meet them. Cards marked{' '}
            <span className="uppercase tracking-[0.12em]">for reference</span> are someone
            else’s job.
          </p>
        </div>

        {/* Rows 4 & 5 — guidance cards */}
        <div
          id="gs-panel"
          role="tabpanel"
          aria-labelledby={`gs-tab-${active}`}
          tabIndex={-1}
          key={active}
          className="gs-panel mt-8 grid grid-cols-1 gap-7 md:grid-cols-12 md:gap-8"
        >
          {GUIDE.map((item) => {
            const detail = item.roles[active];
            const applies = detail.applies;
            const Icon = item.icon;
            return (
              <article
                key={item.n}
                data-wf={item.wf}
                className="md:col-span-6 p-6 md:p-7"
                style={
                  applies
                    ? { ...hard, backgroundColor: paper }
                    : {
                        border: `3px dashed ${neutral}`,
                        borderRadius: 0,
                        backgroundColor: paper,
                      }
                }
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="text-[34px] leading-none"
                      style={{
                        fontFamily: brand.fontHeading,
                        fontVariantNumeric: 'tabular-nums',
                        color: applies ? ink : neutral,
                      }}
                    >
                      {item.n}
                    </span>
                    <Icon
                      aria-hidden="true"
                      className="h-4 w-4"
                      style={{ color: applies ? ink : neutral }}
                    />
                  </div>
                  <span
                    className="inline-flex items-center gap-1.5 px-2 py-1 text-[10px] uppercase tracking-[0.18em]"
                    style={
                      applies
                        ? { backgroundColor: ink, color: paper }
                        : { border: `1px solid ${neutral}`, color: neutral }
                    }
                  >
                    {applies && <Icons.Check aria-hidden="true" className="h-3 w-3" />}
                    {applies ? 'Applies to you' : 'For reference'}
                  </span>
                </div>

                <h2
                  className="mt-4 text-[26px] leading-tight md:text-[30px]"
                  style={{ fontFamily: brand.fontHeading, color: ink }}
                >
                  {item.title}
                </h2>

                <p
                  className="mt-3 text-[13px] leading-[1.6]"
                  style={{ color: applies ? ink : neutral }}
                >
                  {item.lead}
                </p>

                <ul className="mt-5">
                  {detail.steps.map((s, i) => (
                    <li
                      key={i}
                      className="flex gap-3 py-3 text-[13px] leading-[1.6]"
                      style={{
                        borderTop: `1px dashed ${neutral}66`,
                        color: applies ? ink : neutral,
                      }}
                    >
                      <span
                        aria-hidden="true"
                        className="shrink-0 pt-[2px] text-[11px] tracking-[0.1em]"
                        style={{ color: neutral, fontVariantNumeric: 'tabular-nums' }}
                      >
                        {item.n}.{i + 1}
                      </span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>

                <p
                  className="mt-4 pt-4 text-[11px] uppercase tracking-[0.18em]"
                  style={{ borderTop: `1px solid ${neutral}66`, color: neutral }}
                >
                  Where — {item.where}
                </p>
              </article>
            );
          })}
        </div>

        <div className="mt-12" style={{ borderTop: `3px solid ${ink}` }} />

        {/* Row 6 — actions */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-4">
            <button
              data-wf="b-5-0"
              type="button"
              onClick={() => navigate('my-leave')}
              className="gs-focus gs-press flex w-full min-h-[56px] items-center justify-between gap-3 px-5 text-[13px] uppercase tracking-[0.18em]"
              style={{
                ...hard,
                backgroundColor: accent,
                color: paper,
                fontFamily: brand.fontBody,
              }}
            >
              Submit your first request
              <Icons.ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
            </button>
            <p className="mt-3 text-[12px] leading-[1.5]" style={{ color: neutral }}>
              Opens My Leave, where the form and your 20-day balance sit side by side.
            </p>
          </div>

          <div className="md:col-span-4 md:pt-2">
            <button
              data-wf="b-5-1"
              type="button"
              onClick={() => navigate('approvals')}
              className="gs-focus inline-flex min-h-[48px] items-center gap-2 text-[13px] uppercase tracking-[0.18em] underline underline-offset-[6px]"
              style={{ color: ink, textDecorationThickness: '2px' }}
            >
              Go to approvals
              <Icons.ChevronRight aria-hidden="true" className="h-4 w-4" />
            </button>
            <p className="mt-2 text-[12px] leading-[1.5]" style={{ color: neutral }}>
              Managers and HR/Admin land on the pending queue. Employees see why it is
              empty for them.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
