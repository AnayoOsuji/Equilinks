"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { signOut } from "@/app/login/actions";
import { ProfileAvatar, TopbarAvatar } from "../profile-avatar";
import { useAdminShell } from "../shell";
import { readImageFile } from "@/lib/avatar";
import "../admin.css";
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
  Plus,
  Mail,
  Phone,
  MessageSquare,
  X,
  UploadCloud,
  ChevronDown,
} from "lucide-react";

interface ParentContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  initials: string;
  school: string;
  studentName: string;
  relationship: "Mother" | "Father" | "Guardian" | "Caregiver";
  status: "Active" | "Pending Invite" | "Inactive";
  portalAccess: "Full Access" | "Read Only" | "Invited";
  lastCommunication: string;
  avatarColor: "green" | "coral" | "blue" | "amber" | "purple";
  avatar?: string;
  notes?: string;
}

const initialParentsList: ParentContact[] = [
  {
    id: "par-1",
    name: "Eleanor & Mark Vance",
    email: "e.vance@family.org",
    phone: "(555) 234-8901",
    initials: "EV",
    school: "Harborview Learning Center",
    studentName: "Avery Morgan",
    relationship: "Mother",
    status: "Active",
    portalAccess: "Full Access",
    lastCommunication: "Today, 9:15 AM",
    avatarColor: "green",
    notes: "Requested sensory break summaries after afternoon math blocks.",
  },
  {
    id: "par-2",
    name: "Carlos Mendoza",
    email: "carlos.m@mendoza.co",
    phone: "(555) 341-9982",
    initials: "CM",
    school: "Cascade Inclusive Academy",
    studentName: "Jordan Lee",
    relationship: "Father",
    status: "Active",
    portalAccess: "Full Access",
    lastCommunication: "Yesterday",
    avatarColor: "blue",
    notes: "Prefers bilingual English/Spanish communication summaries.",
  },
  {
    id: "par-3",
    name: "Beatrice Kim",
    email: "b.kim@pacificreach.io",
    phone: "(555) 887-1244",
    initials: "BK",
    school: "Harborview Learning Center",
    studentName: "Sam Kim",
    relationship: "Mother",
    status: "Active",
    portalAccess: "Full Access",
    lastCommunication: "Oct 19, 2026",
    avatarColor: "coral",
    notes: "Coordinates directly with Dr. Aris Vance regarding motor skill therapy.",
  },
  {
    id: "par-4",
    name: "Hannah & David Bennett",
    email: "hannah.bennett@skyline.net",
    phone: "(555) 672-0091",
    initials: "HB",
    school: "Harborview Learning Center",
    studentName: "Riley Bennett",
    relationship: "Guardian",
    status: "Active",
    portalAccess: "Read Only",
    lastCommunication: "Oct 18, 2026",
    avatarColor: "amber",
    notes: "Requested morning check-in notifications enabled via SMS.",
  },
  {
    id: "par-5",
    name: "Kenji & Yuka Takahashi",
    email: "takahashi.k@aurora.org",
    phone: "(555) 412-7723",
    initials: "KT",
    school: "Sunridge Neurodiverse High",
    studentName: "Leo Takahashi",
    relationship: "Father",
    status: "Active",
    portalAccess: "Full Access",
    lastCommunication: "Today, 10:20 AM",
    avatarColor: "purple",
    notes: "Transition planning for vocational apprenticeship program.",
  },
  {
    id: "par-6",
    name: "Patricia Miller",
    email: "p.miller@coastalreach.com",
    phone: "(555) 902-3112",
    initials: "PM",
    school: "Cascade Inclusive Academy",
    studentName: "Mason Miller",
    relationship: "Mother",
    status: "Pending Invite",
    portalAccess: "Invited",
    lastCommunication: "Invited 2d ago",
    avatarColor: "green",
    notes: "Awaiting parent portal onboarding verification.",
  },
  {
    id: "par-7",
    name: "Robert Hughes",
    email: "r.hughes@apexdesign.org",
    phone: "(555) 819-4402",
    initials: "RH",
    school: "Sunridge Neurodiverse High",
    studentName: "Chloe Hughes",
    relationship: "Father",
    status: "Active",
    portalAccess: "Full Access",
    lastCommunication: "Oct 17, 2026",
    avatarColor: "blue",
    notes: "Speech device charging protocol verified with campus staff.",
  },
  {
    id: "par-8",
    name: "Miriam Al-Hassan",
    email: "m.alhassan@globalhealth.org",
    phone: "(555) 765-9832",
    initials: "MA",
    school: "Harborview Learning Center",
    studentName: "Zayn Al-Hassan",
    relationship: "Mother",
    status: "Active",
    portalAccess: "Full Access",
    lastCommunication: "Oct 15, 2026",
    avatarColor: "coral",
    notes: "Weekly OT progress notes requested before Friday dismissal.",
  },
];

export default function ParentsPage() {
  const shell = useAdminShell();
  const profile = shell?.profile ?? null;
  const [parents, setParents] = useState<ParentContact[]>(initialParentsList);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSchool, setSelectedSchool] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeParentDetail, setActiveParentDetail] = useState<ParentContact | null>(null);

  // New Parent form state
  const [newParent, setNewParent] = useState({
    avatar: "",
    surname: "",
    firstname: "",
    email: "",
    phone: "",
    studentName: "",
    school: "Harborview Learning Center",
    relationship: "Mother" as ParentContact["relationship"],
    status: "Active" as ParentContact["status"],
    portalAccess: "Full Access" as ParentContact["portalAccess"],
    notes: "",
  });

  // Filtered Parents
  const filteredParents = useMemo(() => {
    return parents.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.school.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;
      if (selectedSchool !== "all" && p.school !== selectedSchool) return false;
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      return true;
    });
  }, [parents, searchQuery, selectedSchool, statusFilter]);

  // Metric counts
  const activeCount = parents.filter((p) => p.status === "Active").length;
  const pendingCount = parents.filter((p) => p.status === "Pending Invite").length;

  const handleCreateParent = (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = `${newParent.firstname.trim()} ${newParent.surname.trim()}`.trim();
    if (!fullName || !newParent.email.trim() || !newParent.studentName.trim()) return;

    const initials =
      `${newParent.firstname.trim()[0] || ""}${newParent.surname.trim()[0] || ""}`.toUpperCase() ||
      "PC";

    const colors: ParentContact["avatarColor"][] = ["green", "coral", "blue", "amber", "purple"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const created: ParentContact = {
      id: `par-${Date.now()}`,
      name: fullName,
      email: newParent.email,
      phone: newParent.phone || "(555) 000-0000",
      initials,
      school: newParent.school,
      studentName: newParent.studentName,
      relationship: newParent.relationship,
      status: newParent.status,
      portalAccess: newParent.portalAccess,
      lastCommunication: "Just now",
      avatarColor: randomColor,
      avatar: newParent.avatar || undefined,
      notes: newParent.notes || "Family contact registered via administration portal.",
    };

    setParents([created, ...parents]);
    setIsAddModalOpen(false);
    setNewParent({
      avatar: "",
      surname: "",
      firstname: "",
      email: "",
      phone: "",
      studentName: "",
      school: "Harborview Learning Center",
      relationship: "Mother",
      status: "Active",
      portalAccess: "Full Access",
      notes: "",
    });
  };

  return (
    <div className={shell ? undefined : "admin-shell"} style={shell ? { display: "contents" } : undefined}>
      {!shell && mobileSidebarOpen && (
        <div
          className="drawer-backdrop"
          style={{ zIndex: 39 }}
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {!shell && (
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
            <Link className="workspace-link" href="/admin">
              <Layers size={18} />
              <span>Overview</span>
            </Link>
            <Link className="workspace-link" href="/admin/schools">
              <Building2 size={18} />
              <span>Schools</span>
              <span className="nav-count">3</span>
            </Link>
            <Link className="workspace-link" href="/admin/users">
              <Users size={18} />
              <span>Users</span>
              <span className="nav-count">10</span>
            </Link>
            <Link className="workspace-link" href="/admin#settings">
              <Settings size={18} />
              <span>Settings</span>
            </Link>
          </nav>
        </div>

        {/* Sidebar Footer & User Profile */}
        <div className="sidebar-bottom">
          <div className="sidebar-profile" role="button" tabIndex={0}>
            {profile ? <ProfileAvatar profile={profile} /> : <span className="profile-avatar" />}
            <div className="profile-copy">
              <strong>{profile?.name || "Equilinks Admin"}</strong>
              <small>{profile?.roleLabel || "Equilinks Admin"}</small>
            </div>
          </div>
          <form action={signOut}>
            <button className="sign-out-button" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </aside>
      )}

      {/* Main Content Area */}
      <main className="admin-main" id="parents-main">
        {/* Simple Topbar */}
        <header className="admin-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              className="admin-sidebar-toggle"
              onClick={() => (shell ? shell.openMenu() : setMobileSidebarOpen(true))}
              aria-label="Toggle navigation menu"
            >
              <Menu size={18} />
            </button>
            <div className="breadcrumb">
              <span>Admin</span>
              <b>/</b>
              <strong>Parents</strong>
            </div>
          </div>

          <div className="topbar-actions">
            <div className="admin-search" role="search">
              <Search size={15} />
              <input
                type="text"
                placeholder="Search parents or students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Quick Search"
              />
            </div>
            <button className="icon-button notification-button" aria-label="Notifications">
              <span className="notification-dot" />
              <Bell size={18} />
            </button>
            {profile ? <TopbarAvatar profile={profile} /> : <span className="topbar-avatar" />}
          </div>
        </header>

        {/* Simple Parents Content */}
        <div className="admin-content" style={{ maxWidth: "1200px" }}>
          {/* Header */}
          <section className="dashboard-heading">
            <div>
              <p className="dashboard-date">DIRECTORY</p>
              <h1>Parents</h1>
              <p className="dashboard-subtitle">
                Manage family contacts, student linkages, and portal communications.
              </p>
            </div>
            <div className="heading-actions">
              <button
                className="add-student-button"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus size={16} />
                <span>Add Parent</span>
              </button>
            </div>
          </section>

          {/* Simple Metric Cards */}
          <section className="metric-grid" aria-label="Key metrics">
            <article className="metric-card">
              <div className="metric-top">
                <span>Total Parents</span>
                <span className="metric-icon" style={{ background: "var(--coral-soft)", color: "var(--coral)" }}>
                  <HeartHandshake size={17} />
                </span>
              </div>
              <div className="metric-number">{parents.length}</div>
              <div className="metric-footer">
                <span className="metric-up">Linked</span>
                <span>to enrolled learners</span>
              </div>
            </article>

            <article className="metric-card">
              <div className="metric-top">
                <span>Active Portals</span>
                <span className="metric-icon" style={{ background: "var(--sage-soft)", color: "var(--sage)" }}>
                  <Users size={17} />
                </span>
              </div>
              <div className="metric-number">{activeCount}</div>
              <div className="metric-footer">
                <span className="metric-up">{((activeCount / (parents.length || 1)) * 100).toFixed(0)}%</span>
                <span>engagement rate</span>
              </div>
            </article>

            <article className="metric-card">
              <div className="metric-top">
                <span>Campuses</span>
                <span className="metric-icon" style={{ background: "var(--iris-soft)", color: "var(--iris)" }}>
                  <Building2 size={17} />
                </span>
              </div>
              <div className="metric-number">3</div>
              <div className="metric-footer">
                <span className="metric-up">Active</span>
                <span>school communities</span>
              </div>
            </article>

            <article className="metric-card">
              <div className="metric-top">
                <span>Pending Invites</span>
                <span className="metric-icon" style={{ background: "var(--amber-soft)", color: "var(--amber)" }}>
                  <Mail size={17} />
                </span>
              </div>
              <div className="metric-number">{pendingCount}</div>
              <div className="metric-footer">
                <span className="metric-up">Awaiting</span>
                <span>portal signups</span>
              </div>
            </article>
          </section>

          {/* Simple Filter Pills & School Dropdown */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "14px",
              flexWrap: "wrap",
            }}
          >
            <div className="table-filter-tabs">
              <button
                className={`filter-tab ${statusFilter === "all" ? "is-active" : ""}`}
                onClick={() => setStatusFilter("all")}
              >
                All Parents ({parents.length})
              </button>
              <button
                className={`filter-tab ${statusFilter === "Active" ? "is-active" : ""}`}
                onClick={() => setStatusFilter("Active")}
              >
                Active ({activeCount})
              </button>
              <button
                className={`filter-tab ${statusFilter === "Pending Invite" ? "is-active" : ""}`}
                onClick={() => setStatusFilter("Pending Invite")}
              >
                Pending ({pendingCount})
              </button>
            </div>

            {/* School Dropdown */}
            <div style={{ position: "relative" }}>
              <select
                className="campus-select"
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
                style={{ paddingRight: "32px" }}
              >
                <option value="all">All Schools</option>
                <option value="Harborview Learning Center">Harborview Learning Center</option>
                <option value="Cascade Inclusive Academy">Cascade Inclusive Academy</option>
                <option value="Sunridge Neurodiverse High">Sunridge Neurodiverse High</option>
              </select>
              <ChevronDown
                size={14}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  color: "var(--admin-muted)",
                }}
              />
            </div>
          </div>

          {/* Clean Parents Table Panel */}
          <section
            className="dashboard-panel"
            style={{
              padding: "0",
              overflow: "hidden",
              border: "1px solid var(--admin-border)",
              borderRadius: "var(--radius-md)",
              background: "var(--admin-surface)",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            }}
          >
            <div className="table-responsive">
              <table
                className="student-table"
                aria-label="Parents Table"
                style={{ width: "100%", borderCollapse: "collapse" }}
              >
                <thead>
                  <tr style={{ background: "var(--admin-surface-subtle)", borderBottom: "1px solid var(--admin-border)" }}>
                    <th scope="col" style={{ padding: "14px 20px" }}>PARENT / GUARDIAN</th>
                    <th scope="col" style={{ padding: "14px 16px" }}>CAMPUS</th>
                    <th scope="col" style={{ padding: "14px 16px" }}>STATUS</th>
                    <th scope="col" style={{ padding: "14px 16px" }}>LAST ACTIVITY</th>
                    <th scope="col" style={{ padding: "14px 20px", textAlign: "right" }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParents.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        style={{
                          textAlign: "center",
                          padding: "48px 24px",
                          color: "var(--admin-muted)",
                          fontSize: "13.5px",
                        }}
                      >
                        No parents found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredParents.map((parent) => (
                      <tr
                        key={parent.id}
                        onClick={() => setActiveParentDetail(parent)}
                        style={{
                          cursor: "pointer",
                          borderBottom: "1px solid var(--admin-border-subtle)",
                          transition: "background 0.15s ease",
                        }}
                      >
                        {/* Parent Cell */}
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            {parent.avatar ? (
                              <img
                                src={parent.avatar}
                                alt={parent.name}
                                style={{
                                  width: "38px",
                                  height: "38px",
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                  flexShrink: 0,
                                }}
                              />
                            ) : (
                              <span
                                className={`student-avatar avatar-${parent.avatarColor}`}
                                style={{
                                  width: "38px",
                                  height: "38px",
                                  fontSize: "13px",
                                  flexShrink: 0,
                                }}
                              >
                                {parent.initials}
                              </span>
                            )}
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                              <strong
                                style={{
                                  fontSize: "13.5px",
                                  fontWeight: 650,
                                  color: "var(--admin-ink)",
                                  letterSpacing: "-0.01em",
                                }}
                              >
                                {parent.name}
                              </strong>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                <small style={{ fontSize: "11.5px", color: "var(--admin-muted)" }}>
                                  {parent.email}
                                </small>
                                <span style={{ fontSize: "11px", color: "var(--admin-border-strong)" }}>•</span>
                                <small style={{ fontSize: "11.5px", color: "var(--admin-muted)" }}>
                                  {parent.phone}
                                </small>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* School Cell */}
                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              fontSize: "12px",
                              fontWeight: 550,
                              color: "var(--admin-ink)",
                              background: "var(--admin-surface-subtle)",
                              border: "1px solid var(--admin-border)",
                              padding: "4px 10px",
                              borderRadius: "var(--radius-sm)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <Building2 size={12} color="var(--admin-muted)" />
                            {parent.school.replace(" Learning Center", "").replace(" Inclusive Academy", "").replace(" Neurodiverse High", "")}
                          </span>
                        </td>

                        {/* Status Cell */}
                        <td style={{ padding: "14px 16px" }}>
                          <span
                            className={`status-pill ${
                              parent.status === "Active"
                                ? "status-green"
                                : parent.status === "Pending Invite"
                                ? "status-amber"
                                : "status-coral"
                            }`}
                            style={{
                              padding: "4px 10px",
                              fontSize: "11.5px",
                              fontWeight: 600,
                              letterSpacing: "0.01em",
                            }}
                          >
                            <i />
                            {parent.status}
                          </span>
                        </td>

                        {/* Last Activity */}
                        <td style={{ padding: "14px 16px" }}>
                          <span
                            className="update-time"
                            style={{
                              fontSize: "12.5px",
                              color: "var(--admin-muted)",
                              fontWeight: 500,
                            }}
                          >
                            {parent.lastCommunication}
                          </span>
                        </td>

                        {/* Quick Actions */}
                        <td
                          style={{ padding: "14px 20px", textAlign: "right" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            <a
                              href={`mailto:${parent.email}`}
                              title={`Email ${parent.name}`}
                              style={{
                                width: "30px",
                                height: "30px",
                                borderRadius: "6px",
                                border: "1px solid var(--admin-border)",
                                background: "var(--admin-surface)",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "var(--admin-muted)",
                                transition: "all 0.15s ease",
                                textDecoration: "none",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = "var(--admin-ink)";
                                e.currentTarget.style.borderColor = "var(--admin-ink)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = "var(--admin-muted)";
                                e.currentTarget.style.borderColor = "var(--admin-border)";
                              }}
                            >
                              <Mail size={13} />
                            </a>

                            <button
                              className="row-action-btn"
                              onClick={() => setActiveParentDetail(parent)}
                              style={{
                                padding: "5px 12px",
                                fontSize: "12px",
                                fontWeight: 600,
                                borderRadius: "6px",
                                border: "1px solid var(--admin-border)",
                                background: "var(--admin-surface)",
                                color: "var(--admin-ink)",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                              }}
                            >
                              View
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

          {/* Minimal Footer */}
          <footer className="dashboard-footer" style={{ borderTop: "1px solid var(--admin-border)", paddingTop: "18px" }}>
            <span>Equilinks Parent Portal Directory</span>
            <span>Total: {parents.length} registered family contacts</span>
          </footer>
        </div>
      </main>

      {/* Add Parent Contact Modal (70% width, max-height 80vh, scroll on overflow, 2-column fields) */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div
            className="modal-card"
            style={{
              width: "70%",
              maxWidth: "900px",
              minWidth: "320px",
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header" style={{ flexShrink: 0 }}>
              <h3>Add Parent / Guardian</h3>
              <button
                className="drawer-close"
                onClick={() => setIsAddModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={handleCreateParent}
              style={{
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                flex: 1,
              }}
            >
              <div
                className="modal-body"
                style={{
                  gap: "20px",
                  overflowY: "auto",
                  flex: 1,
                }}
              >
                {/* Centered Avatar Upload */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "4px 0 10px 0",
                  }}
                >
                  <label
                    htmlFor="parent-avatar-input"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100px",
                      height: "100px",
                      borderRadius: "50%",
                      border: "2px dashed var(--admin-border-strong)",
                      background: newParent.avatar
                        ? `url(${newParent.avatar}) center/cover no-repeat`
                        : "var(--admin-surface-subtle)",
                      cursor: "pointer",
                      transition: "all var(--transition-fast)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                    title="Click to upload profile avatar"
                  >
                    {!newParent.avatar ? (
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
                      id="parent-avatar-input"
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (!file) return;
                        void readImageFile(file).then((avatar) => {
                          setNewParent((prev) => ({ ...prev, avatar }));
                        });
                      }}
                    />
                  </label>
                  <span style={{ fontSize: "12px", color: "var(--admin-muted)" }}>
                    Click to upload parent avatar
                  </span>
                </div>

                {/* 2-Column Fields Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "16px 20px",
                  }}
                >
                  {/* Surname */}
                  <div className="form-group">
                    <label htmlFor="parent-surname">Surname</label>
                    <input
                      id="parent-surname"
                      type="text"
                      required
                      placeholder="e.g. Vance"
                      value={newParent.surname}
                      onChange={(e) => setNewParent({ ...newParent, surname: e.target.value })}
                    />
                  </div>

                  {/* Firstname */}
                  <div className="form-group">
                    <label htmlFor="parent-firstname">Firstname</label>
                    <input
                      id="parent-firstname"
                      type="text"
                      required
                      placeholder="e.g. Eleanor"
                      value={newParent.firstname}
                      onChange={(e) => setNewParent({ ...newParent, firstname: e.target.value })}
                    />
                  </div>

                  {/* Email */}
                  <div className="form-group">
                    <label htmlFor="parent-email">Email Address</label>
                    <input
                      id="parent-email"
                      type="email"
                      required
                      placeholder="parent@family.org"
                      value={newParent.email}
                      onChange={(e) => setNewParent({ ...newParent, email: e.target.value })}
                    />
                  </div>

                  {/* Phone */}
                  <div className="form-group">
                    <label htmlFor="parent-phone">Phone Number</label>
                    <input
                      id="parent-phone"
                      type="tel"
                      placeholder="(555) 000-0000"
                      value={newParent.phone}
                      onChange={(e) => setNewParent({ ...newParent, phone: e.target.value })}
                    />
                  </div>

                  {/* Student Name */}
                  <div className="form-group">
                    <label htmlFor="parent-student">Linked Student Name</label>
                    <input
                      id="parent-student"
                      type="text"
                      required
                      placeholder="e.g. Avery Morgan"
                      value={newParent.studentName}
                      onChange={(e) => setNewParent({ ...newParent, studentName: e.target.value })}
                    />
                  </div>

                  {/* Relationship */}
                  <div className="form-group">
                    <label htmlFor="parent-rel">Relationship</label>
                    <select
                      id="parent-rel"
                      value={newParent.relationship}
                      onChange={(e) =>
                        setNewParent({
                          ...newParent,
                          relationship: e.target.value as ParentContact["relationship"],
                        })
                      }
                    >
                      <option value="Mother">Mother</option>
                      <option value="Father">Father</option>
                      <option value="Guardian">Guardian</option>
                      <option value="Caregiver">Caregiver</option>
                    </select>
                  </div>

                  {/* Campus / School */}
                  <div className="form-group">
                    <label htmlFor="parent-school">Select School</label>
                    <select
                      id="parent-school"
                      value={newParent.school}
                      onChange={(e) => setNewParent({ ...newParent, school: e.target.value })}
                    >
                      <option value="Harborview Learning Center">Harborview Learning Center</option>
                      <option value="Cascade Inclusive Academy">Cascade Inclusive Academy</option>
                      <option value="Sunridge Neurodiverse High">Sunridge Neurodiverse High</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div className="form-group">
                    <label htmlFor="parent-status">Account Status</label>
                    <select
                      id="parent-status"
                      value={newParent.status}
                      onChange={(e) =>
                        setNewParent({
                          ...newParent,
                          status: e.target.value as ParentContact["status"],
                        })
                      }
                    >
                      <option value="Active">Active</option>
                      <option value="Pending Invite">Pending Invite</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ flexShrink: 0 }}>
                <button
                  type="button"
                  className="secondary-action-button"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="add-student-button">
                  <CheckCircle2 size={16} /> Save Parent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Parent Details Modal */}
      {activeParentDetail && (
        <div className="modal-backdrop" onClick={() => setActiveParentDetail(null)}>
          <div className="modal-card" style={{ maxWidth: "480px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {activeParentDetail.avatar ? (
                  <img
                    src={activeParentDetail.avatar}
                    alt={activeParentDetail.name}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                  />
                ) : (
                  <span className={`student-avatar avatar-${activeParentDetail.avatarColor}`}>
                    {activeParentDetail.initials}
                  </span>
                )}
                <div>
                  <h3 style={{ margin: 0 }}>{activeParentDetail.name}</h3>
                  <small style={{ color: "var(--admin-muted)" }}>
                    {activeParentDetail.relationship} of {activeParentDetail.studentName}
                  </small>
                </div>
              </div>
              <button
                className="drawer-close"
                onClick={() => setActiveParentDetail(null)}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ gap: "14px" }}>
              <div className="profile-card-grid">
                <div className="profile-info-box">
                  <small>Email</small>
                  <strong style={{ fontSize: "12px" }}>{activeParentDetail.email}</strong>
                </div>
                <div className="profile-info-box">
                  <small>Phone</small>
                  <strong style={{ fontSize: "12.5px" }}>{activeParentDetail.phone}</strong>
                </div>
                <div className="profile-info-box">
                  <small>Campus</small>
                  <strong style={{ fontSize: "12px" }}>{activeParentDetail.school}</strong>
                </div>
                <div className="profile-info-box">
                  <small>Status</small>
                  <strong style={{ fontSize: "12.5px" }}>{activeParentDetail.status}</strong>
                </div>
              </div>

              {activeParentDetail.notes && (
                <div
                  style={{
                    padding: "10px 12px",
                    background: "var(--admin-surface-subtle)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--admin-border)",
                    fontSize: "12.5px",
                    color: "var(--admin-ink)",
                  }}
                >
                  <strong style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--admin-muted)", display: "block", marginBottom: "4px" }}>
                    Notes
                  </strong>
                  {activeParentDetail.notes}
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ justifyContent: "space-between" }}>
              <button
                type="button"
                className="secondary-action-button"
                onClick={() => setActiveParentDetail(null)}
              >
                Close
              </button>
              <a
                href={`mailto:${activeParentDetail.email}`}
                className="secondary-action-button"
                style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <Mail size={14} /> Send Email
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
