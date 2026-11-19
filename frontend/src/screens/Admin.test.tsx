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

const ME_EMPLOYEE = {
  id: "u-emp",
  full_name: "Sam Okafor",
  role: "employee",
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

describe("Admin", () => {
  beforeEach(() => {
    clearSessionToken();
  });

  afterEach(() => {
    clearSessionToken();
    vi.unstubAllGlobals();
  });

  it("[AC-028] lists users from GET /admin/users for an HR/Admin session", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetchSequence([
        { status: 200, body: ME_HR_ADMIN },
        { status: 200, body: USERS },
      ]),
    );
    render(<Admin />);

    expect(await screen.findByText("Amara Bello")).toBeInTheDocument();
    const priyaRow = screen.getAllByText("Priya Raghunathan")[0].closest("tr")!;
    expect(within(priyaRow).getByText("Priya Raghunathan")).toBeInTheDocument();
  });

  it("the whole screen shows an HR/Admin only message for a non-HR/Admin session", async () => {
    vi.stubGlobal("fetch", mockFetchSequence([{ status: 200, body: ME_EMPLOYEE }]));
    render(<Admin />);

    expect(await screen.findByText("HR/Admin only")).toBeInTheDocument();
    expect(screen.queryByText("Amara Bello")).not.toBeInTheDocument();
  });

  it("[AC-028] add-user success posts {full_name, role} and the new user appears without a manual reload", async () => {
    const fetchMock = mockFetchSequence([
      { status: 200, body: ME_HR_ADMIN },
      { status: 200, body: USERS },
      { status: 201, body: { ...USERS[0], id: "u-3", full_name: "Nils Sorensen" } },
      { status: 200, body: [...USERS, { ...USERS[0], id: "u-3", full_name: "Nils Sorensen" }] },
    ]);
    vi.stubGlobal("fetch", fetchMock);
    render(<Admin />);

    await screen.findByText("Amara Bello");
    fireEvent.click(screen.getByRole("button", { name: /Add user/i }));

    const nameInput = screen.getByLabelText("New user full name");
    fireEvent.change(nameInput, { target: { value: "Nils Sorensen" } });
    const roleSelect = screen.getByLabelText("New user role");
    fireEvent.change(roleSelect, { target: { value: "employee" } });

    fireEvent.click(screen.getByRole("button", { name: /Create user/i }));

    await waitFor(() => expect(screen.getByText("Nils Sorensen")).toBeInTheDocument());

    const postCall = fetchMock.mock.calls.find(
      (c) => c[1]?.method === "POST" && c[0].toString().includes("/admin/users"),
    );
    expect(postCall).toBeTruthy();
    expect(JSON.parse(postCall![1].body as string)).toEqual({
      full_name: "Nils Sorensen",
      role: "employee",
    });
  });

  it("[AC-028] add-user validation error shows inline messages and never calls the API", async () => {
    const fetchMock = mockFetchSequence([
      { status: 200, body: ME_HR_ADMIN },
      { status: 200, body: USERS },
    ]);
    vi.stubGlobal("fetch", fetchMock);
    render(<Admin />);

    await screen.findByText("Amara Bello");
    fireEvent.click(screen.getByRole("button", { name: /Add user/i }));
    fireEvent.click(screen.getByRole("button", { name: /Create user/i }));

    expect(await screen.findByText("Full name is required.")).toBeInTheDocument();
    expect(fetchMock.mock.calls.some((c) => c[1]?.method === "POST")).toBe(false);
  });

  it("[AC-029] deactivate calls PATCH {is_active:false}, renders the row inactive, and explains sign-in is blocked", async () => {
    const deactivated = { ...USERS[0], is_active: false };
    const fetchMock = mockFetchSequence([
      { status: 200, body: ME_HR_ADMIN },
      { status: 200, body: USERS },
      { status: 200, body: deactivated },
    ]);
    vi.stubGlobal("fetch", fetchMock);
    render(<Admin />);

    await screen.findByText("Amara Bello");
    const row = screen.getByText("Amara Bello").closest("tr")!;
    fireEvent.click(within(row).getByRole("button", { name: /Deactivate/i }));
    fireEvent.click(screen.getByRole("button", { name: /Yes, deactivate/i }));

    await waitFor(() => expect(within(row).getByText("Deactivated")).toBeInTheDocument());
    expect(within(row).getByText(/can no longer sign in/i)).toBeInTheDocument();

    const patchCall = fetchMock.mock.calls.find(
      (c) => c[1]?.method === "PATCH" && c[0].toString().includes("/admin/users/u-1"),
    );
    expect(JSON.parse(patchCall![1].body as string)).toEqual({ is_active: false });
  });

  it("[AC-030] manager assignment saves via PATCH {manager_id}", async () => {
    const updated = { ...USERS[0], manager_id: "u-2" };
    const fetchMock = mockFetchSequence([
      { status: 200, body: ME_HR_ADMIN },
      { status: 200, body: USERS },
      { status: 200, body: updated },
    ]);
    vi.stubGlobal("fetch", fetchMock);
    render(<Admin />);

    await screen.findByText("Amara Bello");
    const managerSelect = screen.getByLabelText("Manager for Amara Bello");
    fireEvent.change(managerSelect, { target: { value: "u-2" } });

    await waitFor(() => {
      const patchCall = fetchMock.mock.calls.find(
        (c) => c[1]?.method === "PATCH" && c[0].toString().includes("/admin/users/u-1"),
      );
      expect(patchCall).toBeTruthy();
      expect(JSON.parse(patchCall![1].body as string)).toEqual({ manager_id: "u-2" });
    });
  });
});
