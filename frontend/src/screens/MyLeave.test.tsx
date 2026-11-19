import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import MyLeave from "./MyLeave";
import { clearSessionToken, setSessionToken } from "@/lib/api";

const MINE: Array<Record<string, unknown>> = [
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

function fillValidForm() {
  fireEvent.change(screen.getByLabelText("Start date"), { target: { value: "2026-04-06" } });
  fireEvent.change(screen.getByLabelText("End date"), { target: { value: "2026-04-10" } });
  fireEvent.change(screen.getByLabelText("Leave type"), { target: { value: "annual" } });
  fireEvent.change(screen.getByLabelText("Reason"), { target: { value: "A trip" } });
}

describe("MyLeave", () => {
  beforeEach(() => {
    clearSessionToken();
    setSessionToken("test-token");
  });

  afterEach(() => {
    clearSessionToken();
    vi.unstubAllGlobals();
  });

  it("[AC-009] lists my requests from GET /leave-requests/mine with status and working_days", async () => {
    vi.stubGlobal("fetch", mockFetchSequence([{ status: 200, body: MINE }]));
    render(<MyLeave />);

    expect(await screen.findByText("Approved")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("the list shows an empty state when no requests exist", async () => {
    vi.stubGlobal("fetch", mockFetchSequence([{ status: 200, body: [] }]));
    render(<MyLeave />);

    expect(await screen.findByText("No leave filed yet")).toBeInTheDocument();
  });

  it("the list shows an error state with retry when the fetch fails", async () => {
    vi.stubGlobal("fetch", mockFetchSequence([{ status: 500, body: { detail: "boom" } }]));
    render(<MyLeave />);

    expect(await screen.findByText("Could not load your requests")).toBeInTheDocument();
  });

  it("[AC-009] successful submission posts to /leave-requests and the new request appears Pending with its working_days, with no manual reload", async () => {
    const created = {
      id: "lr-9",
      employee_id: "u-1",
      employee_name: "Sam Okafor",
      start_date: "2026-04-06",
      end_date: "2026-04-10",
      leave_type: "annual",
      reason: "A trip",
      working_days: 5,
      status: "pending",
      has_overlap: false,
      manager_comment: null,
      decided_by: null,
      decided_at: null,
      created_at: "2026-02-19T00:00:00Z",
    };
    const fetchMock = mockFetchSequence([
      { status: 200, body: [] },
      { status: 201, body: created },
    ]);
    vi.stubGlobal("fetch", fetchMock);
    render(<MyLeave />);

    await screen.findByText("No leave filed yet");
    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: /submit request/i }));

    await waitFor(() => expect(screen.getByText("Pending")).toBeInTheDocument());
    expect(screen.getByText("5")).toBeInTheDocument();

    const postCall = fetchMock.mock.calls.find(
      (c) => c[1]?.method === "POST" && c[0].toString().includes("/leave-requests"),
    );
    expect(JSON.parse(postCall![1].body as string)).toEqual({
      start_date: "2026-04-06",
      end_date: "2026-04-10",
      leave_type: "annual",
      reason: "A trip",
    });
  });

  it("[AC-010] leaving the start date empty blocks submit and names the field", async () => {
    vi.stubGlobal("fetch", mockFetchSequence([{ status: 200, body: [] }]));
    render(<MyLeave />);
    await screen.findByText("No leave filed yet");

    fireEvent.change(screen.getByLabelText("End date"), { target: { value: "2026-04-10" } });
    fireEvent.change(screen.getByLabelText("Leave type"), { target: { value: "annual" } });
    fireEvent.change(screen.getByLabelText("Reason"), { target: { value: "A trip" } });
    fireEvent.click(screen.getByRole("button", { name: /submit request/i }));

    expect(await screen.findByText("Pick a start date.")).toBeInTheDocument();
  });

  it("[AC-010] leaving the end date empty blocks submit and names the field", async () => {
    vi.stubGlobal("fetch", mockFetchSequence([{ status: 200, body: [] }]));
    render(<MyLeave />);
    await screen.findByText("No leave filed yet");

    fireEvent.change(screen.getByLabelText("Start date"), { target: { value: "2026-04-06" } });
    fireEvent.change(screen.getByLabelText("Leave type"), { target: { value: "annual" } });
    fireEvent.change(screen.getByLabelText("Reason"), { target: { value: "A trip" } });
    fireEvent.click(screen.getByRole("button", { name: /submit request/i }));

    expect(await screen.findByText("Pick an end date.")).toBeInTheDocument();
  });

  it("[AC-010] leaving the type empty blocks submit and names the field", async () => {
    vi.stubGlobal("fetch", mockFetchSequence([{ status: 200, body: [] }]));
    render(<MyLeave />);
    await screen.findByText("No leave filed yet");

    fireEvent.change(screen.getByLabelText("Start date"), { target: { value: "2026-04-06" } });
    fireEvent.change(screen.getByLabelText("End date"), { target: { value: "2026-04-10" } });
    fireEvent.change(screen.getByLabelText("Reason"), { target: { value: "A trip" } });
    fireEvent.click(screen.getByRole("button", { name: /submit request/i }));

    expect(await screen.findByText("Choose annual or sick.")).toBeInTheDocument();
  });

  it("[AC-010] leaving the reason empty blocks submit and names the field", async () => {
    vi.stubGlobal("fetch", mockFetchSequence([{ status: 200, body: [] }]));
    render(<MyLeave />);
    await screen.findByText("No leave filed yet");

    fireEvent.change(screen.getByLabelText("Start date"), { target: { value: "2026-04-06" } });
    fireEvent.change(screen.getByLabelText("End date"), { target: { value: "2026-04-10" } });
    fireEvent.change(screen.getByLabelText("Leave type"), { target: { value: "annual" } });
    fireEvent.click(screen.getByRole("button", { name: /submit request/i }));

    expect(await screen.findByText("Add a reason.")).toBeInTheDocument();
  });

  it("[AC-010] a mapped server 422 (no working day in range) is shown inline on end date, not as a thrown error", async () => {
    const fetchMock = mockFetchSequence([
      { status: 200, body: [] },
      {
        status: 422,
        body: { detail: "date range contains no Monday-to-Friday day" },
      },
    ]);
    vi.stubGlobal("fetch", fetchMock);
    render(<MyLeave />);
    await screen.findByText("No leave filed yet");

    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: /submit request/i }));

    expect(
      await screen.findByText("That range has no working day in it — Mon–Fri only."),
    ).toBeInTheDocument();
  });

  it("[AC-011][AC-012] the list renders the server's working_days as a whole number without computing its own length", async () => {
    vi.stubGlobal("fetch", mockFetchSequence([{ status: 200, body: MINE }]));
    render(<MyLeave />);

    expect(await screen.findByText("5")).toBeInTheDocument();
    expect(screen.queryByText(/half-day/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/public holiday/i)).not.toBeInTheDocument();
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

    render(<MyLeave />);

    await waitFor(() => expect(window.location.href).toBe("/sign-in"));
    expect(localStorage.getItem("session_token")).toBeNull();

    Object.defineProperty(window, "location", {
      writable: true,
      configurable: true,
      value: originalLocation,
    });
  });
});
