"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { recordEmotionalState } from "./actions";
import { useEducatorShell } from "./shell";
import type { EducatorRoster, EducatorStudent } from "@/lib/educator-roster";
import {
  EMOTIONAL_STATES,
  STATE_HINTS,
  needsAttention,
  type EmotionalStateLabel,
} from "@/lib/emotional-state";

type Filter = "all" | "attention" | "steady" | "missing";

function formatWhen(value: string | null) {
  if (!value) return "No check-in yet";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function stateClass(state: EmotionalStateLabel | null) {
  if (!state) return "emotion-chip emotion-missing";
  return `emotion-chip emotion-${state.toLowerCase()}`;
}

export function EmotionBoard({
  firstName,
  roster,
}: {
  firstName: string;
  roster: EducatorRoster;
}) {
  const router = useRouter();
  const searchQuery = useEducatorShell()?.searchQuery ?? "";
  const [students, setStudents] = useState(roster.students);

  useEffect(() => {
    setStudents(roster.students);
  }, [roster]);
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<EducatorStudent | null>(null);
  const [state, setState] = useState<EmotionalStateLabel>("Settled");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const attentionCount = students.filter((student) => needsAttention(student.state)).length;
  const steadyCount = students.filter((student) => student.state === "Settled" || student.state === "Joyful").length;
  const missingCount = students.filter((student) => !student.state).length;

  const visible = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return students.filter((student) => {
      const matchesQuery =
        !query ||
        student.name.toLowerCase().includes(query) ||
        student.className.toLowerCase().includes(query);
      const matchesFilter =
        filter === "all" ||
        (filter === "attention" && needsAttention(student.state)) ||
        (filter === "steady" && (student.state === "Settled" || student.state === "Joyful")) ||
        (filter === "missing" && !student.state);
      return matchesQuery && matchesFilter;
    });
  }, [students, searchQuery, filter]);

  const scopeCopy =
    roster.scope === "classes"
      ? "Students in your classes. Record how they are feeling so support stays timely."
      : roster.scope === "school"
        ? "No class is assigned to you yet, so this list includes students at your school."
        : "No students are linked to your account yet.";

  const openStudent = (student: EducatorStudent) => {
    setSelected(student);
    setState(student.state ?? "Settled");
    setNote(student.note ?? "");
    setError(null);
  };

  const save = async () => {
    if (!selected || isSaving) return;
    setIsSaving(true);
    setError(null);
    try {
      const result = await recordEmotionalState({
        studentId: selected.id,
        state,
        note,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setStudents((current) =>
        current.map((student) =>
          student.id === selected.id
            ? { ...student, state: result.state, note: result.note, recordedAt: result.recordedAt }
            : student,
        ),
      );
      setSelected(null);
      router.refresh();
    } catch {
      setError("Could not save this check-in. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="admin-content" style={{ maxWidth: "1200px" }}>
      <section className="dashboard-heading">
        <div>
          <p className="dashboard-date">OVERVIEW</p>
          <h1>Good morning, {firstName}</h1>
          <p className="dashboard-subtitle">{scopeCopy}</p>
        </div>
      </section>

      <section className="metric-grid" aria-label="Emotional state summary">
        <article className="metric-card">
          <div className="metric-top">
            <span>Students</span>
          </div>
          <div className="metric-number">{students.length}</div>
          <div className="metric-footer">
            <span>on your list</span>
          </div>
        </article>
        <article className="metric-card">
          <div className="metric-top">
            <span>Needs attention</span>
          </div>
          <div className="metric-number">{attentionCount}</div>
          <div className="metric-footer">
            <span>anxious, overwhelmed, withdrawn, or frustrated</span>
          </div>
        </article>
        <article className="metric-card">
          <div className="metric-top">
            <span>Doing well</span>
          </div>
          <div className="metric-number">{steadyCount}</div>
          <div className="metric-footer">
            <span>settled or joyful</span>
          </div>
        </article>
        <article className="metric-card">
          <div className="metric-top">
            <span>No check-in</span>
          </div>
          <div className="metric-number">{missingCount}</div>
          <div className="metric-footer">
            <span>not recorded yet</span>
          </div>
        </article>
      </section>

      <div className="emotion-filters" role="tablist" aria-label="Filter students">
        {(
          [
            ["all", "All"],
            ["attention", "Needs attention"],
            ["steady", "Doing well"],
            ["missing", "No check-in"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            className={`emotion-filter${filter === value ? " is-active" : ""}`}
            type="button"
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>

      <section className="dashboard-panel" style={{ padding: 0, overflow: "hidden" }}>
          <div className="student-table-wrap" style={{ border: "none" }}>
            <table className="student-table">
              <thead>
                <tr>
                  <th scope="col">Student</th>
                  <th scope="col">State</th>
                  <th scope="col">Updated</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "36px", color: "var(--admin-muted)" }}>
                      {students.length === 0 ? "No students to show." : "No students match this view."}
                    </td>
                  </tr>
                ) : (
                  visible.map((student) => (
                    <tr key={student.id}>
                      <td>
                        <div className="student-cell">
                          <span className={`student-avatar avatar-${student.avatarColor}`}>{student.initials}</span>
                          <span className="student-info-text">
                            <strong>{student.name}</strong>
                            <small>{student.className}</small>
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={stateClass(student.state)}>{student.state ?? "Not recorded"}</span>
                        {student.note ? <span className="emotion-note">{student.note}</span> : null}
                      </td>
                      <td>{formatWhen(student.recordedAt)}</td>
                      <td>
                        <button className="add-student-button" type="button" onClick={() => openStudent(student)}>
                          Update
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      {selected ? (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="emotion-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h3 id="emotion-dialog-title">Update {selected.name}</h3>
                <p className="dashboard-subtitle">{selected.className}</p>
              </div>
              <button className="drawer-close" type="button" onClick={() => setSelected(null)} aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div className="emotion-choices">
                {EMOTIONAL_STATES.map((option) => (
                  <button
                    key={option}
                    className={`emotion-choice${state === option ? " is-selected" : ""}`}
                    type="button"
                    onClick={() => setState(option)}
                  >
                    <strong>{option}</strong>
                    <span>{STATE_HINTS[option]}</span>
                  </button>
                ))}
              </div>
              <label className="form-group" htmlFor="emotion-note">
                Note
                <textarea
                  id="emotion-note"
                  value={note}
                  maxLength={280}
                  rows={3}
                  placeholder="What did you notice?"
                  onChange={(event) => setNote(event.target.value)}
                />
              </label>
              {error ? <p className="dashboard-subtitle">{error}</p> : null}
            </div>
            <div className="modal-footer">
              <button className="drawer-close" type="button" onClick={() => setSelected(null)}>
                Cancel
              </button>
              <button className="add-student-button" type="button" onClick={save} disabled={isSaving}>
                {isSaving ? "Saving…" : "Save check-in"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
