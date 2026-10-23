import { Suspense } from "react";
import Link from "next/link";
import { ArrowUpRight, GraduationCap, HeartHandshake, Users } from "lucide-react";
import { getSchoolAdminStudents } from "@/lib/school-admin-users";
import { activities, campus, educators, parents } from "./data";

export default function SchoolAdminOverview() {
  return (
    <Suspense
      fallback={
        <div className="admin-content">
          <p className="dashboard-subtitle">Loading overview…</p>
        </div>
      }
    >
      <Overview />
    </Suspense>
  );
}

async function Overview() {
  const students = await getSchoolAdminStudents();
  const active = students.filter((student) => student.status === "Active").length;

  return (
    <div className="admin-content" style={{ maxWidth: "1200px" }}>
      <section className="dashboard-heading">
        <div>
          <p className="dashboard-date">OVERVIEW</p>
          <h1>Good morning, Jordan</h1>
          <p className="dashboard-subtitle">
            Today at {campus.name}: educators, parents, and students in one place.
          </p>
        </div>
      </section>

      <section className="metric-grid" aria-label="Campus metrics">
        <Link className="metric-card" href="/school-admin/users/educators">
          <div className="metric-top">
            <span>Educators</span>
            <span className="metric-icon" style={{ background: "var(--sage-soft)", color: "var(--sage)" }}>
              <Users size={17} />
            </span>
          </div>
          <div className="metric-number">{educators.length}</div>
          <div className="metric-footer">
            <span className="metric-up">On campus</span>
            <span>teaching staff</span>
          </div>
        </Link>

        <Link className="metric-card" href="/school-admin/users/parents">
          <div className="metric-top">
            <span>Parents</span>
            <span className="metric-icon" style={{ background: "var(--coral-soft)", color: "var(--coral)" }}>
              <HeartHandshake size={17} />
            </span>
          </div>
          <div className="metric-number">{parents.length}</div>
          <div className="metric-footer">
            <span className="metric-up">
              <ArrowUpRight size={13} /> Connected
            </span>
            <span>family accounts</span>
          </div>
        </Link>

        <Link className="metric-card" href="/school-admin/students">
          <div className="metric-top">
            <span>Students</span>
            <span className="metric-icon" style={{ background: "var(--iris-soft)", color: "var(--iris)" }}>
              <GraduationCap size={17} />
            </span>
          </div>
          <div className="metric-number">{students.length}</div>
          <div className="metric-footer">
            <span className="metric-up">{active} active</span>
            <span>student accounts</span>
          </div>
        </Link>

        <article className="metric-card">
          <div className="metric-top">
            <span>Campus</span>
            <span className="metric-icon" style={{ background: "var(--amber-soft)", color: "var(--amber)" }}>
              <Users size={17} />
            </span>
          </div>
          <div className="metric-number" style={{ fontSize: "22px", lineHeight: 1.2 }}>
            Harborview
          </div>
          <div className="metric-footer">
            <span className="metric-up">Active</span>
            <span>your school workspace</span>
          </div>
        </article>
      </section>

      <section className="overview-grid" style={{ gridTemplateColumns: "1.1fr 0.9fr", gap: "20px" }}>
        <article className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>Students</h2>
              <p>Learner accounts for this campus</p>
            </div>
            <Link href="/school-admin/students" style={{ fontSize: "12px", color: "var(--sage)", fontWeight: 650 }}>
              View all
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {students.length === 0 ? (
              <p className="dashboard-subtitle">No students are registered yet.</p>
            ) : (
              students.map((student) => (
                <div
                  key={student.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    padding: "12px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--admin-border-subtle)",
                  }}
                >
                  <div className="student-cell">
                    <span className={`student-avatar avatar-${student.avatarColor}`}>{student.initials}</span>
                    <span className="student-info-text">
                      <strong>{student.name}</strong>
                      <small>
                        {student.school} · {student.guardians}
                      </small>
                    </span>
                  </div>
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
                </div>
              ))
            )}
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>Recent activity</h2>
              <p>Latest notes from this campus</p>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {activities.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  paddingBottom: "10px",
                  borderBottom: "1px solid var(--admin-border-subtle)",
                }}
              >
                <span className="focus-tag">{item.category}</span>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: "13px", display: "block" }}>{item.title}</strong>
                  <small style={{ fontSize: "12px", color: "var(--admin-muted)" }}>{item.description}</small>
                </div>
                <span style={{ fontSize: "11px", color: "var(--admin-subtle)", whiteSpace: "nowrap" }}>{item.time}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <footer className="dashboard-footer" style={{ borderTop: "1px solid var(--admin-border)", paddingTop: "18px" }}>
        <span>Equilinks School Admin</span>
        <span>{campus.name}</span>
      </footer>
    </div>
  );
}
