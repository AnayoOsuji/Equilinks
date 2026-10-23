"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { campus, type CampusStudent, type PersonStatus } from "../data";
import type { SchoolClassOption } from "@/lib/school-admin-users";
import { createSchoolAdminStudent } from "./actions";

const emptyForm = {
  firstname: "",
  surname: "",
  email: "",
  classId: "",
  status: "Active" as PersonStatus,
};

export function StudentsDirectory({
  students: initialStudents,
  classes,
}: {
  students: CampusStudent[];
  classes: SchoolClassOption[];
}) {
  const router = useRouter();
  const [students, setStudents] = useState(initialStudents);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setStudents(initialStudents);
  }, [initialStudents]);

  return (
    <div className="admin-content" style={{ maxWidth: "1200px" }}>
      <section className="dashboard-heading">
        <div>
          <p className="dashboard-date">STUDENTS</p>
          <h1>Students</h1>
          <p className="dashboard-subtitle">Learners enrolled at {campus.name}.</p>
        </div>
        <div className="heading-actions">
          <button className="add-student-button" type="button" onClick={openAddStudent}>
            <Plus size={16} />
            <span>Add student</span>
          </button>
        </div>
      </section>

      <section className="dashboard-panel" style={{ padding: 0, overflow: "hidden" }}>
        <div className="student-table-wrap" style={{ border: "none" }}>
          <table className="student-table">
            <thead>
              <tr>
                <th scope="col">Student</th>
                <th scope="col">School</th>
                <th scope="col">Guardians</th>
                <th scope="col">Status</th>
                <th scope="col">Last active</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "36px", color: "var(--admin-muted)" }}>
                    No students are registered yet.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className="student-cell">
                        <span className={`student-avatar avatar-${student.avatarColor}`}>{student.initials}</span>
                        <span className="student-info-text">
                          <strong>{student.name}</strong>
                          <small>{student.email}</small>
                        </span>
                      </div>
                    </td>
                    <td>{student.school}</td>
                    <td>{student.guardians}</td>
                    <td>
                      <span
                        className={`status-pill ${
                          student.status === "Active"
                            ? "status-green"
                            : student.status === "Pending Invite"
                              ? "status-amber"
                              : "status-coral"
                        }`}
                      >
                        <i />
                        {student.status}
                      </span>
                    </td>
                    <td className="update-time">{student.lastActive}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {isAddOpen ? (
        <div className="modal-backdrop" onClick={closeAddStudent}>
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
              <h3>Add new student</h3>
              <button className="drawer-close" type="button" onClick={closeAddStudent} aria-label="Close modal">
                <X size={16} />
              </button>
            </div>
            <form
              onSubmit={handleAddStudent}
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
                  <label htmlFor="school-student-firstname">Firstname</label>
                  <input
                    id="school-student-firstname"
                    required
                    value={form.firstname}
                    onChange={(event) => {
                      const firstname = event.target.value;
                      setForm((current) => ({ ...current, firstname }));
                    }}
                    placeholder="e.g. Avery"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="school-student-surname">Surname</label>
                  <input
                    id="school-student-surname"
                    required
                    value={form.surname}
                    onChange={(event) => {
                      const surname = event.target.value;
                      setForm((current) => ({ ...current, surname }));
                    }}
                    placeholder="e.g. Morgan"
                  />
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="school-student-email">Email Address</label>
                  <input
                    id="school-student-email"
                    type="email"
                    value={form.email}
                    onChange={(event) => {
                      const email = event.target.value;
                      setForm((current) => ({ ...current, email }));
                    }}
                    placeholder="student@school.edu"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="school-student-class">Class</label>
                  <select
                    id="school-student-class"
                    value={form.classId}
                    onChange={(event) => {
                      const classId = event.target.value;
                      setForm((current) => ({ ...current, classId }));
                    }}
                  >
                    <option value="">Unassigned</option>
                    {classes.map((schoolClass) => (
                      <option key={schoolClass.id} value={schoolClass.id}>
                        {schoolClass.grade ? `${schoolClass.name} · ${schoolClass.grade}` : schoolClass.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="school-student-status">Status</label>
                  <select
                    id="school-student-status"
                    value={form.status}
                    onChange={(event) => {
                      const status = event.target.value as PersonStatus;
                      setForm((current) => ({ ...current, status }));
                    }}
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
                <button className="secondary-action-button" type="button" onClick={closeAddStudent}>
                  Cancel
                </button>
                <button className="add-student-button" type="submit" disabled={isSaving}>
                  {isSaving ? "Saving…" : "Add student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );

  function openAddStudent() {
    setForm(emptyForm);
    setFormError(null);
    setIsAddOpen(true);
  }

  function closeAddStudent() {
    if (isSaving) return;
    setIsAddOpen(false);
    setFormError(null);
  }

  async function handleAddStudent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const firstname = form.firstname.trim();
    const surname = form.surname.trim();
    const email = form.email.trim().toLowerCase();
    if (!firstname || !surname) {
      setFormError("First name and surname are required.");
      return;
    }
    if (email && students.some((student) => student.email.toLowerCase() === email)) {
      setFormError("A student with this email already exists.");
      return;
    }

    setIsSaving(true);
    setFormError(null);
    const result = await createSchoolAdminStudent({
      firstname,
      surname,
      email,
      classId: form.classId,
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
