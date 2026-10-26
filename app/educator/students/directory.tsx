"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { loadStudentIncidents, recordIncident, type StudentIncidentItem } from "../actions";
import type { EducatorDirectoryStudent } from "@/lib/educator-roster";
import {
  ACTIVITY_CONTEXTS,
  ENERGY_LEVELS,
  INCIDENT_MOODS,
  type ActivityContextId,
  type EnergyLevelId,
  type IncidentMoodId,
} from "@/lib/incident";

export function EducatorStudents({ students }: { students: EducatorDirectoryStudent[] }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<EducatorDirectoryStudent | null>(null);
  const [mood, setMood] = useState<IncidentMoodId | null>(null);
  const [energy, setEnergy] = useState<EnergyLevelId | null>(null);
  const [activity, setActivity] = useState<ActivityContextId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [viewing, setViewing] = useState<EducatorDirectoryStudent | null>(null);
  const [range, setRange] = useState<"daily" | "weekly" | "monthly">("daily");
  const [history, setHistory] = useState<StudentIncidentItem[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const visible = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return students;
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(query) ||
        student.className.toLowerCase().includes(query) ||
        student.guardians.toLowerCase().includes(query),
    );
  }, [students, searchQuery]);

  const openIncident = (student: EducatorDirectoryStudent) => {
    setSelected(student);
    setMood(null);
    setEnergy(null);
    setActivity(null);
    setError(null);
  };

  const closeIncident = () => {
    if (isSaving) return;
    setSelected(null);
  };

  const openHistory = async (student: EducatorDirectoryStudent) => {
    setViewing(student);
    setRange("daily");
    setHistory([]);
    setHistoryError(null);
    setIsLoadingHistory(true);
    try {
      const result = await loadStudentIncidents(student.id);
      if (!result.ok) {
        setHistoryError(result.error);
        return;
      }
      setHistory(result.incidents);
    } catch {
      setHistoryError("Could not load incidents. Try again.");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const rangeStart = (value: "daily" | "weekly" | "monthly") => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    if (value === "weekly") {
      const day = start.getDay();
      start.setDate(start.getDate() - (day === 0 ? 6 : day - 1));
    }
    if (value === "monthly") start.setDate(1);
    return start;
  };

  const visibleHistory = history.filter((item) => new Date(item.recordedAt) >= rangeStart(range));
  const rangeLabel = range === "daily" ? "today" : range === "weekly" ? "this week" : "this month";

  const save = async () => {
    if (!selected || isSaving) return;
    if (!mood) {
      setError("Choose an emotional state.");
      return;
    }
    if (!energy) {
      setError("Choose an energy level.");
      return;
    }
    if (!activity) {
      setError("Choose an activity.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const result = await recordIncident({
        studentId: selected.id,
        mood,
        energy,
        activity,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSelected(null);
      router.refresh();
    } catch {
      setError("Could not save this incident. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="admin-content" style={{ maxWidth: "1200px" }}>
      <section className="dashboard-heading">
        <div>
          <p className="dashboard-date">STUDENTS</p>
          <h1>Students</h1>
          <p className="dashboard-subtitle">Learners in your classes.</p>
        </div>
      </section>

      <div className="student-search-bar">
        <label className="admin-search" role="search">
          <Search size={15} />
          <input
            type="search"
            placeholder="Search by student, class, or guardian..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            aria-label="Search students"
          />
        </label>
        <span className="student-search-count">
          {visible.length} of {students.length} students
        </span>
      </div>

      <section className="dashboard-panel" style={{ padding: 0, overflow: "hidden" }}>
        <div className="student-table-wrap" style={{ border: "none" }}>
          <table className="student-table">
            <thead>
              <tr>
                <th scope="col">Student</th>
                <th scope="col">Class</th>
                <th scope="col">Guardians</th>
                <th scope="col">Status</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "36px", color: "var(--admin-muted)" }}>
                    {students.length === 0 ? "No students are linked to your account yet." : "No students match this search."}
                  </td>
                </tr>
              ) : (
                visible.map((student) => (
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
                    <td>{student.className}</td>
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
                    <td>
                      <div className="row-actions">
                        <button className="add-student-button" type="button" onClick={() => openIncident(student)}>
                          Log incident
                        </button>
                        <button className="incident-view-button" type="button" onClick={() => openHistory(student)}>
                          View incidents
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

      {viewing ? (
        <div className="modal-backdrop" onClick={() => setViewing(null)}>
          <div
            className="modal-card incident-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="incident-history-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h3 id="incident-history-title">Incidents for {viewing.name}</h3>
                <p className="dashboard-subtitle">
                  {isLoadingHistory
                    ? "Loading incidents…"
                    : `${visibleHistory.length} ${visibleHistory.length === 1 ? "incident" : "incidents"} ${rangeLabel}`}
                </p>
              </div>
              <button className="drawer-close" type="button" onClick={() => setViewing(null)} aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div className="emotion-filters" role="tablist" aria-label="Incident range">
                {(
                  [
                    ["daily", "Daily"],
                    ["weekly", "Weekly"],
                    ["monthly", "Monthly"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    className={`emotion-filter${range === value ? " is-active" : ""}`}
                    type="button"
                    role="tab"
                    aria-selected={range === value}
                    onClick={() => setRange(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {historyError ? (
                <p className="incident-error" role="alert">
                  {historyError}
                </p>
              ) : isLoadingHistory ? (
                <p className="incident-history-empty">Loading incidents…</p>
              ) : visibleHistory.length === 0 ? (
                <p className="incident-history-empty">No incidents {rangeLabel}.</p>
              ) : (
                <ul className="incident-history">
                  {visibleHistory.map((item) => {
                    const itemMood = INCIDENT_MOODS.find((option) => option.id === item.mood);
                    const itemEnergy = ENERGY_LEVELS.find((option) => option.id === item.energy);
                    const itemActivity = ACTIVITY_CONTEXTS.find((option) => option.id === item.activity);
                    return (
                      <li key={`${item.source}-${item.id}`}>
                        <span className="incident-history-emoji" aria-hidden="true">
                          {itemMood?.emoji ?? "📝"}
                        </span>
                        <div>
                          <strong>
                            {itemMood?.label ?? "Incident"}
                            <span className={`incident-source incident-source-${item.source}`}>
                              {item.source === "home" ? "Home" : "School"}
                            </span>
                          </strong>
                          <p>
                            {itemEnergy ? `${itemEnergy.label} energy` : "Energy not recorded"}
                            {itemActivity ? ` · ${itemActivity.label}` : ""}
                          </p>
                          {item.note ? <p>{item.note}</p> : null}
                          <small>
                            {new Intl.DateTimeFormat("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            }).format(new Date(item.recordedAt))}
                            {item.reporter ? ` · ${item.reporter}` : ""}
                          </small>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {selected ? (
        <div className="modal-backdrop" onClick={closeIncident}>
          <div
            className="modal-card incident-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="incident-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h3 id="incident-dialog-title">Log incident for {selected.name}</h3>
                <p className="dashboard-subtitle">{selected.className}</p>
              </div>
              <button className="drawer-close" type="button" onClick={closeIncident} aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <section className="incident-section" aria-labelledby="incident-mood-title">
                <div className="incident-section-head">
                  <span className="incident-step" aria-hidden="true">1</span>
                  <div>
                    <h4 id="incident-mood-title">Emotional state</h4>
                    <p>How does the student seem right now?</p>
                  </div>
                </div>
                <div className="incident-moods">
                  {INCIDENT_MOODS.map((option) => (
                    <button
                      key={option.id}
                      className={`incident-card incident-mood${mood === option.id ? " is-selected" : ""}`}
                      type="button"
                      aria-pressed={mood === option.id}
                      onClick={() => setMood(option.id)}
                    >
                      <span className="incident-emoji" aria-hidden="true">
                        {option.emoji}
                      </span>
                      <strong>{option.label}</strong>
                    </button>
                  ))}
                </div>
              </section>
              <section className="incident-section" aria-labelledby="incident-energy-title">
                <div className="incident-section-head">
                  <span className="incident-step" aria-hidden="true">2</span>
                  <div>
                    <h4 id="incident-energy-title">Energy level</h4>
                    <p>How much energy are they showing?</p>
                  </div>
                </div>
                <div className="incident-energy">
                  {ENERGY_LEVELS.map((option) => (
                    <button
                      key={option.id}
                      className={`incident-card incident-mood${energy === option.id ? " is-selected" : ""}`}
                      type="button"
                      aria-pressed={energy === option.id}
                      onClick={() => setEnergy(option.id)}
                    >
                      <span className="incident-emoji" aria-hidden="true">
                        {option.emoji}
                      </span>
                      <strong>{option.label}</strong>
                    </button>
                  ))}
                </div>
              </section>
              <section className="incident-section" aria-labelledby="incident-activity-title">
                <div className="incident-section-head">
                  <span className="incident-step" aria-hidden="true">3</span>
                  <div>
                    <h4 id="incident-activity-title">Activity context</h4>
                    <p>What was happening at the time?</p>
                  </div>
                </div>
                <div className="incident-activities">
                  {ACTIVITY_CONTEXTS.map((option) => (
                    <button
                      key={option.id}
                      className={`incident-card incident-mood${activity === option.id ? " is-selected" : ""}`}
                      type="button"
                      aria-pressed={activity === option.id}
                      onClick={() => setActivity(option.id)}
                    >
                      <span className="incident-emoji" aria-hidden="true">
                        {option.emoji}
                      </span>
                      <strong>{option.label}</strong>
                    </button>
                  ))}
                </div>
              </section>
              {error ? (
                <p className="incident-error" role="alert">
                  {error}
                </p>
              ) : null}
            </div>
            <div className="modal-footer incident-footer">
              <button className="incident-cancel" type="button" onClick={closeIncident} disabled={isSaving}>
                Cancel
              </button>
              <button className="incident-save" type="button" onClick={save} disabled={isSaving}>
                {isSaving ? "Saving…" : "Save incident"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
