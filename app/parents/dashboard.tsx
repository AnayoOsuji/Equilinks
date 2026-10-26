"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { reportHomeIncident } from "./actions";
import type { ParentDashboard } from "@/lib/parent-portal";
import {
  ACTIVITY_CONTEXTS,
  ENERGY_LEVELS,
  INCIDENT_MOODS,
  type EnergyLevelId,
  type IncidentMoodId,
} from "@/lib/incident";
import type { EmotionalStateLabel } from "@/lib/emotional-state";

function formatWhen(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function localInputValue(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function stateClass(state: EmotionalStateLabel) {
  return `emotion-chip emotion-${state.toLowerCase()}`;
}

const moodFor = (id: IncidentMoodId) => INCIDENT_MOODS.find((option) => option.id === id);
const energyFor = (id: EnergyLevelId | null) => ENERGY_LEVELS.find((option) => option.id === id);

type SchoolEntry =
  | { kind: "check-in"; id: string; at: string; state: EmotionalStateLabel; note: string | null }
  | { kind: "incident"; id: string; at: string; mood: IncidentMoodId; energy: EnergyLevelId; activity: string };

export function ParentDashboardView({
  dashboard,
  fallbackName,
}: {
  dashboard: ParentDashboard;
  fallbackName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mood, setMood] = useState<IncidentMoodId | null>(null);
  const [energy, setEnergy] = useState<EnergyLevelId | null>(null);
  const [occurredAt, setOccurredAt] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [sentMessage, setSentMessage] = useState<string | null>(null);

  const { child, checkIns, schoolIncidents, homeIncidents } = dashboard;
  const firstName = dashboard.firstname || fallbackName;
  const latest = checkIns[0] ?? null;
  const seenCount = homeIncidents.filter((item) => item.seen).length;

  const schoolTimeline = useMemo<SchoolEntry[]>(() => {
    const entries: SchoolEntry[] = [
      ...checkIns.map((item) => ({
        kind: "check-in" as const,
        id: item.id,
        at: item.recordedAt,
        state: item.state,
        note: item.note,
      })),
      ...schoolIncidents.map((item) => ({
        kind: "incident" as const,
        id: item.id,
        at: item.recordedAt,
        mood: item.mood,
        energy: item.energy,
        activity: ACTIVITY_CONTEXTS.find((option) => option.id === item.activity)?.label ?? "School",
      })),
    ];
    return entries.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 8);
  }, [checkIns, schoolIncidents]);

  const openReport = () => {
    setMood(null);
    setEnergy(null);
    setOccurredAt(localInputValue(new Date()));
    setNote("");
    setError(null);
    setSentMessage(null);
    setOpen(true);
  };

  const closeReport = () => {
    if (!isSaving) setOpen(false);
  };

  const save = async () => {
    if (isSaving) return;
    if (!mood) {
      setError("Choose how your child is feeling.");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const result = await reportHomeIncident({
        mood,
        energy,
        note,
        occurredAt: occurredAt ? new Date(occurredAt).toISOString() : undefined,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      setSentMessage(
        child?.educatorName
          ? `Sent. ${child.educatorName} will see it in their notifications.`
          : "Sent. Your child's teacher will see it in their notifications.",
      );
      router.refresh();
    } catch {
      setError("Could not send this report. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!child) {
    return (
      <div className="admin-content" style={{ maxWidth: "1100px" }}>
        <section className="dashboard-heading">
          <div>
            <p className="dashboard-date">FAMILY OVERVIEW</p>
            <h1>Hello, {firstName}</h1>
            <p className="dashboard-subtitle">Your account is ready, but it is not linked to a child yet.</p>
          </div>
        </section>
        <section className="dashboard-panel parent-empty">
          <span className="parent-empty-emoji" aria-hidden="true">
            👋
          </span>
          <h2>Waiting for the school to link your child</h2>
          <p>
            Once the school connects your account to your child&apos;s profile, you&apos;ll see how they&apos;re doing
            in class and be able to share updates from home.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="admin-content" style={{ maxWidth: "1200px" }}>
      <section className="dashboard-heading">
        <div>
          <p className="dashboard-date">FAMILY OVERVIEW</p>
          <h1>Hello, {firstName}</h1>
          <p className="dashboard-subtitle">
            How {child.firstname} is doing at school, and a quick way to tell their teacher what happened at home.
          </p>
        </div>
        <div className="heading-actions">
          <button className="incident-save parent-report-button" type="button" onClick={openReport}>
            <Plus size={16} />
            <span>Report home incident</span>
          </button>
        </div>
      </section>

      {sentMessage ? (
        <p className="parent-toast" role="status">
          {sentMessage}
        </p>
      ) : null}

      <section className="parent-child-card" aria-label={`${child.name} profile`}>
        {child.avatar ? (
          <img className="parent-child-avatar" src={child.avatar} alt="" />
        ) : (
          <span className="parent-child-avatar parent-child-initials" aria-hidden="true">
            {child.initials}
          </span>
        )}
        <div className="parent-child-copy">
          <h2>{child.name}</h2>
          <p>
            {child.className}
            {child.educatorName ? ` · Teacher: ${child.educatorName}` : ""}
          </p>
          <small>{child.schoolName}</small>
        </div>
        <div className="parent-child-status">
          <small>Latest at school</small>
          {latest ? (
            <>
              <span className={stateClass(latest.state)}>{latest.state}</span>
              <small>{formatWhen(latest.recordedAt)}</small>
            </>
          ) : (
            <span className="emotion-chip emotion-missing">No check-in yet</span>
          )}
        </div>
      </section>

      <section className="metric-grid" aria-label="Family summary">
        <article className="metric-card">
          <div className="metric-top">
            <span>School check-ins</span>
          </div>
          <div className="metric-number">{checkIns.length}</div>
          <div className="metric-footer">
            <span>recent notes from the teacher</span>
          </div>
        </article>
        <article className="metric-card">
          <div className="metric-top">
            <span>School incidents</span>
          </div>
          <div className="metric-number">{schoolIncidents.length}</div>
          <div className="metric-footer">
            <span>logged in class recently</span>
          </div>
        </article>
        <article className="metric-card">
          <div className="metric-top">
            <span>Home reports</span>
          </div>
          <div className="metric-number">{homeIncidents.length}</div>
          <div className="metric-footer">
            <span>shared by you</span>
          </div>
        </article>
        <article className="metric-card">
          <div className="metric-top">
            <span>Seen by teacher</span>
          </div>
          <div className="metric-number">{seenCount}</div>
          <div className="metric-footer">
            <span>of your home reports</span>
          </div>
        </article>
      </section>

      <div className="parent-grid">
        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>At school</h2>
              <p>Recent check-ins and incidents from class</p>
            </div>
          </div>
          {schoolTimeline.length === 0 ? (
            <p className="parent-list-empty">Nothing has been logged at school yet.</p>
          ) : (
            <ul className="parent-feed">
              {schoolTimeline.map((entry) =>
                entry.kind === "check-in" ? (
                  <li key={`c-${entry.id}`}>
                    <span className="parent-feed-icon" aria-hidden="true">
                      📝
                    </span>
                    <div>
                      <strong>
                        Check-in · <span className={stateClass(entry.state)}>{entry.state}</span>
                      </strong>
                      {entry.note ? <p>{entry.note}</p> : null}
                      <small>{formatWhen(entry.at)}</small>
                    </div>
                  </li>
                ) : (
                  <li key={`i-${entry.id}`}>
                    <span className="parent-feed-icon" aria-hidden="true">
                      {moodFor(entry.mood)?.emoji ?? "🏫"}
                    </span>
                    <div>
                      <strong>
                        {moodFor(entry.mood)?.label ?? "Incident"} during {entry.activity}
                      </strong>
                      <p>{energyFor(entry.energy)?.label ?? ""} energy</p>
                      <small>{formatWhen(entry.at)}</small>
                    </div>
                  </li>
                ),
              )}
            </ul>
          )}
        </section>

        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>Your home reports</h2>
              <p>What you&apos;ve shared with the teacher</p>
            </div>
          </div>
          {homeIncidents.length === 0 ? (
            <div className="parent-list-empty">
              <p>You haven&apos;t shared anything yet.</p>
              <button className="incident-cancel" type="button" onClick={openReport}>
                Report home incident
              </button>
            </div>
          ) : (
            <ul className="parent-feed">
              {homeIncidents.map((item) => {
                const itemMood = moodFor(item.mood);
                const itemEnergy = energyFor(item.energy);
                return (
                  <li key={item.id}>
                    <span className="parent-feed-icon" aria-hidden="true">
                      {itemMood?.emoji ?? "🏠"}
                    </span>
                    <div>
                      <strong>
                        {itemMood?.label ?? "Home incident"}
                        {itemEnergy ? ` · ${itemEnergy.label} energy` : ""}
                      </strong>
                      {item.note ? <p>{item.note}</p> : null}
                      <small>{formatWhen(item.occurredAt)}</small>
                    </div>
                    <span className={`parent-seen${item.seen ? " is-seen" : ""}`}>{item.seen ? "Seen" : "Sent"}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {open ? (
        <div className="modal-backdrop" onClick={closeReport}>
          <div
            className="modal-card incident-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="home-incident-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h3 id="home-incident-title">Report home incident</h3>
                <p className="dashboard-subtitle">
                  For {child.name}
                  {child.educatorName ? ` · sent to ${child.educatorName}` : ""}
                </p>
              </div>
              <button className="drawer-close" type="button" onClick={closeReport} aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <section className="incident-section" aria-labelledby="home-mood-title">
                <div className="incident-section-head">
                  <span className="incident-step" aria-hidden="true">1</span>
                  <div>
                    <h4 id="home-mood-title">How is {child.firstname} feeling?</h4>
                    <p>Pick the one that fits best.</p>
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

              <section className="incident-section" aria-labelledby="home-energy-title">
                <div className="incident-section-head">
                  <span className="incident-step" aria-hidden="true">2</span>
                  <div>
                    <h4 id="home-energy-title">Energy level</h4>
                    <p>Optional. Tap again to clear.</p>
                  </div>
                </div>
                <div className="incident-energy">
                  {ENERGY_LEVELS.map((option) => (
                    <button
                      key={option.id}
                      className={`incident-card incident-mood${energy === option.id ? " is-selected" : ""}`}
                      type="button"
                      aria-pressed={energy === option.id}
                      onClick={() => setEnergy((current) => (current === option.id ? null : option.id))}
                    >
                      <span className="incident-emoji" aria-hidden="true">
                        {option.emoji}
                      </span>
                      <strong>{option.label}</strong>
                    </button>
                  ))}
                </div>
              </section>

              <section className="incident-section" aria-labelledby="home-details-title">
                <div className="incident-section-head">
                  <span className="incident-step" aria-hidden="true">3</span>
                  <div>
                    <h4 id="home-details-title">What happened?</h4>
                    <p>A short note helps the teacher prepare for the day.</p>
                  </div>
                </div>
                <div className="parent-detail-fields">
                  <label className="form-group" htmlFor="home-incident-time">
                    When
                    <input
                      id="home-incident-time"
                      type="datetime-local"
                      value={occurredAt}
                      max={localInputValue(new Date())}
                      onChange={(event) => setOccurredAt(event.target.value)}
                    />
                  </label>
                  <label className="form-group" htmlFor="home-incident-note">
                    Note
                    <textarea
                      id="home-incident-note"
                      rows={3}
                      maxLength={500}
                      value={note}
                      placeholder="e.g. Didn't sleep well, upset at breakfast"
                      onChange={(event) => setNote(event.target.value)}
                    />
                  </label>
                </div>
              </section>

              {error ? (
                <p className="incident-error" role="alert">
                  {error}
                </p>
              ) : null}
            </div>
            <div className="modal-footer incident-footer">
              <button className="incident-cancel" type="button" onClick={closeReport} disabled={isSaving}>
                Cancel
              </button>
              <button className="incident-save" type="button" onClick={save} disabled={isSaving}>
                {isSaving ? "Sending…" : "Send to teacher"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
