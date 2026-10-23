"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signOut } from "@/app/login/actions";
import "../admin/admin.css";
import {
  Layers,
  Building2,
  Users,
  HeartHandshake,
  Settings,
  Search,
  Bell,
  CheckCircle2,
  Menu,
  ChevronRight,
  Plus,
  ArrowUpRight,
} from "lucide-react";

interface SchoolSummary {
  id: string;
  name: string;
  type: string;
  usersCount: number;
  parentsCount: number;
  status: "Active" | "Review";
}

interface RecentActivity {
  id: string;
  title: string;
  description: string;
  time: string;
  category: "School" | "User" | "Parent";
}

const schoolsList: SchoolSummary[] = [
  {
    id: "sch-1",
    name: "Harborview Learning Center",
    type: "Inclusive Support Center",
    usersCount: 64,
    parentsCount: 52,
    status: "Active",
  },
  {
    id: "sch-2",
    name: "Cascade Inclusive Academy",
    type: "Elementary & Middle School",
    usersCount: 42,
    parentsCount: 38,
    status: "Active",
  },
  {
    id: "sch-3",
    name: "Sunridge Neurodiverse High",
    type: "Secondary Learning Lab",
    usersCount: 22,
    parentsCount: 18,
    status: "Active",
  },
];

const activitiesList: RecentActivity[] = [
  {
    id: "act-1",
    title: "New student enrolled",
    description: "Rowan Ellis registered at Harborview Learning Center",
    time: "25m ago",
    category: "User",
  },
  {
    id: "act-2",
    title: "Parent portal connection",
    description: "Min-Jun Kim connected guardian account",
    time: "1h ago",
    category: "Parent",
  },
  {
    id: "act-3",
    title: "School records synced",
    description: "Cascade Inclusive Academy daily attendance validated (95.1%)",
    time: "3h ago",
    category: "School",
  },
  {
    id: "act-4",
    title: "Learning accommodation updated",
    description: "Sarah Lin updated visual schedule preferences for Room 8",
    time: "Yesterday",
    category: "User",
  },
  {
    id: "act-5",
    title: "Family communication shared",
    description: "Morning transit note confirmed by 14 parents",
    time: "Yesterday",
    category: "Parent",
  },
];

export default function SuperAdminDashboard() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const totalUsers = schoolsList.reduce((acc, s) => acc + s.usersCount, 0);
  const totalParents = schoolsList.reduce((acc, s) => acc + s.parentsCount, 0);

  return (
    <div className="admin-shell">
      {/* Mobile Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="drawer-backdrop"
          style={{ zIndex: 39 }}
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Dark Sidebar - Fixed 100vh */}
      <aside
        className={`admin-sidebar ${mobileSidebarOpen ? "mobile-open" : ""}`}
        aria-label="Sidebar Navigation"
      >
        <div className="sidebar-top">
          <Link className="admin-brand" href="/" aria-label="Equilinks home">
            <span className="admin-brand-mark" aria-hidden="true">
              <i />
              <i />
            </span>
            <span>
              equi<span>links</span>
            </span>
          </Link>

          <p className="nav-section-title">WORKSPACE</p>
          <nav className="workspace-nav" aria-label="Primary Navigation">
            <Link className="workspace-link is-active" href="/super-admin">
              <Layers size={18} />
              <span>Overview</span>
            </Link>
            <Link className="workspace-link" href="/admin/schools">
              <Building2 size={18} />
              <span>Schools</span>
              <span className="nav-count">{schoolsList.length}</span>
            </Link>
            <Link className="workspace-link" href="/super-admin/users">
              <Users size={18} />
              <span>Users</span>
              <span className="nav-count">{totalUsers}</span>
            </Link>
            <Link className="workspace-link" href="/admin/parents">
              <HeartHandshake size={18} />
              <span>Parents</span>
              <span className="nav-count">{totalParents}</span>
            </Link>
            <Link className="workspace-link" href="/super-admin#settings">
              <Settings size={18} />
              <span>Settings</span>
            </Link>
          </nav>
        </div>

        {/* Sidebar Footer & User Profile */}
        <div className="sidebar-bottom">
          <div className="sidebar-profile" role="button" tabIndex={0}>
            <span className="profile-avatar">
              MC
              <span className="profile-avatar-online" title="Online" />
            </span>
            <div className="profile-copy">
              <strong>Maya Chen</strong>
              <small>Super Admin</small>
            </div>
          </div>
          <form action={signOut}>
            <button className="sign-out-button" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main" id="overview">
        {/* Simple Topbar */}
        <header className="admin-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              className="icon-button mobile-menu-btn"
              style={{ display: "none" }}
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              aria-label="Toggle navigation menu"
            >
              <Menu size={18} />
            </button>
            <div className="breadcrumb">
              <span>Super Admin</span>
              <b>/</b>
              <strong>Overview</strong>
            </div>
          </div>

          <div className="topbar-actions">
            <div className="admin-search" role="search">
              <Search size={15} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Quick Search"
              />
            </div>
            <button className="icon-button notification-button" aria-label="Notifications">
              <span className="notification-dot" />
              <Bell size={18} />
            </button>
            <span className="topbar-avatar" title="Maya Chen">
              MC
            </span>
          </div>
        </header>

        {/* Simple Overview Content */}
        <div className="admin-content" style={{ maxWidth: "1200px" }}>
          {/* Header */}
          <section className="dashboard-heading">
            <div>
              <p className="dashboard-date">OVERVIEW</p>
              <h1>Good morning, Maya</h1>
              <p className="dashboard-subtitle">
                A simple overview across your schools, users, and parents.
              </p>
            </div>
          </section>

          {/* 4 Clean Metric Cards */}
          <section className="metric-grid" aria-label="Key metrics">
            <article className="metric-card">
              <div className="metric-top">
                <span>Schools</span>
                <span className="metric-icon" style={{ background: "var(--iris-soft)", color: "var(--iris)" }}>
                  <Building2 size={17} />
                </span>
              </div>
              <div className="metric-number">{schoolsList.length}</div>
              <div className="metric-footer">
                <span className="metric-up">Active</span>
                <span>campuses registered</span>
              </div>
            </article>

            <article className="metric-card">
              <div className="metric-top">
                <span>Users</span>
                <span className="metric-icon" style={{ background: "var(--sage-soft)", color: "var(--sage)" }}>
                  <Users size={17} />
                </span>
              </div>
              <div className="metric-number">{totalUsers}</div>
              <div className="metric-footer">
                <span className="metric-up">
                  <ArrowUpRight size={13} /> +8
                </span>
                <span>this month</span>
              </div>
            </article>

            <article className="metric-card">
              <div className="metric-top">
                <span>Parents</span>
                <span className="metric-icon" style={{ background: "var(--coral-soft)", color: "var(--coral)" }}>
                  <HeartHandshake size={17} />
                </span>
              </div>
              <div className="metric-number">{totalParents}</div>
              <div className="metric-footer">
                <span className="metric-up">
                  <ArrowUpRight size={13} /> +4
                </span>
                <span>connected guardians</span>
              </div>
            </article>

            <article className="metric-card">
              <div className="metric-top">
                <span>System Status</span>
                <span className="metric-icon" style={{ background: "#e8f7ee", color: "#2e7d4a" }}>
                  <CheckCircle2 size={17} />
                </span>
              </div>
              <div className="metric-number" style={{ fontSize: "28px" }}>Operational</div>
              <div className="metric-footer">
                <span className="metric-up">100%</span>
                <span>all services online</span>
              </div>
            </article>
          </section>

          {/* Simple Two-Column Layout */}
          <section className="overview-grid" style={{ gridTemplateColumns: "1.2fr 1fr", gap: "20px" }}>
            {/* Schools Overview Panel */}
            <article className="dashboard-panel" id="schools">
              <div className="panel-heading">
                <div>
                  <h2>Schools</h2>
                  <p>Registered campuses and centers</p>
                </div>
                <span style={{ fontSize: "12px", color: "var(--admin-muted)" }}>
                  {schoolsList.length} total
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {schoolsList.map((school) => (
                  <div
                    key={school.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 14px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--admin-border-subtle)",
                      background: "var(--admin-surface)",
                      transition: "background var(--transition-fast)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "8px",
                          background: "var(--admin-surface-subtle)",
                          border: "1px solid var(--admin-border)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--admin-ink)",
                          fontWeight: 700,
                          fontSize: "13px",
                        }}
                      >
                        {school.name[0]}
                      </div>
                      <div>
                        <strong style={{ fontSize: "13.5px", color: "var(--admin-ink)", display: "block" }}>
                          {school.name}
                        </strong>
                        <small style={{ fontSize: "11.5px", color: "var(--admin-muted)" }}>
                          {school.type}
                        </small>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div style={{ textAlign: "right" }}>
                        <strong style={{ fontSize: "12.5px", color: "var(--admin-ink)", display: "block" }}>
                          {school.usersCount} users
                        </strong>
                        <small style={{ fontSize: "11px", color: "var(--admin-muted)" }}>
                          {school.parentsCount} parents
                        </small>
                      </div>
                      <span className="status-pill status-green">
                        <i />
                        {school.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            {/* Recent Activity Panel */}
            <article className="dashboard-panel" id="parents">
              <div className="panel-heading">
                <div>
                  <h2>Recent Activity</h2>
                  <p>Latest updates across the platform</p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {activitiesList.map((item) => (
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
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        padding: "2px 7px",
                        borderRadius: "4px",
                        background:
                          item.category === "School"
                            ? "var(--iris-soft)"
                            : item.category === "User"
                            ? "var(--sage-soft)"
                            : "var(--coral-soft)",
                        color:
                          item.category === "School"
                            ? "var(--iris)"
                            : item.category === "User"
                            ? "var(--sage)"
                            : "var(--coral)",
                        marginTop: "2px",
                        flexShrink: 0,
                      }}
                    >
                      {item.category}
                    </span>
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: "13px", color: "var(--admin-ink)", display: "block" }}>
                        {item.title}
                      </strong>
                      <small style={{ fontSize: "12px", color: "var(--admin-muted)", display: "block" }}>
                        {item.description}
                      </small>
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--admin-subtle)", whiteSpace: "nowrap" }}>
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            </article>
          </section>

          {/* Minimal Footer */}
          <footer className="dashboard-footer" style={{ borderTop: "1px solid var(--admin-border)", paddingTop: "18px" }}>
            <span>Equilinks Super Admin</span>
            <span>Simple, accessible learning support.</span>
          </footer>
        </div>
      </main>
    </div>
  );
}