"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, UploadCloud, X } from "lucide-react";
import { readImageFile } from "@/lib/avatar";
import type { CampusStudent, PersonStatus } from "../data";
import type { SchoolClassOption } from "@/lib/school-admin-users";
import { createSchoolAdminStudent, deleteSchoolAdminStudent, updateSchoolAdminStudent } from "./actions";
import { useSchoolAdminSchool } from "../shell";

const emptyForm = {
  firstname: "",
  surname: "",
  classId: "",
  parentId: "",
  status: "Active" as PersonStatus,
  avatar: "",
};

export function StudentsDirectory({
  students: initialStudents,
  classes,
  guardians,
}: {
  students: CampusStudent[];
  classes: SchoolClassOption[];
  guardians: { id: string; name: string }[];
}) {
  const router = useRouter();
  const school = useSchoolAdminSchool();
  const [students, setStudents] = useState(initialStudents);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<CampusStudent | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<CampusStudent | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    setStudents(initialStudents);
  }, [initialStudents]);

  const classChoices =
    form.classId && !classes.some((schoolClass) => schoolClass.id === form.classId)
      ? [
          {
            id: form.classId,
            name: "Assigned class",
            grade: null,
            educatorId: null,
            educator: "Unassigned",
            studentCount: 0,
          },
          ...classes,
        ]
      : classes;

  return (
    <div className="admin-content" style={{ maxWidth: "1200px" }}>
      <section className="dashboard-heading">
        <div>
          <p className="dashboard-date">STUDENTS</p>
          <h1>Students</h1>
          <p className="dashboard-subtitle">Learners enrolled at {school?.name ?? "your school"}.</p>
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
                <th scope="col" style={{ textAlign: "right" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "36px", color: "var(--admin-muted)" }}>
                    No students are registered yet.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className="student-cell">
                        {student.avatar ? (
                          <img className="student-avatar" src={student.avatar} alt="" />
                        ) : (
                          <span className={`student-avatar avatar-${student.avatarColor}`}>{student.initials}</span>
                        )}
                        <span className="student-info-text">
                          <strong>{student.name}</strong>
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
                    <td style={{ textAlign: "right" }}>
                      <div className="row-actions" style={{ justifyContent: "flex-end" }}>
                        <button className="row-action-btn" type="button" onClick={() => openEditStudent(student)}>
                          Edit
                        </button>
                        <button
                          className="row-action-btn"
                          type="button"
                          style={{ color: "var(--coral)" }}
                          onClick={() => openDeleteStudent(student)}
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
              <h3>{editingStudent ? "Edit student" : "Add new student"}</h3>
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
                    htmlFor="school-student-avatar"
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
                    title="Click to upload student avatar"
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
                      id="school-student-avatar"
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
                  <span style={{ fontSize: "12px", color: "var(--admin-muted)" }}>Click to upload student avatar</span>
                </div>
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
                  <label htmlFor="school-student-guardians">Parents / guardian</label>
                  <select
                    id="school-student-guardians"
                    value={form.parentId}
                    onChange={(event) => {
                      const parentId = event.target.value;
                      setForm((current) => ({ ...current, parentId }));
                    }}
                  >
                    <option value="">Unassigned</option>
                    {guardians.map((guardian) => (
                      <option key={guardian.id} value={guardian.id}>
                        {guardian.name}
                      </option>
                    ))}
                  </select>
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
                    {classChoices.map((schoolClass) => (
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
                  {isSaving ? "Saving…" : editingStudent ? "Save changes" : "Add student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {studentToDelete ? (
        <div
          className="modal-backdrop"
          onClick={() => {
            if (!isDeleting) setStudentToDelete(null);
          }}
        >
          <div className="modal-card" style={{ maxWidth: "440px" }} onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete student</h3>
              <button
                className="drawer-close"
                type="button"
                onClick={() => {
                  if (!isDeleting) setStudentToDelete(null);
                }}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ gap: "10px" }}>
              <p style={{ margin: 0, fontSize: "14px", color: "var(--admin-ink)" }}>
                Delete <strong>{studentToDelete.name}</strong>? This removes the student from your school.
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
                onClick={() => setStudentToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="add-student-button"
                type="button"
                style={{ background: "var(--coral)" }}
                onClick={handleDeleteStudent}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting…" : "Delete student"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );

  function openAddStudent() {
    setEditingStudent(null);
    setForm(emptyForm);
    setFormError(null);
    setIsAddOpen(true);
  }

  function openEditStudent(student: CampusStudent) {
    setEditingStudent(student);
    setForm({
      firstname: student.firstname,
      surname: student.surname,
      classId: student.classId ?? "",
      parentId: student.parentIds[0] ?? "",
      status: student.status,
      avatar: student.avatar ?? "",
    });
    setFormError(null);
    setIsAddOpen(true);
  }

  function openDeleteStudent(student: CampusStudent) {
    setDeleteError(null);
    setStudentToDelete(student);
  }

  function closeAddStudent() {
    if (isSaving) return;
    setIsAddOpen(false);
    setEditingStudent(null);
    setFormError(null);
  }

  async function handleAddStudent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const firstname = form.firstname.trim();
    const surname = form.surname.trim();
    if (!firstname || !surname) {
      setFormError("First name and surname are required.");
      return;
    }

    setIsSaving(true);
    setFormError(null);
    const payload = {
      firstname,
      surname,
      classId: form.classId,
      status: form.status,
      avatar: form.avatar,
      parentIds: form.parentId ? [form.parentId] : [],
    };
    const result = editingStudent
      ? await updateSchoolAdminStudent({ id: editingStudent.id, ...payload })
      : await createSchoolAdminStudent(payload);
    setIsSaving(false);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    if (editingStudent) {
      const name = `${firstname} ${surname}`.trim();
      setStudents((current) =>
        current.map((student) =>
          student.id === editingStudent.id
            ? {
                ...student,
                firstname,
                surname,
                name,
                initials: `${firstname[0] ?? ""}${surname[0] ?? ""}`.toUpperCase() || student.initials,
                classId: form.classId || null,
                status: form.status,
                avatar: form.avatar || undefined,
                parentIds: form.parentId ? [form.parentId] : [],
                guardians: guardians.find((guardian) => guardian.id === form.parentId)?.name ?? "No guardian linked",
              }
            : student,
        ),
      );
    }
    setIsAddOpen(false);
    setEditingStudent(null);
    router.refresh();
  }

  async function handleDeleteStudent() {
    if (!studentToDelete || isDeleting) return;
    setIsDeleting(true);
    setDeleteError(null);
    const result = await deleteSchoolAdminStudent(studentToDelete.id);
    setIsDeleting(false);
    if (!result.ok) {
      setDeleteError(result.error);
      return;
    }
    setStudents((current) => current.filter((student) => student.id !== studentToDelete.id));
    setStudentToDelete(null);
    router.refresh();
  }
}
