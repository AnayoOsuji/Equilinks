"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
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
  UserCheck,
  Shield,
  GraduationCap,
  Sparkles,
  X,
  MoreHorizontal,
  ChevronDown,
  Filter,
  UploadCloud,
} from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: "School Admin" | "Equilinks Admin" | "Educator" | "Student" | "Specialist";
  school: string;
  status: "Active" | "Pending Invite" | "Inactive";
  lastActive: string;
  avatarColor: "green" | "coral" | "blue" | "amber" | "purple";
  avatar?: string;
}

const initialUsersList: AdminUser[] = [
  {
    id: "usr-1",
    name: "Avery Morgan",
    email: "avery.morgan@harborview.edu",
    initials: "AM",
    role: "Student",
    school: "Harborview Learning Center",
    status: "Active",
    lastActive: "Today, 8:14 AM",
    avatarColor: "green",
  },
  {
    id: "usr-2",
    name: "Dr. Aris Vance",
    email: "a.vance@harborview.edu",
    initials: "AV",
    role: "Specialist",
    school: "Harborview Learning Center",
    status: "Active",
    lastActive: "Today, 9:30 AM",
    avatarColor: "coral",
  },
  {
    id: "usr-3",
    name: "Sarah Lin",
    email: "s.lin@cascade.edu",
    initials: "SL",
    role: "Educator",
    school: "Cascade Inclusive Academy",
    status: "Active",
    lastActive: "Today, 10:05 AM",
    avatarColor: "blue",
  },
  {
    id: "usr-4",
    name: "Jordan Lee",
    email: "jordan.lee@cascade.edu",
    initials: "JL",
    role: "Student",
    school: "Cascade Inclusive Academy",
    status: "Active",
    lastActive: "Yesterday",
    avatarColor: "amber",
  },
  {
    id: "usr-5",
    name: "Marcus Reed",
    email: "m.reed@sunridge.edu",
    initials: "MR",
    role: "School Admin",
    school: "Sunridge Neurodiverse High",
    status: "Active",
    lastActive: "Yesterday",
    avatarColor: "purple",
  },
  {
    id: "usr-6",
    name: "Sam Kim",
    email: "sam.kim@harborview.edu",
    initials: "SK",
    role: "Student",
    school: "Harborview Learning Center",
    status: "Active",
    lastActive: "Today, 7:50 AM",
    avatarColor: "coral",
  },
  {
    id: "usr-7",
    name: "Elena Rostova",
    email: "e.rostova@cascade.edu",
    initials: "ER",
    role: "Specialist",
    school: "Cascade Inclusive Academy",
    status: "Active",
    lastActive: "Oct 19, 2026",
    avatarColor: "green",
  },
  {
    id: "usr-8",
    name: "Riley Bennett",
    email: "riley.b@harborview.edu",
    initials: "RB",
    role: "Student",
    school: "Harborview Learning Center",
    status: "Active",
    lastActive: "Oct 19, 2026",
    avatarColor: "amber",
  },
  {
    id: "usr-9",
    name: "Leo Takahashi",
    email: "leo.t@sunridge.edu",
    initials: "LT",
    role: "Student",
    school: "Sunridge Neurodiverse High",
    status: "Active",
    lastActive: "Today, 10:12 AM",
    avatarColor: "blue",
  },
  {
    id: "usr-10",
    name: "David Chen",
    email: "d.chen@harborview.edu",
    initials: "DC",
    role: "Educator",
    school: "Harborview Learning Center",
    status: "Pending Invite",
    lastActive: "Invited 2d ago",
    avatarColor: "purple",
  },
];

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>(initialUsersList);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedSchool, setSelectedSchool] = useState<string>("all");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeUserDetail, setActiveUserDetail] = useState<AdminUser | null>(null);

  // New user form state
  const [newUser, setNewUser] = useState({
    avatar: "",
    surname: "",
    firstname: "",
    email: "",
    password: "",
    school: "Harborview Learning Center",
    role: "School Admin" as "School Admin" | "Equilinks Admin" | "Educator",
    status: "Active" as "Active" | "Pending Invite" | "Inactive",
  });

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.school.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;
      if (selectedRole !== "all" && u.role !== selectedRole) return false;
      if (selectedSchool !== "all" && u.school !== selectedSchool) return false;
      return true;
    });
  }, [users, searchQuery, selectedRole, selectedSchool]);

  // Counts
  const counts = useMemo(() => {
    return {
      all: users.length,
      student: users.filter((u) => u.role === "Student").length,
      educator: users.filter((u) => u.role === "Educator").length,
      specialist: users.filter((u) => u.role === "Specialist").length,
      admin: users.filter((u) => u.role === "School Admin" || u.role === "Equilinks Admin").length,
    };
  }, [users]);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = `${newUser.firstname.trim()} ${newUser.surname.trim()}`.trim();
    if (!fullName || !newUser.email.trim()) return;

    const initials = `${newUser.firstname.trim()[0] || ""}${newUser.surname.trim()[0] || ""}`.toUpperCase() || "US";

    const colors: AdminUser["avatarColor"][] = ["green", "coral", "blue", "amber", "purple"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const created: AdminUser = {
      id: `usr-${Date.now()}`,
      name: fullName,
      email: newUser.email,
      initials,
      role: newUser.role,
      school: newUser.school,
      status: newUser.status,
      lastActive: "Just now",
      avatarColor: randomColor,
      avatar: newUser.avatar || undefined,
    };

    setUsers([created, ...users]);
    setIsAddModalOpen(false);
    setNewUser({
      avatar: "",
      surname: "",
      firstname: "",
      email: "",
      password: "",
      school: "Harborview Learning Center",
      role: "School Admin",
      status: "Active",
    });
  };

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
            <Link className="workspace-link" href="/admin">
              <Layers size={18} />
              <span>Overview</span>
            </Link>
            <Link className="workspace-link" href="/admin/schools">
              <Building2 size={18} />
              <span>Schools</span>
              <span className="nav-count">3</span>
            </Link>
            <Link className="workspace-link is-active" href="/admin/users">
              <Users size={18} />
              <span>Users</span>
              <span className="nav-count">{users.length}</span>
            </Link>
            <Link className="workspace-link" href="/admin/parents">
              <HeartHandshake size={18} />
              <span>Parents</span>
              <span className="nav-count">94</span>
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
            <span className="profile-avatar">
              MC
              <span className="profile-avatar-online" title="Online" />
            </span>
            <div className="profile-copy">
              <strong>Maya Chen</strong>
              <small>Administrator</small>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main" id="users-main">
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
              <Link href="/admin" style={{ color: "var(--admin-muted)" }}>
                Admin
              </Link>
              <b>/</b>
              <strong>Users</strong>
            </div>
          </div>

          <div className="topbar-actions">
            <div className="admin-search" role="search">
              <Search size={15} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search users"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{ border: "none", background: "transparent", cursor: "pointer", padding: 0 }}
                >
                  <X size={13} />
                </button>
              )}
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

        {/* Content Container */}
        <div className="admin-content" style={{ maxWidth: "1200px" }}>
          {/* Heading Banner */}
          <section className="dashboard-heading">
            <div>
              <p className="dashboard-date">USER DIRECTORY</p>
              <h1>Users</h1>
              <p className="dashboard-subtitle">
                Manage all registered learners, educators, specialists, and school administrators.
              </p>
            </div>
            <div className="heading-actions">
              <button
                className="add-student-button"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus size={16} />
                <span>Add user</span>
              </button>
            </div>
          </section>

          {/* Metric Summary Grid */}
          <section className="metric-grid" aria-label="User metrics">
            <article className="metric-card">
              <div className="metric-top">
                <span>Total Users</span>
                <span className="metric-icon" style={{ background: "var(--sage-soft)", color: "var(--sage)" }}>
                  <Users size={17} />
                </span>
              </div>
              <div className="metric-number">{users.length}</div>
              <div className="metric-footer">
                <span className="metric-up">Active</span>
                <span>across 3 schools</span>
              </div>
            </article>

            <article className="metric-card">
              <div className="metric-top">
                <span>Students / Learners</span>
                <span className="metric-icon" style={{ background: "var(--iris-soft)", color: "var(--iris)" }}>
                  <GraduationCap size={17} />
                </span>
              </div>
              <div className="metric-number">{counts.student}</div>
              <div className="metric-footer">
                <span className="metric-up">Enrolled</span>
                <span>learning accounts</span>
              </div>
            </article>

            <article className="metric-card">
              <div className="metric-top">
                <span>Educators & Staff</span>
                <span className="metric-icon" style={{ background: "var(--amber-soft)", color: "var(--amber)" }}>
                  <UserCheck size={17} />
                </span>
              </div>
              <div className="metric-number">{counts.educator + counts.specialist}</div>
              <div className="metric-footer">
                <span className="metric-up">Teaching</span>
                <span>teachers & OT/SLP</span>
              </div>
            </article>

            <article className="metric-card">
              <div className="metric-top">
                <span>School Admins</span>
                <span className="metric-icon" style={{ background: "var(--coral-soft)", color: "var(--coral)" }}>
                  <Shield size={17} />
                </span>
              </div>
              <div className="metric-number">{counts.admin}</div>
              <div className="metric-footer">
                <span className="metric-up">Verified</span>
                <span>administrative staff</span>
              </div>
            </article>
          </section>

          {/* Filter & Controls Bar */}
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
                className={`filter-tab ${selectedRole === "all" ? "is-active" : ""}`}
                onClick={() => setSelectedRole("all")}
              >
                All ({counts.all})
              </button>
              <button
                className={`filter-tab ${selectedRole === "Student" ? "is-active" : ""}`}
                onClick={() => setSelectedRole("Student")}
              >
                Students ({counts.student})
              </button>
              <button
                className={`filter-tab ${selectedRole === "Educator" ? "is-active" : ""}`}
                onClick={() => setSelectedRole("Educator")}
              >
                Educators ({counts.educator})
              </button>
              <button
                className={`filter-tab ${selectedRole === "Specialist" ? "is-active" : ""}`}
                onClick={() => setSelectedRole("Specialist")}
              >
                Specialists ({counts.specialist})
              </button>
              <button
                className={`filter-tab ${selectedRole === "School Admin" ? "is-active" : ""}`}
                onClick={() => setSelectedRole("School Admin")}
              >
                Admins ({counts.admin})
              </button>
            </div>

            {/* School Filter Dropdown */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "12px", color: "var(--admin-muted)" }}>Campus:</span>
              <select
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--admin-border)",
                  background: "var(--admin-surface)",
                  fontSize: "12px",
                  color: "var(--admin-ink)",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="all">All Campuses</option>
                <option value="Harborview Learning Center">Harborview</option>
                <option value="Cascade Inclusive Academy">Cascade</option>
                <option value="Sunridge Neurodiverse High">Sunridge</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <section className="dashboard-panel" style={{ padding: "0", overflow: "hidden" }}>
            <div className="student-table-wrap" style={{ border: "none" }}>
              <table className="student-table">
                <thead>
                  <tr>
                    <th scope="col">USER</th>
                    <th scope="col">ROLE</th>
                    <th scope="col">SCHOOL</th>
                    <th scope="col">STATUS</th>
                    <th scope="col">LAST ACTIVE</th>
                    <th scope="col" style={{ textAlign: "right" }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "36px", color: "var(--admin-muted)" }}>
                        No users found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        onClick={() => setActiveUserDetail(user)}
                        style={{ cursor: "pointer" }}
                      >
                        {/* User Cell */}
                        <td>
                          <div className="student-cell">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                style={{
                                  width: "36px",
                                  height: "36px",
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                }}
                              />
                            ) : (
                              <span className={`student-avatar avatar-${user.avatarColor}`}>
                                {user.initials}
                              </span>
                            )}
                            <div className="student-info-text">
                              <strong>{user.name}</strong>
                              <small>{user.email}</small>
                            </div>
                          </div>
                        </td>

                        {/* Role Cell */}
                        <td>
                          <span
                            style={{
                              fontSize: "11.5px",
                              fontWeight: 600,
                              padding: "3px 8px",
                              borderRadius: "4px",
                              background:
                                user.role === "Student"
                                  ? "var(--sage-soft)"
                                  : user.role === "Educator"
                                  ? "var(--iris-soft)"
                                  : user.role === "Specialist"
                                  ? "var(--amber-soft)"
                                  : "var(--coral-soft)",
                              color:
                                user.role === "Student"
                                  ? "var(--sage)"
                                  : user.role === "Educator"
                                  ? "var(--iris)"
                                  : user.role === "Specialist"
                                  ? "var(--amber)"
                                  : "var(--coral)",
                            }}
                          >
                            {user.role}
                          </span>
                        </td>

                        {/* School Cell */}
                        <td style={{ fontSize: "12.5px", color: "var(--admin-ink-secondary)" }}>
                          {user.school}
                        </td>

                        {/* Status Cell */}
                        <td>
                          <span
                            className={`status-pill ${
                              user.status === "Active"
                                ? "status-green"
                                : user.status === "Pending Invite"
                                ? "status-amber"
                                : "status-coral"
                            }`}
                          >
                            <i />
                            {user.status}
                          </span>
                        </td>

                        {/* Last Active */}
                        <td className="update-time">{user.lastActive}</td>

                        {/* Actions */}
                        <td style={{ textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                          <button
                            className="row-action-btn"
                            onClick={() => setActiveUserDetail(user)}
                          >
                            Details
                          </button>
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
            <span>Equilinks User Management</span>
            <span>Total: {users.length} registered accounts</span>
          </footer>
        </div>
      </main>

      {/* Add User Modal */}
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
              <h3>Create User Account</h3>
              <button
                className="drawer-close"
                onClick={() => setIsAddModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={handleCreateUser}
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
                {/* Centered Avatar Upload (centered across modal) */}
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
                    htmlFor="user-avatar-input"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100px",
                      height: "100px",
                      borderRadius: "50%",
                      border: "2px dashed var(--admin-border-strong)",
                      background: newUser.avatar
                        ? `url(${newUser.avatar}) center/cover no-repeat`
                        : "var(--admin-surface-subtle)",
                      cursor: "pointer",
                      transition: "all var(--transition-fast)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                    title="Click to upload profile avatar"
                  >
                    {!newUser.avatar ? (
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
                      id="user-avatar-input"
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setNewUser((prev) => ({ ...prev, avatar: reader.result as string }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  <span style={{ fontSize: "12px", color: "var(--admin-muted)" }}>
                    Click to upload user avatar
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
                    <label htmlFor="user-surname">Surname</label>
                    <input
                      id="user-surname"
                      type="text"
                      required
                      placeholder="e.g. Ellis"
                      value={newUser.surname}
                      onChange={(e) => setNewUser({ ...newUser, surname: e.target.value })}
                    />
                  </div>

                  {/* Firstname */}
                  <div className="form-group">
                    <label htmlFor="user-firstname">Firstname</label>
                    <input
                      id="user-firstname"
                      type="text"
                      required
                      placeholder="e.g. Jordan"
                      value={newUser.firstname}
                      onChange={(e) => setNewUser({ ...newUser, firstname: e.target.value })}
                    />
                  </div>

                  {/* Email */}
                  <div className="form-group">
                    <label htmlFor="user-email">Email Address</label>
                    <input
                      id="user-email"
                      type="email"
                      required
                      placeholder="user@school.edu"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    />
                  </div>

                  {/* Password */}
                  <div className="form-group">
                    <label htmlFor="user-password">Password</label>
                    <input
                      id="user-password"
                      type="password"
                      required
                      placeholder="Create temporary password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    />
                  </div>

                  {/* Select School */}
                  <div className="form-group">
                    <label htmlFor="user-school">Select School</label>
                    <select
                      id="user-school"
                      value={newUser.school}
                      onChange={(e) => setNewUser({ ...newUser, school: e.target.value })}
                    >
                      <option value="Harborview Learning Center">Harborview Learning Center</option>
                      <option value="Cascade Inclusive Academy">Cascade Inclusive Academy</option>
                      <option value="Sunridge Neurodiverse High">Sunridge Neurodiverse High</option>
                    </select>
                  </div>

                  {/* Select Role */}
                  <div className="form-group">
                    <label htmlFor="user-role">Select Role</label>
                    <select
                      id="user-role"
                      value={newUser.role}
                      onChange={(e) =>
                        setNewUser({
                          ...newUser,
                          role: e.target.value as "School Admin" | "Equilinks Admin" | "Educator",
                        })
                      }
                    >
                      <option value="School Admin">School Admin</option>
                      <option value="Equilinks Admin">Equilinks Admin</option>
                      <option value="Educator">Educator</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div className="form-group" style={{ gridColumn: "span 1" }}>
                    <label htmlFor="user-status">Status</label>
                    <select
                      id="user-status"
                      value={newUser.status}
                      onChange={(e) =>
                        setNewUser({
                          ...newUser,
                          status: e.target.value as "Active" | "Pending Invite" | "Inactive",
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
                  <CheckCircle2 size={16} /> Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {activeUserDetail && (
        <div className="modal-backdrop" onClick={() => setActiveUserDetail(null)}>
          <div className="modal-card" style={{ maxWidth: "480px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {activeUserDetail.avatar ? (
                  <img
                    src={activeUserDetail.avatar}
                    alt={activeUserDetail.name}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                  />
                ) : (
                  <span className={`student-avatar avatar-${activeUserDetail.avatarColor}`}>
                    {activeUserDetail.initials}
                  </span>
                )}
                <div>
                  <h3 style={{ margin: 0 }}>{activeUserDetail.name}</h3>
                  <small style={{ color: "var(--admin-muted)" }}>{activeUserDetail.email}</small>
                </div>
              </div>
              <button
                className="drawer-close"
                onClick={() => setActiveUserDetail(null)}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ gap: "14px" }}>
              <div className="profile-card-grid">
                <div className="profile-info-box">
                  <small>Role</small>
                  <strong>{activeUserDetail.role}</strong>
                </div>
                <div className="profile-info-box">
                  <small>Status</small>
                  <strong>{activeUserDetail.status}</strong>
                </div>
                <div className="profile-info-box">
                  <small>Campus</small>
                  <strong style={{ fontSize: "12px" }}>{activeUserDetail.school}</strong>
                </div>
                <div className="profile-info-box">
                  <small>Last Active</small>
                  <strong style={{ fontSize: "12px" }}>{activeUserDetail.lastActive}</strong>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="secondary-action-button"
                onClick={() => setActiveUserDetail(null)}
              >
                Close
              </button>
              <button
                className="add-student-button"
                onClick={() => {
                  alert(`Password reset instructions sent to ${activeUserDetail.email}`);
                  setActiveUserDetail(null);
                }}
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
