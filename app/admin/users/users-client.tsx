"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AdminUser } from "@/lib/admin-users";
import { signOut } from "@/app/login/actions";
import { ProfileAvatar, TopbarAvatar } from "../profile-avatar";
import type { SidebarProfile } from "@/lib/sidebar-profile";
import { useSuperAdminShell } from "@/app/super-admin/shell";
import { useAdminShell } from "../shell";
import { createAdminUser, deleteAdminUser, updateAdminUser } from "./actions";
import { readImageFile } from "@/lib/avatar";
import "../admin.css";
import {
  Layers,
  Building2,
  Users,
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

function roleTone(role: AdminUser["role"]) {
  if (role === "Student") return { background: "var(--sage-soft)", color: "var(--sage)" };
  if (role === "Educator") return { background: "var(--iris-soft)", color: "var(--iris)" };
  if (role === "Specialist") return { background: "var(--amber-soft)", color: "var(--amber)" };
  if (role === "Parent") return { background: "#f2e7f8", color: "#5a2e6f" };
  return { background: "var(--coral-soft)", color: "var(--coral)" };
}

const emptyUserForm = {
  avatar: "",
  surname: "",
  firstname: "",
  email: "",
  password: "",
  role: "School Admin" as AdminUser["role"],
  status: "Active" as "Active" | "Pending Invite" | "Inactive",
};

export default function UsersClient({
  initialUsers,
  schools,
  workspace = "admin",
  profile,
}: {
  initialUsers: AdminUser[];
  schools: string[];
  workspace?: "admin" | "super-admin";
  profile?: SidebarProfile;
}) {
  const router = useRouter();
  const shell = useSuperAdminShell() ?? useAdminShell();
  const schoolChoices = schools;
  const directoryRoot = workspace === "super-admin" ? "/super-admin" : "/admin";
  const account: SidebarProfile = profile ?? shell?.profile ?? {
    name: "",
    initials: "",
    roleLabel: workspace === "super-admin" ? "Super Admin" : "Equilinks Admin",
  };
  const [users, setUsers] = useState<AdminUser[]>(
    workspace === "super-admin" ? initialUsers : initialUsers.filter((user) => user.role !== "Super Admin"),
  );
  const directoryUsers = users.filter((user) => workspace === "super-admin" || user.role !== "Super Admin");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedSchool, setSelectedSchool] = useState<string>("all");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [activeUserDetail, setActiveUserDetail] = useState<AdminUser | null>(null);

  const [newUser, setNewUser] = useState({
    ...emptyUserForm,
    school: schoolChoices[0] ?? "",
  });
  const formSchoolOptions =
    newUser.school && !schoolChoices.includes(newUser.school)
      ? [newUser.school, ...schoolChoices]
      : schoolChoices;

  // Filtered users
  const filteredUsers = useMemo(() => {
    return directoryUsers.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.school.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;
      if (
        selectedRole !== "all" &&
        u.role !== selectedRole &&
        !(selectedRole === "School Admin" && u.role === "Super Admin")
      ) {
        return false;
      }
      if (selectedSchool !== "all" && u.school !== selectedSchool) return false;
      return true;
    });
  }, [directoryUsers, searchQuery, selectedRole, selectedSchool]);

  // Counts
  const counts = useMemo(() => {
    return {
      all: directoryUsers.length,
      student: directoryUsers.filter((u) => u.role === "Student").length,
      parent: directoryUsers.filter((u) => u.role === "Parent").length,
      educator: directoryUsers.filter((u) => u.role === "Educator").length,
      specialist: directoryUsers.filter((u) => u.role === "Specialist").length,
      admin: directoryUsers.filter(
        (u) => u.role === "School Admin" || u.role === "Equilinks Admin" || u.role === "Super Admin",
      ).length,
    };
  }, [directoryUsers]);

  const campusNames = useMemo(() => {
    return Array.from(new Set(directoryUsers.map((user) => user.school).filter((school) => school && school !== "Unassigned"))).sort();
  }, [directoryUsers]);

  const resetUserForm = () => {
    setNewUser({
      ...emptyUserForm,
      school: schoolChoices[0] ?? "",
    });
    setFormError(null);
    setEditingUser(null);
  };

  const openCreateUser = () => {
    resetUserForm();
    setIsAddModalOpen(true);
  };

  const openEditUser = (user: AdminUser) => {
    setEditingUser(user);
    setNewUser({
      avatar: user.avatar ?? "",
      surname: user.surname,
      firstname: user.firstname,
      email: user.email,
      password: "",
      school: user.school,
      role: user.role,
      status: user.status,
    });
    setFormError(null);
    setActiveUserDetail(null);
    setIsAddModalOpen(true);
  };

  const closeUserForm = () => {
    if (isSavingUser) return;
    setIsAddModalOpen(false);
    setFormError(null);
    setEditingUser(null);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingUser) return;

    setFormError(null);
    setIsSavingUser(true);

    const payload = {
      firstname: newUser.firstname,
      surname: newUser.surname,
      email: newUser.email,
      school: newUser.school,
      role: newUser.role,
      status: newUser.status,
      avatar: newUser.avatar,
    };

    try {
      const result = editingUser
        ? await updateAdminUser({
            id: editingUser.id,
            ...payload,
            password: newUser.password,
          })
        : await createAdminUser({
            ...payload,
            password: newUser.password,
          });

      if (!result.ok) {
        setFormError(result.error);
        return;
      }

      setUsers((current) =>
        editingUser
          ? current.map((user) => (user.id === result.user.id ? result.user : user))
          : [result.user, ...current.filter((user) => user.id !== result.user.id)],
      );
      setIsAddModalOpen(false);
      resetUserForm();
      router.refresh();
    } catch {
      setFormError("Could not save this user. Try again.");
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete || isDeletingUser) return;

    setDeleteError(null);
    setIsDeletingUser(true);

    try {
      const result = await deleteAdminUser(userToDelete.id);
      if (!result.ok) {
        setDeleteError(result.error);
        return;
      }

      setUsers((current) => current.filter((user) => user.id !== userToDelete.id));
      setActiveUserDetail((current) => (current?.id === userToDelete.id ? null : current));
      setUserToDelete(null);
      router.refresh();
    } catch {
      setDeleteError("Could not delete this user. Try again.");
    } finally {
      setIsDeletingUser(false);
    }
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
            <Link className="workspace-link" href={directoryRoot}>
              <Layers size={18} />
              <span>Overview</span>
            </Link>
            <Link className="workspace-link" href={`${directoryRoot}/schools`}>
              <Building2 size={18} />
              <span>Schools</span>
              <span className="nav-count">3</span>
            </Link>
            <Link className="workspace-link is-active" href={`${directoryRoot}/users`}>
              <Users size={18} />
              <span>Users</span>
              <span className="nav-count">{directoryUsers.length}</span>
            </Link>
            <Link className="workspace-link" href={workspace === "super-admin" ? `${directoryRoot}/settings` : `${directoryRoot}#settings`}>
              <Settings size={18} />
              <span>Settings</span>
            </Link>
          </nav>
        </div>

        {/* Sidebar Footer & User Profile */}
        <div className="sidebar-bottom">
          <div className="sidebar-profile" role="button" tabIndex={0}>
            <ProfileAvatar profile={account} />
            <div className="profile-copy">
              <strong>{account.name}</strong>
              <small>{account.roleLabel}</small>
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
      <main className="admin-main" id="users-main">
        {/* Simple Topbar */}
        <header className="admin-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              className="icon-button mobile-menu-btn"
              style={{ display: "none" }}
              onClick={() => (shell ? shell.openMenu() : setMobileSidebarOpen(!mobileSidebarOpen))}
              aria-label="Toggle navigation menu"
            >
              <Menu size={18} />
            </button>
            <div className="breadcrumb">
              <Link href={directoryRoot} style={{ color: "var(--admin-muted)" }}>
                {workspace === "super-admin" ? "Super Admin" : "Admin"}
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
            <TopbarAvatar profile={account} />
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
                onClick={openCreateUser}
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
              <div className="metric-number">{directoryUsers.length}</div>
              <div className="metric-footer">
                <span className="metric-up">Active</span>
                <span>across {campusNames.length} {campusNames.length === 1 ? "school" : "schools"}</span>
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
                className={`filter-tab ${selectedRole === "Parent" ? "is-active" : ""}`}
                onClick={() => setSelectedRole("Parent")}
              >
                Parents ({counts.parent})
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
                {campusNames.map((school) => (
                  <option key={school} value={school}>
                    {school}
                  </option>
                ))}
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
                              background: roleTone(user.role).background,
                              color: roleTone(user.role).color,
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
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            <button
                              className="row-action-btn"
                              onClick={() => setActiveUserDetail(user)}
                            >
                              Details
                            </button>
                            <button className="row-action-btn" onClick={() => openEditUser(user)}>
                              Edit
                            </button>
                            <button
                              className="row-action-btn"
                              style={{ color: "var(--coral)" }}
                              onClick={() => {
                                setDeleteError(null);
                                setUserToDelete(user);
                              }}
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

          {/* Minimal Footer */}
          <footer className="dashboard-footer" style={{ borderTop: "1px solid var(--admin-border)", paddingTop: "18px" }}>
            <span>Equilinks User Management</span>
            <span>Total: {directoryUsers.length} registered accounts</span>
          </footer>
        </div>
      </main>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={closeUserForm}>
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
              <h3>{editingUser ? "Edit User Account" : "Create User Account"}</h3>
              <button
                className="drawer-close"
                onClick={closeUserForm}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={handleSaveUser}
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
                        e.target.value = "";
                        if (!file) return;
                        void readImageFile(file).then((avatar) => {
                          setNewUser((prev) => ({ ...prev, avatar }));
                        });
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

                  {editingUser?.role !== "Parent" && (
                    <div className="form-group">
                      <label htmlFor="user-password">{editingUser ? "New password" : "Password"}</label>
                      <input
                        id="user-password"
                        type="password"
                        required={!editingUser}
                        placeholder={editingUser ? "Leave blank to keep the current password" : "Create temporary password"}
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      />
                    </div>
                  )}

                  {/* Select School */}
                  <div className="form-group">
                    <label htmlFor="user-school">Select School</label>
                    <select
                      id="user-school"
                      value={newUser.school}
                      onChange={(e) => setNewUser({ ...newUser, school: e.target.value })}
                    >
                      {formSchoolOptions.length === 0 ? (
                        <option value="">No schools yet</option>
                      ) : (
                        formSchoolOptions.map((school) => (
                          <option key={school} value={school}>
                            {school}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Select Role */}
                  <div className="form-group">
                    <label htmlFor="user-role">Select Role</label>
                    <select
                      id="user-role"
                      value={newUser.role}
                      disabled={editingUser?.role === "Parent"}
                      onChange={(e) =>
                        setNewUser({
                          ...newUser,
                          role: e.target.value as AdminUser["role"],
                        })
                      }
                    >
                      {editingUser?.role === "Parent" ? (
                        <option value="Parent">Parent</option>
                      ) : (
                        <>
                          <option value="School Admin">School Admin</option>
                          <option value="Equilinks Admin">Equilinks Admin</option>
                          {workspace === "super-admin" ? <option value="Super Admin">Super Admin</option> : null}
                          <option value="Educator">Educator</option>
                          <option value="Specialist">Specialist</option>
                          <option value="Student">Student</option>
                        </>
                      )}
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

              {formError && (
                <p role="alert" style={{ margin: "0 24px 12px", color: "var(--coral)", fontSize: "13px" }}>
                  {formError}
                </p>
              )}

              <div className="modal-footer" style={{ flexShrink: 0 }}>
                <button
                  type="button"
                  className="secondary-action-button"
                  onClick={closeUserForm}
                  disabled={isSavingUser}
                >
                  Cancel
                </button>
                <button type="submit" className="add-student-button" disabled={isSavingUser}>
                  <CheckCircle2 size={16} />{" "}
                  {isSavingUser ? "Saving…" : editingUser ? "Save changes" : "Create User"}
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
              <button className="secondary-action-button" onClick={() => openEditUser(activeUserDetail)}>
                Edit
              </button>
              <button
                className="add-student-button"
                style={{ background: "var(--coral)" }}
                onClick={() => {
                  setDeleteError(null);
                  setUserToDelete(activeUserDetail);
                  setActiveUserDetail(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {userToDelete && (
        <div
          className="modal-backdrop"
          onClick={() => {
            if (!isDeletingUser) setUserToDelete(null);
          }}
        >
          <div className="modal-card" style={{ maxWidth: "440px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete user</h3>
              <button
                className="drawer-close"
                onClick={() => {
                  if (!isDeletingUser) setUserToDelete(null);
                }}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ gap: "10px" }}>
              <p style={{ margin: 0, fontSize: "14px", color: "var(--admin-ink)" }}>
                Delete <strong>{userToDelete.name}</strong>? This removes the account from the directory.
              </p>
              {deleteError && (
                <p role="alert" style={{ margin: 0, color: "var(--coral)", fontSize: "13px" }}>
                  {deleteError}
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="secondary-action-button"
                onClick={() => setUserToDelete(null)}
                disabled={isDeletingUser}
              >
                Cancel
              </button>
              <button
                type="button"
                className="add-student-button"
                style={{ background: "var(--coral)" }}
                onClick={handleDeleteUser}
                disabled={isDeletingUser}
              >
                {isDeletingUser ? "Deleting…" : "Delete user"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
