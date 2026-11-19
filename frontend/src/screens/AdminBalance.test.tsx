import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Admin from "./Admin";
import { clearSessionToken } from "@/lib/api";

const ME_HR_ADMIN = {
  id: "u-hr",
  full_name: "Marguerite Okonjo",
  role: "hr_admin",
  manager_id: null,
  is_active: true,
};

const USERS = [
  {
    id: "u-1",
    full_name: "Amara Bello",
    role: "employee",
    manager_id: null,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "u-2",
    full_name: "Priya Raghunathan",
    role: "manager",
    manager_id: null,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
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

async function openBalancePanelFor(name: string) {
  const row = screen.getByText(name).closest("tr")!;
  fireEvent.click(within(row).getByRole("button", { name: /Adjust balance/i }));
}

describe("Admin balance adjustment", () => {
  beforeEach(() => {
    clearSessionToken();
  });

  afterEach(() => {
    clearSessionToken();
    vi.unstubAllGlobals();
  });

  it("[AC-031] each user row offers an 'Adjust balance' action that opens a panel with a numeric days field and a required note field", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetchSequence([
        { status: 200, body: ME_HR_ADMIN },
        { status: 200, body: USERS },
      ]),
    );
    render(<Admin />);

    await screen.findByText("Amara Bello");
    await openBalancePanelFor("Amara Bello");

    const daysInput = screen.getByLabelText("New remaining days");
    expect(daysInput).toHaveAttribute("type", "number");
    expect(screen.getByLabelText("Note")).toBeInTheDocument();
  });

  it("[AC-031] saving sends PUT /admin/users/{id}/balance with the current UTC year, new_remaining_days and trimmed note, and shows the returned remaining_days, closing the panel", async () => {
    const fetchMock = mockFetchSequence([
      { status: 200, body: ME_HR_ADMIN },
      { status: 200, body: USERS },
      {
        status: 200,
        body: {
          year: new Date().getUTCFullYear(),
          allocated_days: 20,
          adjustment_days: -5,
          approved_annual_days: 0,
          remaining_days: 15,
        },
      },
    ]);
    vi.stubGlobal("fetch", fetchMock);
    render(<Admin />);

    await screen.findByText("Amara Bello");
    await openBalancePanelFor("Amara Bello");

    fireEvent.change(screen.getByLabelText("New remaining days"), { target: { value: "15" } });
    fireEvent.change(screen.getByLabelText("Note"), { target: { value: "  Corrected  " } });
    fireEvent.click(screen.getByRole("button", { name: "Save balance" }));

    await waitFor(() => expect(screen.getByText("15 days")).toBeInTheDocument());

    const putCall = fetchMock.mock.calls.find(
      (c) => c[1]?.method === "PUT" && c[0].toString().includes("/admin/users/u-1/balance"),
    );
    expect(putCall).toBeTruthy();
    expect(JSON.parse(putCall![1].body as string)).toEqual({
      year: new Date().getUTCFullYear(),
      new_remaining_days: 15,
      note: "Corrected",
    });
    expect(screen.queryByLabelText("New remaining days")).not.toBeInTheDocument();
  });

  it("[AC-031] an empty or whitespace-only note blocks the request and shows a visible inline validation error", async () => {
    const fetchMock = mockFetchSequence([
      { status: 200, body: ME_HR_ADMIN },
      { status: 200, body: USERS },
    ]);
    vi.stubGlobal("fetch", fetchMock);
    render(<Admin />);

    await screen.findByText("Amara Bello");
    await openBalancePanelFor("Amara Bello");

    fireEvent.change(screen.getByLabelText("New remaining days"), { target: { value: "10" } });
    fireEvent.change(screen.getByLabelText("Note"), { target: { value: "   " } });
    fireEvent.click(screen.getByRole("button", { name: "Save balance" }));

    expect(await screen.findByText("A note is required.")).toBeInTheDocument();
    expect(
      fetchMock.mock.calls.some(
        (c) => c[1]?.method === "PUT" && c[0].toString().includes("/balance"),
      ),
    ).toBe(false);
  });

  it("[AC-031] a non-integer new remaining days blocks the request and shows a visible inline validation error", async () => {
    const fetchMock = mockFetchSequence([
      { status: 200, body: ME_HR_ADMIN },
      { status: 200, body: USERS },
    ]);
    vi.stubGlobal("fetch", fetchMock);
    render(<Admin />);

    await screen.findByText("Amara Bello");
    await openBalancePanelFor("Amara Bello");

    fireEvent.change(screen.getByLabelText("New remaining days"), { target: { value: "10.5" } });
    fireEvent.change(screen.getByLabelText("Note"), { target: { value: "Fixing" } });
    fireEvent.click(screen.getByRole("button", { name: "Save balance" }));

    expect(await screen.findByText("Enter a whole number of days.")).toBeInTheDocument();
    expect(
      fetchMock.mock.calls.some(
        (c) => c[1]?.method === "PUT" && c[0].toString().includes("/balance"),
      ),
    ).toBe(false);
  });

  it("[AC-031] negative new remaining days is accepted and rendered", async () => {
    const fetchMock = mockFetchSequence([
      { status: 200, body: ME_HR_ADMIN },
      { status: 200, body: USERS },
      {
        status: 200,
        body: {
          year: new Date().getUTCFullYear(),
          allocated_days: 20,
          adjustment_days: -25,
          approved_annual_days: 0,
          remaining_days: -5,
        },
      },
    ]);
    vi.stubGlobal("fetch", fetchMock);
    render(<Admin />);

    await screen.findByText("Amara Bello");
    await openBalancePanelFor("Amara Bello");

    fireEvent.change(screen.getByLabelText("New remaining days"), { target: { value: "-5" } });
    fireEvent.change(screen.getByLabelText("Note"), { target: { value: "Over-taken leave" } });
    fireEvent.click(screen.getByRole("button", { name: "Save balance" }));

    await waitFor(() => expect(screen.getByText("-5 days")).toBeInTheDocument());
  });

  it("[AC-031] a 422 response shows the API detail text inline without closing the panel", async () => {
    const fetchMock = mockFetchSequence([
      { status: 200, body: ME_HR_ADMIN },
      { status: 200, body: USERS },
      { status: 422, body: { detail: "note must not be empty" } },
    ]);
    vi.stubGlobal("fetch", fetchMock);
    render(<Admin />);

    await screen.findByText("Amara Bello");
    await openBalancePanelFor("Amara Bello");

    fireEvent.change(screen.getByLabelText("New remaining days"), { target: { value: "10" } });
    fireEvent.change(screen.getByLabelText("Note"), { target: { value: "Fixing" } });
    fireEvent.click(screen.getByRole("button", { name: "Save balance" }));

    expect(await screen.findByText("note must not be empty")).toBeInTheDocument();
    expect(screen.getByLabelText("New remaining days")).toBeInTheDocument();
  });

  it("[AC-031] a 404 response shows the API detail text inline", async () => {
    const fetchMock = mockFetchSequence([
      { status: 200, body: ME_HR_ADMIN },
      { status: 200, body: USERS },
      { status: 404, body: { detail: "User not found" } },
    ]);
    vi.stubGlobal("fetch", fetchMock);
    render(<Admin />);

    await screen.findByText("Amara Bello");
    await openBalancePanelFor("Amara Bello");

    fireEvent.change(screen.getByLabelText("New remaining days"), { target: { value: "10" } });
    fireEvent.change(screen.getByLabelText("Note"), { target: { value: "Fixing" } });
    fireEvent.click(screen.getByRole("button", { name: "Save balance" }));

    expect(await screen.findByText("User not found")).toBeInTheDocument();
  });

  it("[AC-031] a 403 response shows the HR/Admin-only server message inline", async () => {
    const fetchMock = mockFetchSequence([
      { status: 200, body: ME_HR_ADMIN },
      { status: 200, body: USERS },
      { status: 403, body: { detail: "HR/Admin only" } },
    ]);
    vi.stubGlobal("fetch", fetchMock);
    render(<Admin />);

    await screen.findByText("Amara Bello");
    await openBalancePanelFor("Amara Bello");

    fireEvent.change(screen.getByLabelText("New remaining days"), { target: { value: "10" } });
    fireEvent.change(screen.getByLabelText("Note"), { target: { value: "Fixing" } });
    fireEvent.click(screen.getByRole("button", { name: "Save balance" }));

    expect(await screen.findByText("HR/Admin only")).toBeInTheDocument();
  });

  it("[AC-031] a 401 response clears the stored token and redirects to /sign-in", async () => {
    const fetchMock = mockFetchSequence([
      { status: 200, body: ME_HR_ADMIN },
      { status: 200, body: USERS },
      { status: 401, body: { detail: "Not authenticated" } },
    ]);
    vi.stubGlobal("fetch", fetchMock);
    localStorage.setItem("session_token", "some-token");

    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      writable: true,
      configurable: true,
      value: { href: "" },
    });

    render(<Admin />);

    await screen.findByText("Amara Bello");
    await openBalancePanelFor("Amara Bello");

    fireEvent.change(screen.getByLabelText("New remaining days"), { target: { value: "10" } });
    fireEvent.change(screen.getByLabelText("Note"), { target: { value: "Fixing" } });
    fireEvent.click(screen.getByRole("button", { name: "Save balance" }));

    await waitFor(() => expect(window.location.href).toBe("/sign-in"));
    expect(localStorage.getItem("session_token")).toBeNull();

    Object.defineProperty(window, "location", {
      writable: true,
      configurable: true,
      value: originalLocation,
    });
  });
});
