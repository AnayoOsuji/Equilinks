"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import type { CampusPerson, PersonStatus } from "../data";
import { createSchoolAdminPerson } from "./actions";

const emptyForm = {
  firstname: "",
  surname: "",
  email: "",
  password: "",
  role: "Educator" as CampusPerson["role"],
  status: "Active" as PersonStatus,
};

export function UsersDirectory({
  role,
  people: initialPeople,
}: {
  role: "all" | "educator" | "parent";
  people: CampusPerson[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [people, setPeople] = useState(initialPeople);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

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
      ? "Teaching staff at Harborview Learning Center."
      : role === "parent"
        ? "Parents and guardians connected to this campus."
        : "Educators and parents for this school.";

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
              <h3>Create User Account</h3>
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
                {form.role === "Educator" ? (
                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label htmlFor="school-user-password">Password</label>
                    <input
                      id="school-user-password"
                      type="password"
                      required
                      value={form.password}
                      onChange={(event) => setForm({ ...form, password: event.target.value })}
                      placeholder="Create a temporary password"
                    />
                  </div>
                ) : null}
                <div className="form-group">
                  <label htmlFor="school-user-role">Select Role</label>
                  <select
                    id="school-user-role"
                    value={form.role}
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
                  {isSaving ? "Saving…" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );

  function openAddUser() {
    setForm({
      ...emptyForm,
      role: role === "parent" ? "Parent" : "Educator",
    });
    setFormError(null);
    setIsAddOpen(true);
  }

  function closeAddUser() {
    if (isSaving) return;
    setIsAddOpen(false);
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
    if (form.role === "Educator" && !form.password.trim()) {
      setFormError("A password is required for an educator account.");
      return;
    }
    if (people.some((person) => person.email.toLowerCase() === email)) {
      setFormError("A user with this email already exists.");
      return;
    }

    setIsSaving(true);
    setFormError(null);
    const result = await createSchoolAdminPerson({
      firstname,
      surname,
      email,
      password: form.password,
      role: form.role,
      status: form.status,
    });
    setIsSaving(false);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    setIsAddOpen(false);
    router.refresh();
  }
}

function RoleTab({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link className={`filter-tab ${active ? "is-active" : ""}`} href={href}>
      {children}
    </Link>
  );
}

function PeopleTable({ people, emptyLabel }: { people: CampusPerson[]; emptyLabel: string }) {
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
            </tr>
          </thead>
          <tbody>
            {people.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "36px", color: "var(--admin-muted)" }}>
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              people.map((person) => (
                <tr key={person.id}>
                  <td>
                    <div className="student-cell">
                      <span className={`student-avatar avatar-${person.avatarColor}`}>{person.initials}</span>
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
