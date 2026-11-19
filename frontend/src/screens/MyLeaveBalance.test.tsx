import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import MyLeave from "./MyLeave";
import { clearSessionToken, setSessionToken } from "@/lib/api";

const MINE = [
  {
    id: "lr-1",
    employee_id: "u-1",
    employee_name: "Sam Okafor",
    start_date: "2026-03-02",
    end_date: "2026-03-06",
    leave_type: "annual",
    reason: "Family visit",
    working_days: 5,
    status: "approved",
    has_overlap: false,
    manager_comment: "Looks good",
    decided_by: "u-2",
    decided_at: "2026-02-18T00:00:00Z",
    created_at: "2026-02-16T00:00:00Z",
  },
];

// Sequential mock: call 0 is always the list fetch (/leave-requests/mine), call 1
// is always the balance fetch (/balances/mine) -- the component fires both from
// the same mount effect, in that order.
function mockFetchSequence(responses: Array<{ status: number; body: unknown }>) {
  let call = 0;
  return vi.fn().mockImplementation(() => {
    const r = responses[Math.min(call, responses.length - 1)];
    call += 1;
    return Promise.resolve({
      ok: r.status >= 200 && r.status < 300,
      status: r.status,
      statusText: "",
      clone() {
        return this;
      },
      json: async () => r.body,
    });
  });
}

describe("MyLeave balance panel and overlap badge", () => {
  beforeEach(() => {
    clearSessionToken();
    setSessionToken("test-token");
  });

  afterEach(() => {
    clearSessionToken();
    vi.unstubAllGlobals();
  });

  it("[AC-016][AC-018] the balance panel shows remaining of allocated days, labelled with the year", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetchSequence([
        { status: 200, body: [] },
        {
          status: 200,
          body: {
            year: 2026,
            allocated_days: 20,
            adjustment_days: 0,
            approved_annual_days: 5,
            remaining_days: 15,
          },
        },
      ]),
    );
    render(<MyLeave />);

    expect(await screen.findByText("15 of 20")).toBeInTheDocument();
    expect(screen.getByText("Balance for 2026")).toBeInTheDocument();
  });

  it("[AC-016] the balance panel shows the HR adjustment effect", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetchSequence([
        { status: 200, body: [] },
        {
          status: 200,
          body: {
            year: 2026,
            allocated_days: 20,
            adjustment_days: 5,
            approved_annual_days: 0,
            remaining_days: 25,
          },
        },
      ]),
    );
    render(<MyLeave />);

    expect(await screen.findByText("25 of 20")).toBeInTheDocument();
    expect(screen.getByText(/HR adjustment of \+5 days/)).toBeInTheDocument();
  });

  it("[AC-018] a new calendar year with no adjustment or approvals reads 20 of 20", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetchSequence([
        { status: 200, body: [] },
        {
          status: 200,
          body: {
            year: 2027,
            allocated_days: 20,
            adjustment_days: 0,
            approved_annual_days: 0,
            remaining_days: 20,
          },
        },
      ]),
    );
    render(<MyLeave />);

    expect(await screen.findByText("20 of 20")).toBeInTheDocument();
    expect(screen.getByText("Balance for 2027")).toBeInTheDocument();
  });

  it("the balance panel shows an error state with retry when its fetch fails", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetchSequence([
        { status: 200, body: [] },
        { status: 500, body: { detail: "boom" } },
      ]),
    );
    render(<MyLeave />);

    expect(await screen.findByText("Could not load your balance")).toBeInTheDocument();
  });

  it("[AC-017] approved sick leave is listed but visibly excluded from the annual balance figure", async () => {
    const sick = [
      {
        id: "lr-2",
        employee_id: "u-1",
        employee_name: "Sam Okafor",
        start_date: "2026-05-04",
        end_date: "2026-05-05",
        leave_type: "sick",
        reason: "Flu",
        working_days: 2,
        status: "approved",
        has_overlap: false,
        manager_comment: null,
        decided_by: "u-2",
        decided_at: "2026-05-03T00:00:00Z",
        created_at: "2026-05-01T00:00:00Z",
      },
    ];
    vi.stubGlobal(
      "fetch",
      mockFetchSequence([
        { status: 200, body: sick },
        {
          status: 200,
          body: {
            year: 2026,
            allocated_days: 20,
            adjustment_days: 0,
            approved_annual_days: 0,
            remaining_days: 20,
          },
        },
      ]),
    );
    render(<MyLeave />);

    expect(await screen.findByText("Sick")).toBeInTheDocument();
    expect(screen.getByText("20 of 20")).toBeInTheDocument();
    expect(screen.getByText("Excluded from annual balance")).toBeInTheDocument();
  });

  it("a row whose has_overlap is true carries a visible overlap warning badge", async () => {
    const overlapping = [{ ...MINE[0], has_overlap: true }];
    vi.stubGlobal("fetch", mockFetchSequence([{ status: 200, body: overlapping }]));
    render(<MyLeave />);

    await screen.findByText("Approved");
    const badges = screen.getAllByText("Overlap").filter((el) => el.tagName !== "TH");
    expect(badges.length).toBeGreaterThan(0);
  });

  it("a row without overlap shows no overlap badge", async () => {
    vi.stubGlobal("fetch", mockFetchSequence([{ status: 200, body: MINE }]));
    render(<MyLeave />);

    await screen.findByText("Approved");
    const badges = screen.queryAllByText("Overlap").filter((el) => el.tagName !== "TH");
    expect(badges.length).toBe(0);
  });
});
