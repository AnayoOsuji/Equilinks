"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { campus } from "../data";
import type { SchoolClassOption } from "@/lib/school-admin-users";
import { createSchoolAdminClass } from "./actions";

const emptyForm = {
  name: "",
  grade: "",
  educatorId: "",
};

export function ClassesDirectory({
  classes: initialClasses,
  educators,
}: {
  classes: SchoolClassOption[];
  educators: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [classes, setClasses] = useState(initialClasses);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setClasses(initialClasses);
  }, [initialClasses]);

  return (
    <div className="admin-content" style={{ maxWidth: "1200px" }}>
      <section className="dashboard-heading">
        <div>
          <p className="dashboard-date">CLASSES</p>
          <h1>Classes</h1>
          <p className="dashboard-subtitle">Class groups at {campus.name}.</p>
        </div>
        <div className="heading-actions">
          <button className="add-student-button" type="button" onClick={openAddClass}>
            <Plus size={16} />
            <span>Add class</span>
          </button>
        </div>
      </section>

      <section className="dashboard-panel" style={{ padding: 0, overflow: "hidden" }}>
        <div className="student-table-wrap" style={{ border: "none" }}>
          <table className="student-table">
            <thead>
              <tr>
                <th scope="col">Class</th>
                <th scope="col">Grade</th>
                <th scope="col">Educator</th>
                <th scope="col">Students</th>
              </tr>
            </thead>
            <tbody>
              {classes.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "36px", color: "var(--admin-muted)" }}>
                    No classes are registered yet.
                  </td>
                </tr>
              ) : (
                classes.map((schoolClass) => (
                  <tr key={schoolClass.id}>
                    <td>
                      <strong>{schoolClass.name}</strong>
                    </td>
                    <td>{schoolClass.grade ?? "—"}</td>
                    <td>{schoolClass.educator}</td>
                    <td>{schoolClass.studentCount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {isAddOpen ? (
        <div className="modal-backdrop" onClick={closeAddClass}>
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
              <h3>Add new class</h3>
              <button className="drawer-close" type="button" onClick={closeAddClass} aria-label="Close modal">
                <X size={16} />
              </button>
            </div>
            <form
              onSubmit={handleAddClass}
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
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="school-class-name">Class name</label>
                  <input
                    id="school-class-name"
                    required
                    value={form.name}
                    onChange={(event) => {
                      const name = event.target.value;
                      setForm((current) => ({ ...current, name }));
                    }}
                    placeholder="e.g. Room 8"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="school-class-grade">Grade</label>
                  <input
                    id="school-class-grade"
                    value={form.grade}
                    onChange={(event) => {
                      const grade = event.target.value;
                      setForm((current) => ({ ...current, grade }));
                    }}
                    placeholder="e.g. Grade 4"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="school-class-educator">Educator</label>
                  <select
                    id="school-class-educator"
                    value={form.educatorId}
                    onChange={(event) => {
                      const educatorId = event.target.value;
                      setForm((current) => ({ ...current, educatorId }));
                    }}
                  >
                    <option value="">Unassigned</option>
                    {educators.map((educator) => (
                      <option key={educator.id} value={educator.id}>
                        {educator.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {formError ? (
                <p role="alert" style={{ margin: "0 24px 12px", color: "var(--coral)", fontSize: "13px" }}>
                  {formError}
                </p>
              ) : null}
              <div className="modal-footer">
                <button className="secondary-action-button" type="button" onClick={closeAddClass}>
                  Cancel
                </button>
                <button className="add-student-button" type="submit" disabled={isSaving}>
                  {isSaving ? "Saving…" : "Add class"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );

  function openAddClass() {
    setForm(emptyForm);
    setFormError(null);
    setIsAddOpen(true);
  }

  function closeAddClass() {
    if (isSaving) return;
    setIsAddOpen(false);
    setFormError(null);
  }

  async function handleAddClass(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = form.name.trim();
    if (!name) {
      setFormError("Class name is required.");
      return;
    }
    if (classes.some((schoolClass) => schoolClass.name.toLowerCase() === name.toLowerCase())) {
      setFormError("A class with this name already exists.");
      return;
    }

    setIsSaving(true);
    setFormError(null);
    const result = await createSchoolAdminClass({
      name,
      grade: form.grade,
      educatorId: form.educatorId,
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
