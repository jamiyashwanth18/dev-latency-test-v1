import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Approvals from "./Approvals";
import { clearSessionToken, setSessionToken } from "@/lib/api";

const PENDING: Array<Record<string, unknown>> = [
  {
    id: "lr-1",
    employee_id: "u-1",
    employee_name: "Sam Okafor",
    start_date: "2026-03-02",
    end_date: "2026-03-06",
    leave_type: "annual",
    reason: "Family holiday",
    working_days: 5,
    status: "pending",
    has_overlap: false,
    remaining_balance: 10,
    manager_comment: null,
    decided_by: null,
    decided_at: null,
    created_at: "2026-02-20T08:41:00Z",
  },
  {
    id: "lr-2",
    employee_id: "u-2",
    employee_name: "Tobias Hale",
    start_date: "2026-03-16",
    end_date: "2026-03-20",
    leave_type: "annual",
    reason: "Moving flat",
    working_days: 5,
    status: "pending",
    has_overlap: true,
    remaining_balance: 11,
    manager_comment: null,
    decided_by: null,
    decided_at: null,
    created_at: "2026-02-23T16:55:00Z",
  },
];

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

describe("Approvals", () => {
  beforeEach(() => {
    clearSessionToken();
    setSessionToken("test-token");
  });

  afterEach(() => {
    clearSessionToken();
    vi.unstubAllGlobals();
  });

  it("[AC-019] loads the pending queue from GET /leave-requests/pending and renders employee, dates, type, working days, reason and remaining balance, with no seeded sample data", async () => {
    vi.stubGlobal("fetch", mockFetchSequence([{ status: 200, body: PENDING }]));
    render(<Approvals />);

    expect(await screen.findByText("Sam Okafor")).toBeInTheDocument();
    expect(screen.getByText("Tobias Hale")).toBeInTheDocument();
    expect(screen.getByText("Family holiday")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.queryByText("Priya Raman")).not.toBeInTheDocument();
    expect(screen.queryByText("LR-1042")).not.toBeInTheDocument();
  });

  it("[AC-013] a request with has_overlap true shows a visible overlap warning", async () => {
    vi.stubGlobal("fetch", mockFetchSequence([{ status: 200, body: PENDING }]));
    render(<Approvals />);

    await screen.findByText("Tobias Hale");
    const row = screen.getByText("Tobias Hale").closest("tr")!;
    expect(within(row).getByText("Overlap")).toBeInTheDocument();
    const samRow = screen.getByText("Sam Okafor").closest("tr")!;
    expect(within(samRow).queryByText("Overlap")).not.toBeInTheDocument();
  });

  it("[AC-038][AC-039] a request whose reason is null renders a 'Restricted' placeholder, not an empty cell", async () => {
    const restricted = [{ ...PENDING[0], reason: null, leave_type: "sick" }];
    vi.stubGlobal("fetch", mockFetchSequence([{ status: 200, body: restricted }]));
    render(<Approvals />);

    expect(await screen.findByText("Restricted")).toBeInTheDocument();
  });

  it("[AC-020] an employee hitting the screen sees the 403 state with no actionable controls", async () => {
    vi.stubGlobal("fetch", mockFetchSequence([{ status: 403, body: { detail: "Not allowed" } }]));
    render(<Approvals />);

    expect(await screen.findByText("Managers only")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Decide/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Approve/i })).not.toBeInTheDocument();
  });

  it("approve or reject without a comment is blocked and shows that a comment is required", async () => {
    vi.stubGlobal("fetch", mockFetchSequence([{ status: 200, body: PENDING }]));
    render(<Approvals />);

    await screen.findByText("Sam Okafor");
    const row = screen.getByText("Sam Okafor").closest("tr")!;
    fireEvent.click(within(row).getByRole("button", { name: /Decide on Sam Okafor/i }));

    fireEvent.click(screen.getByRole("button", { name: "Approve" }));

    expect(await screen.findByText("A comment is required.")).toBeInTheDocument();
  });

  it("approve posts to /leave-requests/{id}/decision with the comment and removes the row on success", async () => {
    const fetchMock = mockFetchSequence([
      { status: 200, body: PENDING },
      { status: 200, body: { ...PENDING[0], status: "approved", manager_comment: "Enjoy" } },
    ]);
    vi.stubGlobal("fetch", fetchMock);
    render(<Approvals />);

    await screen.findByText("Sam Okafor");
    const row = screen.getByText("Sam Okafor").closest("tr")!;
    fireEvent.click(within(row).getByRole("button", { name: /Decide on Sam Okafor/i }));

    fireEvent.change(screen.getByLabelText("Comment"), { target: { value: "Enjoy" } });
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));

    await waitFor(() => expect(screen.queryByText("Sam Okafor")).not.toBeInTheDocument());

    const postCall = fetchMock.mock.calls.find(
      (c) => c[1]?.method === "POST" && c[0].toString().includes("/leave-requests/lr-1/decision"),
    );
    expect(postCall).toBeTruthy();
    expect(JSON.parse(postCall![1].body as string)).toEqual({
      decision: "approve",
      comment: "Enjoy",
    });
  });

  it("a 409 response renders the server's detail message without losing the typed comment", async () => {
    const fetchMock = mockFetchSequence([
      { status: 200, body: PENDING },
      { status: 409, body: { detail: "remaining balance is 2 days" } },
    ]);
    vi.stubGlobal("fetch", fetchMock);
    render(<Approvals />);

    await screen.findByText("Sam Okafor");
    const row = screen.getByText("Sam Okafor").closest("tr")!;
    fireEvent.click(within(row).getByRole("button", { name: /Decide on Sam Okafor/i }));

    fireEvent.change(screen.getByLabelText("Comment"), { target: { value: "Go ahead" } });
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));

    expect(await screen.findByText("remaining balance is 2 days")).toBeInTheDocument();
    expect(screen.getByLabelText("Comment")).toHaveValue("Go ahead");
    expect(screen.getByText("Sam Okafor")).toBeInTheDocument();
  });

  it("a 401 from the list fetch clears the session and returns to sign-in", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetchSequence([{ status: 401, body: { detail: "Not authenticated" } }]),
    );
    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      writable: true,
      configurable: true,
      value: { href: "" },
    });

    render(<Approvals />);

    await waitFor(() => expect(window.location.href).toBe("/sign-in"));
    expect(localStorage.getItem("session_token")).toBeNull();

    Object.defineProperty(window, "location", {
      writable: true,
      configurable: true,
      value: originalLocation,
    });
  });
});
