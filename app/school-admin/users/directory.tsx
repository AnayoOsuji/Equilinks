"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, UploadCloud, X } from "lucide-react";
import { readImageFile } from "@/lib/avatar";
import type { CampusPerson, PersonStatus } from "../data";
import { createSchoolAdminPerson, deleteSchoolAdminPerson, updateSchoolAdminPerson } from "./actions";

const emptyForm = {
  firstname: "",
  surname: "",
  email: "",
  password: "",
  role: "Educator" as CampusPerson["role"],
  status: "Active" as PersonStatus,
  avatar: "",
};

export function UsersDirectory({
  role,
  people: initialPeople,
  schoolName,
}: {
  role: "all" | "educator" | "parent";
  people: CampusPerson[];
  schoolName: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [people, setPeople] = useState(initialPeople);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<CampusPerson | null>(null);
  const [personToDelete, setPersonToDelete] = useState<CampusPerson | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    setPeople(initialPeople);
  }, [initialPeople]);

  const source =
    role === "educator"
      ? people.filter((person) => person.role === "Educator")
      : role === "parent"
        ? people.filter((person) => person.role === "Parent")
        : people;
  const educatorCount = people.filter((person) => person.role === "Educator").length;
  const parentCount = people.filter((person) => person.role === "Parent").length;
  const visiblePeople = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return source;
    return source.filter((person) =>
      `${person.name} ${person.email} ${person.detail} ${person.role}`.toLowerCase().includes(needle),
    );
  }, [query, source]);

  const title = role === "educator" ? "Educators" : role === "parent" ? "Parents" : "Users";
  const subtitle =
    role === "educator"
      ? `Teaching staff at ${schoolName}.`
      : role === "parent"
        ? `Parents and guardians at ${schoolName}.`
        : `Educators and parents at ${schoolName}.`;

  return (
    <div className="admin-content" style={{ maxWidth: "1200px" }}>
      <section className="dashboard-heading">
        <div>
          <p className="dashboard-date">USERS</p>
          <h1>{title}</h1>
          <p className="dashboard-subtitle">{subtitle}</p>
        </div>
        <div className="heading-actions">
          <button className="add-student-button" type="button" onClick={openAddUser}>
            <Plus size={16} />
            <span>Add user</span>
          </button>
        </div>
      </section>

      <div className="table-controls">
        <div className="table-filter-tabs" aria-label="User roles">
          <RoleTab href="/school-admin/users" active={role === "all"}>
            All ({educatorCount + parentCount})
          </RoleTab>
          <RoleTab href="/school-admin/users/educators" active={role === "educator"}>
            Educators ({educatorCount})
          </RoleTab>
          <RoleTab href="/school-admin/users/parents" active={role === "parent"}>
            Parents ({parentCount})
          </RoleTab>
        </div>
        <input
          className="school-admin-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search this list"
          aria-label="Search users"
        />
      </div>

      <PeopleTable
        people={visiblePeople}
        emptyLabel={query.trim() ? "No people match that search." : "No educators or parents are registered yet."}
        onEdit={openEditUser}
        onDelete={openDeleteUser}
      />

      {isAddOpen ? (
        <div className="modal-backdrop" onClick={closeAddUser}>
          <div
            className="modal-card"
            style={{
              width: "min(640px, 92vw)",
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <h3>{editingPerson ? "Edit User Account" : "Create User Account"}</h3>
              <button className="drawer-close" type="button" onClick={closeAddUser} aria-label="Close modal">
                <X size={16} />
              </button>
            </div>
            <form
              onSubmit={handleAddUser}
              style={{ display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}
            >
              <div
                className="modal-body"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                  overflowY: "auto",
                }}
              >
                <div
                  style={{
                    gridColumn: "1 / -1",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "4px 0 6px",
                  }}
                >
                  <label
                    htmlFor="school-user-avatar"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100px",
                      height: "100px",
                      borderRadius: "50%",
                      border: "2px dashed var(--admin-border-strong)",
                      background: form.avatar
                        ? `url(${form.avatar}) center/cover no-repeat`
                        : "var(--admin-surface-subtle)",
                      cursor: "pointer",
                      position: "relative",
                      overflow: "hidden",
                    }}
                    title="Click to upload user avatar"
                  >
                    {!form.avatar ? (
                      <>
                        <UploadCloud size={26} color="var(--admin-muted)" />
                        <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--admin-muted)", marginTop: "4px" }}>
                          Upload Avatar
                        </span>
                      </>
                    ) : (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "rgba(0, 0, 0, 0.45)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontSize: "11px",
                          fontWeight: 600,
                        }}
                      >
                        Change
                      </div>
                    )}
                    <input
                      id="school-user-avatar"
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.target.value = "";
                        if (!file) return;
                        void readImageFile(file)
                          .then((avatar) => setForm((current) => ({ ...current, avatar })))
                          .catch((error: unknown) => {
                            setFormError(error instanceof Error ? error.message : "Could not read that image.");
                          });
                      }}
                    />
                  </label>
                  <span style={{ fontSize: "12px", color: "var(--admin-muted)" }}>Click to upload user avatar</span>
                </div>
                <div className="form-group">
                  <label htmlFor="school-user-firstname">Firstname</label>
                  <input
                    id="school-user-firstname"
                    required
                    value={form.firstname}
                    onChange={(event) => setForm({ ...form, firstname: event.target.value })}
                    placeholder="e.g. Jordan"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="school-user-surname">Surname</label>
                  <input
                    id="school-user-surname"
                    required
                    value={form.surname}
                    onChange={(event) => setForm({ ...form, surname: event.target.value })}
                    placeholder="e.g. Ellis"
                  />
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="school-user-email">Email Address</label>
                  <input
                    id="school-user-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    placeholder="user@school.edu"
                  />
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="school-user-password">
                    {form.role === "Parent"
                      ? "Parent portal password"
                      : editingPerson
                        ? "New password"
                        : "Password"}
                  </label>
                  <input
                    id="school-user-password"
                    type="password"
                    required={form.role === "Educator" && !editingPerson}
                    value={form.password}
                    onChange={(event) => setForm({ ...form, password: event.target.value })}
                    placeholder={
                      form.role === "Parent"
                        ? "Optional. Lets this parent sign in at /parents"
                        : editingPerson
                          ? "Leave blank to keep the current password"
                          : "Create a temporary password"
                    }
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="school-user-role">Select Role</label>
                  <select
                    id="school-user-role"
                    value={form.role}
                    disabled={Boolean(editingPerson)}
                    onChange={(event) => setForm({ ...form, role: event.target.value as CampusPerson["role"] })}
                  >
                    <option value="Educator">Educator</option>
                    <option value="Parent">Parent</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="school-user-status">Status</label>
                  <select
                    id="school-user-status"
                    value={form.status}
                    onChange={(event) => setForm({ ...form, status: event.target.value as PersonStatus })}
                  >
                    <option value="Active">Active</option>
                    <option value="Pending Invite">Pending Invite</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              {formError ? (
                <p role="alert" style={{ margin: "0 24px 12px", color: "var(--coral)", fontSize: "13px" }}>
                  {formError}
                </p>
              ) : null}
              <div className="modal-footer">
                <button className="secondary-action-button" type="button" onClick={closeAddUser}>
                  Cancel
                </button>
                <button className="add-student-button" type="submit" disabled={isSaving}>
                  {isSaving ? "Saving…" : editingPerson ? "Save changes" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {personToDelete ? (
        <div
          className="modal-backdrop"
          onClick={() => {
            if (!isDeleting) setPersonToDelete(null);
          }}
        >
          <div className="modal-card" style={{ maxWidth: "440px" }} onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete user</h3>
              <button
                className="drawer-close"
                type="button"
                onClick={() => {
                  if (!isDeleting) setPersonToDelete(null);
                }}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ gap: "10px" }}>
              <p style={{ margin: 0, fontSize: "14px", color: "var(--admin-ink)" }}>
                Delete <strong>{personToDelete.name}</strong>? This removes the account from the directory.
              </p>
              {deleteError ? (
                <p role="alert" style={{ margin: 0, color: "var(--coral)", fontSize: "13px" }}>
                  {deleteError}
                </p>
              ) : null}
            </div>
            <div className="modal-footer">
              <button
                className="secondary-action-button"
                type="button"
                onClick={() => setPersonToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="add-student-button"
                type="button"
                style={{ background: "var(--coral)" }}
                onClick={handleDeleteUser}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting…" : "Delete user"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );

  function openAddUser() {
    setEditingPerson(null);
    setForm({
      ...emptyForm,
      role: role === "parent" ? "Parent" : "Educator",
    });
    setFormError(null);
    setIsAddOpen(true);
  }

  function openEditUser(person: CampusPerson) {
    const { firstname, surname } = nameParts(person);
    setForm({
      firstname,
      surname,
      email: person.email,
      password: "",
      role: person.role,
      status: person.status,
      avatar: person.avatar ?? "",
    });
    setFormError(null);
    setEditingPerson(person);
    setIsAddOpen(true);
  }

  function openDeleteUser(person: CampusPerson) {
    setDeleteError(null);
    setPersonToDelete(person);
  }

  function closeAddUser() {
    if (isSaving) return;
    setIsAddOpen(false);
    setEditingPerson(null);
    setFormError(null);
  }

  async function handleAddUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const firstname = form.firstname.trim();
    const surname = form.surname.trim();
    const email = form.email.trim().toLowerCase();
    if (!firstname || !surname || !email) {
      setFormError("First name, surname, and email are required.");
      return;
    }
    if (form.role === "Educator" && !editingPerson && !form.password.trim()) {
      setFormError("A password is required for an educator account.");
      return;
    }
    if (form.password.trim() && form.password.trim().length < 8) {
      setFormError("New password must be at least 8 characters.");
      return;
    }
    if (people.some((person) => person.id !== editingPerson?.id && person.email.toLowerCase() === email)) {
      setFormError("A user with this email already exists.");
      return;
    }

    setIsSaving(true);
    setFormError(null);
    const result = editingPerson
      ? await updateSchoolAdminPerson({
          id: editingPerson.id,
          firstname,
          surname,
          email,
          password: form.password,
          role: form.role,
          status: form.status,
          avatar: form.avatar,
        })
      : await createSchoolAdminPerson({
          firstname,
          surname,
          email,
          password: form.password,
          role: form.role,
          status: form.status,
          avatar: form.avatar,
        });
    setIsSaving(false);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    if (editingPerson) {
      const initials = `${firstname[0] ?? ""}${surname[0] ?? ""}`.toUpperCase() || editingPerson.initials;
      setPeople((current) =>
        current.map((person) =>
          person.id === editingPerson.id
            ? {
                ...person,
                firstname,
                surname,
                name: `${firstname} ${surname}`.trim(),
                email,
                initials,
                status: form.status,
                avatar: form.avatar || undefined,
              }
            : person,
        ),
      );
    }
    setIsAddOpen(false);
    setEditingPerson(null);
    router.refresh();
  }

  async function handleDeleteUser() {
    if (!personToDelete || isDeleting) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const result = await deleteSchoolAdminPerson({ id: personToDelete.id, role: personToDelete.role });
      if (!result.ok) {
        setDeleteError(result.error);
        return;
      }
      setPeople((current) => current.filter((person) => person.id !== personToDelete.id));
      setPersonToDelete(null);
      router.refresh();
    } catch {
      setDeleteError("Could not delete this user. Try again.");
    } finally {
      setIsDeleting(false);
    }
  }
}

function nameParts(person: CampusPerson) {
  if (person.firstname || person.surname) {
    return { firstname: person.firstname ?? "", surname: person.surname ?? "" };
  }
  const [firstname, ...rest] = person.name.split(" ");
  return { firstname: firstname ?? "", surname: rest.join(" ") };
}

function RoleTab({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link className={`filter-tab ${active ? "is-active" : ""}`} href={href}>
      {children}
    </Link>
  );
}

function PeopleTable({
  people,
  emptyLabel,
  onEdit,
  onDelete,
}: {
  people: CampusPerson[];
  emptyLabel: string;
  onEdit: (person: CampusPerson) => void;
  onDelete: (person: CampusPerson) => void;
}) {
  return (
    <section className="dashboard-panel" style={{ padding: 0, overflow: "hidden" }}>
      <div className="student-table-wrap" style={{ border: "none" }}>
        <table className="student-table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Role</th>
              <th scope="col">Detail</th>
              <th scope="col">Status</th>
              <th scope="col">Last active</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {people.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "36px", color: "var(--admin-muted)" }}>
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              people.map((person) => (
                <tr key={person.id}>
                  <td>
                    <div className="student-cell">
                      {person.avatar ? (
                        <img className="student-avatar" src={person.avatar} alt="" />
                      ) : (
                        <span className={`student-avatar avatar-${person.avatarColor}`}>{person.initials}</span>
                      )}
                      <span className="student-info-text">
                        <strong>{person.name}</strong>
                        <small>{person.email}</small>
                      </span>
                    </div>
                  </td>
                  <td>{person.role}</td>
                  <td>{person.detail}</td>
                  <td>
                    <span
                      className={`status-pill ${
                        person.status === "Active"
                          ? "status-green"
                          : person.status === "Pending Invite"
                            ? "status-amber"
                            : "status-coral"
                      }`}
                    >
                      <i />
                      {person.status}
                    </span>
                  </td>
                  <td className="update-time">{person.lastActive}</td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <button className="row-action-btn" type="button" onClick={() => onEdit(person)}>
                        Edit
                      </button>
                      <button
                        className="row-action-btn"
                        type="button"
                        style={{ color: "var(--coral)" }}
                        onClick={() => onDelete(person)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
