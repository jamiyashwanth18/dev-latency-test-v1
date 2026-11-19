// @ts-nocheck -- kept consistent with the other generated screens' JS runtime contract.
 
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { apiFetch, ApiError, clearSessionToken } from "@/lib/api";

const { Button, Input, Select, Badge, Table, THead, TBody, TR, TH, TD, Avatar, Empty } = UI;

const { Plus, Check, X, AlertCircle } = Icons;

const ROLE_OPTIONS = [
  { value: "employee", label: "Employee" },
  { value: "manager", label: "Manager" },
  { value: "hr_admin", label: "HR/Admin" },
];

function roleLabel(role) {
  const found = ROLE_OPTIONS.find((r) => r.value === role);
  return found ? found.label : role;
}

export default function Screen() {
  const [meState, setMeState] = React.useState("loading"); // loading | forbidden | ready | error
  const [me, setMe] = React.useState(null);
  const [meError, setMeError] = React.useState("");

  const [listState, setListState] = React.useState("loading"); // loading | error | ready
  const [listError, setListError] = React.useState("");
  const [users, setUsers] = React.useState([]);

  const [adding, setAdding] = React.useState(false);
  const [newUser, setNewUser] = React.useState({ full_name: "", role: "employee", manager_id: "" });
  const [newUserErrors, setNewUserErrors] = React.useState({});
  const [newUserServerError, setNewUserServerError] = React.useState("");
  const [creating, setCreating] = React.useState(false);

  const [editingId, setEditingId] = React.useState(null);
  const [editDraft, setEditDraft] = React.useState(null);
  const [editErrors, setEditErrors] = React.useState({});
  const [rowServerError, setRowServerError] = React.useState({});
  const [confirmId, setConfirmId] = React.useState(null);
  const [savingId, setSavingId] = React.useState(null);

  const loadMe = React.useCallback(() => {
    setMeState("loading");
    setMeError("");
    apiFetch("/me")
      .then((data) => {
        setMe(data);
        setMeState(data.role === "hr_admin" ? "ready" : "forbidden");
      })
      .catch((err) => {
        setMeError(err instanceof Error ? err.message : "Could not check your permissions.");
        setMeState("error");
      });
  }, []);

  const loadUsers = React.useCallback(() => {
    setListState("loading");
    setListError("");
    apiFetch("/admin/users")
      .then((data) => {
        setUsers(data);
        setListState("ready");
      })
      .catch((err) => {
        setListError(err instanceof Error ? err.message : "Could not load the user list.");
        setListState("error");
      });
  }, []);

  React.useEffect(() => {
    loadMe();
  }, [loadMe]);

  React.useEffect(() => {
    if (meState === "ready") loadUsers();
  }, [meState, loadUsers]);

  const managers = users.filter((u) => u.role === "manager" && u.is_active);
  const byId = React.useMemo(() => {
    const map = {};
    users.forEach((u) => {
      map[u.id] = u;
    });
    return map;
  }, [users]);

  function startAdd() {
    setAdding(true);
    setNewUser({ full_name: "", role: "employee", manager_id: "" });
    setNewUserErrors({});
    setNewUserServerError("");
  }

  function cancelAdd() {
    setAdding(false);
    setNewUserErrors({});
    setNewUserServerError("");
  }

  function validateNewUser() {
    const errs = {};
    if (!newUser.full_name.trim()) errs.full_name = "Full name is required.";
    if (!newUser.role) errs.role = "Role is required.";
    return errs;
  }

  async function submitNewUser() {
    const errs = validateNewUser();
    setNewUserErrors(errs);
    setNewUserServerError("");
    if (Object.keys(errs).length) return;

    setCreating(true);
    try {
      const payload = {
        full_name: newUser.full_name.trim(),
        role: newUser.role,
      };
      if (newUser.manager_id) payload.manager_id = newUser.manager_id;
      await apiFetch("/admin/users", { method: "POST", body: JSON.stringify(payload) });
      setAdding(false);
      setNewUser({ full_name: "", role: "employee", manager_id: "" });
      loadUsers();
    } catch (err) {
      if (err instanceof ApiError) {
        setNewUserServerError(err.message || "Could not create that user.");
      } else {
        setNewUserServerError("Could not create that user. Try again.");
      }
    } finally {
      setCreating(false);
    }
  }

  function startEdit(u) {
    setEditingId(u.id);
    setEditDraft({ full_name: u.full_name, role: u.role });
    setEditErrors({});
    setRowServerError((prev) => ({ ...prev, [u.id]: "" }));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft(null);
    setEditErrors({});
  }

  async function saveEdit(u) {
    const errs = {};
    if (!editDraft.full_name.trim()) errs.full_name = "Full name is required.";
    if (!editDraft.role) errs.role = "Role is required.";
    setEditErrors(errs);
    if (Object.keys(errs).length) return;

    setSavingId(u.id);
    try {
      const updated = await apiFetch(`/admin/users/${u.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          full_name: editDraft.full_name.trim(),
          role: editDraft.role,
        }),
      });
      setUsers((prev) => prev.map((x) => (x.id === u.id ? updated : x)));
      setEditingId(null);
      setEditDraft(null);
      setRowServerError((prev) => ({ ...prev, [u.id]: "" }));
    } catch (err) {
      setRowServerError((prev) => ({
        ...prev,
        [u.id]: err instanceof ApiError ? err.message : "Could not save that change.",
      }));
    } finally {
      setSavingId(null);
    }
  }

  async function changeManager(u, managerId) {
    setSavingId(u.id);
    setRowServerError((prev) => ({ ...prev, [u.id]: "" }));
    try {
      const updated = await apiFetch(`/admin/users/${u.id}`, {
        method: "PATCH",
        body: JSON.stringify({ manager_id: managerId || null }),
      });
      setUsers((prev) => prev.map((x) => (x.id === u.id ? updated : x)));
    } catch (err) {
      setRowServerError((prev) => ({
        ...prev,
        [u.id]: err instanceof ApiError ? err.message : "Could not update the manager.",
      }));
    } finally {
      setSavingId(null);
    }
  }

  function askDeactivate(u) {
    setConfirmId(u.id);
    setRowServerError((prev) => ({ ...prev, [u.id]: "" }));
  }

  function cancelDeactivate() {
    setConfirmId(null);
  }

  async function confirmDeactivate(u) {
    setSavingId(u.id);
    try {
      const updated = await apiFetch(`/admin/users/${u.id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: false }),
      });
      setUsers((prev) => prev.map((x) => (x.id === u.id ? updated : x)));
      setConfirmId(null);
      if (me && me.id === u.id) {
        clearSessionToken();
        window.location.href = "/sign-in";
      }
    } catch (err) {
      setRowServerError((prev) => ({
        ...prev,
        [u.id]: err instanceof ApiError ? err.message : "Could not deactivate that user.",
      }));
    } finally {
      setSavingId(null);
    }
  }

  const ink = brand.primaryColor;
  const surface = brand.backgroundColor;

  if (meState === "loading") {
    return (
      <div className="p-10" style={{ color: ink, fontFamily: brand.fontBody }}>
        <p role="status">Checking your permissions…</p>
      </div>
    );
  }

  if (meState === "error") {
    return (
      <div className="p-10" style={{ color: ink, fontFamily: brand.fontBody }}>
        <Empty
          title="Could not check your permissions"
          description={meError}
          action={
            <Button type="button" onClick={loadMe}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  if (meState === "forbidden") {
    return (
      <div className="p-10" style={{ color: ink, fontFamily: brand.fontBody }}>
        <Empty
          title="HR/Admin only"
          description="This screen is only available to HR/Admin. Ask HR/Admin if you need a user added, a reporting line changed, or an account deactivated."
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-full w-full"
      style={{ backgroundColor: surface, color: ink, fontFamily: brand.fontBody }}
    >
      <div className="mx-auto w-full max-w-6xl px-6 py-10 md:px-10 md:py-14">
        <header className="mb-8">
          <p
            className="text-[11px] uppercase tracking-[0.22em]"
            style={{ color: brand.neutralColor }}
          >
            HR/Admin only
          </p>
          <h1 className="mt-2 text-[34px] md:text-[44px]" style={{ fontFamily: brand.fontHeading }}>
            Administration
          </h1>
          <p
            className="mt-3 max-w-[62ch] text-[13px] leading-relaxed"
            style={{ color: brand.neutralColor }}
          >
            Add users, set their role and reporting line, and deactivate anyone who leaves.
          </p>
        </header>

        <div className="mb-6">
          {!adding ? (
            <Button type="button" onClick={startAdd} className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add user
            </Button>
          ) : null}
        </div>

        {listState === "loading" ? (
          <p role="status">Loading users…</p>
        ) : listState === "error" ? (
          <Empty
            title="Could not load the user list"
            description={listError}
            action={
              <Button type="button" onClick={loadUsers}>
                Try again
              </Button>
            }
          />
        ) : users.length === 0 && !adding ? (
          <Empty title="No users yet" description="Add the first user with the button above." />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH scope="col">Name</TH>
                <TH scope="col">Role</TH>
                <TH scope="col">Manager</TH>
                <TH scope="col">Status</TH>
                <TH scope="col">
                  <span className="sr-only">Actions</span>
                </TH>
              </TR>
            </THead>
            <TBody>
              {adding ? (
                <TR>
                  <TD>
                    <Input
                      aria-label="New user full name"
                      value={newUser.full_name}
                      onChange={(e) =>
                        setNewUser((prev) => ({ ...prev, full_name: e.target.value }))
                      }
                      aria-invalid={!!newUserErrors.full_name}
                    />
                    {newUserErrors.full_name ? (
                      <p role="alert" className="mt-1 text-xs text-red-700">
                        {newUserErrors.full_name}
                      </p>
                    ) : null}
                  </TD>
                  <TD>
                    <Select
                      aria-label="New user role"
                      value={newUser.role}
                      onChange={(e) => setNewUser((prev) => ({ ...prev, role: e.target.value }))}
                      aria-invalid={!!newUserErrors.role}
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </Select>
                    {newUserErrors.role ? (
                      <p role="alert" className="mt-1 text-xs text-red-700">
                        {newUserErrors.role}
                      </p>
                    ) : null}
                  </TD>
                  <TD>
                    <Select
                      aria-label="New user manager"
                      value={newUser.manager_id}
                      onChange={(e) =>
                        setNewUser((prev) => ({ ...prev, manager_id: e.target.value }))
                      }
                    >
                      <option value="">Unassigned</option>
                      {managers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.full_name}
                        </option>
                      ))}
                    </Select>
                  </TD>
                  <TD>
                    <span style={{ color: brand.neutralColor }}>—</span>
                  </TD>
                  <TD>
                    <div className="flex gap-2">
                      <Button type="button" onClick={submitNewUser} disabled={creating}>
                        {creating ? "Creating…" : "Create user"}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={cancelAdd}
                        disabled={creating}
                      >
                        Cancel
                      </Button>
                    </div>
                    {newUserServerError ? (
                      <p role="alert" className="mt-2 text-xs text-red-700">
                        {newUserServerError}
                      </p>
                    ) : null}
                  </TD>
                </TR>
              ) : null}
              {users.map((u) => {
                const isEditing = editingId === u.id;
                const isConfirming = confirmId === u.id;
                const isSaving = savingId === u.id;
                const serverError = rowServerError[u.id];
                const managerName =
                  u.manager_id && byId[u.manager_id] ? byId[u.manager_id].full_name : "";
                return (
                  <TR key={u.id}>
                    <TD>
                      {isEditing ? (
                        <>
                          <Input
                            aria-label={`Full name for ${u.full_name}`}
                            value={editDraft.full_name}
                            onChange={(e) =>
                              setEditDraft((prev) => ({ ...prev, full_name: e.target.value }))
                            }
                          />
                          {editErrors.full_name ? (
                            <p role="alert" className="mt-1 text-xs text-red-700">
                              {editErrors.full_name}
                            </p>
                          ) : null}
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Avatar name={u.full_name} />
                          <span>{u.full_name}</span>
                        </div>
                      )}
                    </TD>
                    <TD>
                      {isEditing ? (
                        <>
                          <Select
                            aria-label={`Role for ${u.full_name}`}
                            value={editDraft.role}
                            onChange={(e) =>
                              setEditDraft((prev) => ({ ...prev, role: e.target.value }))
                            }
                          >
                            {ROLE_OPTIONS.map((r) => (
                              <option key={r.value} value={r.value}>
                                {r.label}
                              </option>
                            ))}
                          </Select>
                          {editErrors.role ? (
                            <p role="alert" className="mt-1 text-xs text-red-700">
                              {editErrors.role}
                            </p>
                          ) : null}
                        </>
                      ) : (
                        <Badge>{roleLabel(u.role)}</Badge>
                      )}
                    </TD>
                    <TD>
                      {u.role === "employee" ? (
                        <Select
                          aria-label={`Manager for ${u.full_name}`}
                          value={u.manager_id || ""}
                          disabled={isSaving}
                          onChange={(e) => changeManager(u, e.target.value || null)}
                        >
                          <option value="">Unassigned</option>
                          {managers.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.full_name}
                            </option>
                          ))}
                        </Select>
                      ) : (
                        <span style={{ color: brand.neutralColor }}>{managerName || "—"}</span>
                      )}
                    </TD>
                    <TD>
                      {u.is_active ? (
                        <Badge variant="success" className="inline-flex items-center gap-1">
                          <Check className="h-3 w-3" aria-hidden="true" />
                          Active
                        </Badge>
                      ) : (
                        <div>
                          <Badge variant="default" className="inline-flex items-center gap-1">
                            <X className="h-3 w-3" aria-hidden="true" />
                            Deactivated
                          </Badge>
                          <p className="mt-1 text-xs" style={{ color: brand.neutralColor }}>
                            This person can no longer sign in.
                          </p>
                        </div>
                      )}
                    </TD>
                    <TD>
                      {isConfirming ? (
                        <div className="flex flex-col gap-2">
                          <p className="text-xs">
                            Deactivate {u.full_name}? They will be signed out everywhere.
                          </p>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="danger"
                              disabled={isSaving}
                              onClick={() => confirmDeactivate(u)}
                            >
                              Yes, deactivate
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={cancelDeactivate}
                              disabled={isSaving}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : isEditing ? (
                        <div className="flex gap-2">
                          <Button type="button" onClick={() => saveEdit(u)} disabled={isSaving}>
                            {isSaving ? "Saving…" : "Save"}
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={cancelEdit}
                            disabled={isSaving}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button type="button" variant="secondary" onClick={() => startEdit(u)}>
                            Edit
                          </Button>
                          {u.is_active ? (
                            <Button type="button" variant="danger" onClick={() => askDeactivate(u)}>
                              Deactivate
                            </Button>
                          ) : null}
                        </div>
                      )}
                      {serverError ? (
                        <p
                          role="alert"
                          className="mt-2 flex items-start gap-1 text-xs text-red-700"
                        >
                          <AlertCircle className="mt-[1px] h-3 w-3 shrink-0" aria-hidden="true" />
                          {serverError}
                        </p>
                      ) : null}
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        )}
      </div>
    </div>
  );
}
