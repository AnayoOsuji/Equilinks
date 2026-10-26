"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/app/login/actions";
import { ProfileAvatar, TopbarAvatar } from "../../admin/profile-avatar";
import type { SidebarProfile } from "@/lib/sidebar-profile";
import { useSuperAdminShell } from "../shell";
import { updateSuperAdminPassword, updateSuperAdminProfile, type SuperAdminAccount } from "./actions";
import { readImageFile } from "@/lib/avatar";
import "../../admin/admin.css";
import {
  Layers,
  Building2,
  Users,
  Settings,
  Search,
  Bell,
  CheckCircle2,
  Menu,
  UploadCloud,
  X,
} from "lucide-react";

export default function SuperAdminSettings({
  profile: initialProfile,
  account: initialAccount,
}: {
  profile: SidebarProfile;
  account: SuperAdminAccount;
}) {
  const router = useRouter();
  const shell = useSuperAdminShell();
  const profile = shell?.profile ?? initialProfile;
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [details, setDetails] = useState(initialAccount);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [detailsMessage, setDetailsMessage] = useState<string | null>(null);
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const saveDetails = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSavingDetails) return;
    setDetailsError(null);
    setDetailsMessage(null);
    setIsSavingDetails(true);
    try {
      const result = await updateSuperAdminProfile(details);
      if (!result.ok) {
        setDetailsError(result.error);
        return;
      }
      setDetails(result.account);
      shell?.setProfile(result.profile);
      setDetailsMessage("Personal details saved.");
      router.refresh();
    } catch {
      setDetailsError("Could not save your details. Try again.");
    } finally {
      setIsSavingDetails(false);
    }
  };

  const savePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSavingPassword) return;
    setPasswordError(null);
    setPasswordMessage(null);
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }
    setIsSavingPassword(true);
    try {
      const result = await updateSuperAdminPassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      if (!result.ok) {
        setPasswordError(result.error);
        return;
      }
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordMessage("Password updated.");
    } catch {
      setPasswordError("Could not update your password. Try again.");
    } finally {
      setIsSavingPassword(false);
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
      <aside className={`admin-sidebar ${mobileSidebarOpen ? "mobile-open" : ""}`} aria-label="Sidebar Navigation">
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
            <Link className="workspace-link" href="/super-admin">
              <Layers size={18} />
              <span>Overview</span>
            </Link>
            <Link className="workspace-link" href="/super-admin/schools">
              <Building2 size={18} />
              <span>Schools</span>
            </Link>
            <Link className="workspace-link" href="/super-admin/users">
              <Users size={18} />
              <span>Users</span>
            </Link>
            <Link className="workspace-link is-active" href="/super-admin/settings">
              <Settings size={18} />
              <span>Settings</span>
            </Link>
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-profile">
            <ProfileAvatar profile={profile} />
            <div className="profile-copy">
              <strong>{profile.name}</strong>
              <small>{profile.roleLabel}</small>
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

      <main className="admin-main">
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
              <Link href="/super-admin" style={{ color: "var(--admin-muted)" }}>
                Super Admin
              </Link>
              <b>/</b>
              <strong>Settings</strong>
            </div>
          </div>
          <div className="topbar-actions">
            <div className="admin-search" role="search">
              <Search size={15} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                aria-label="Quick Search"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{ border: "none", background: "transparent", cursor: "pointer", padding: 0 }}
                >
                  <X size={13} />
                </button>
              ) : null}
            </div>
            <button className="icon-button notification-button" aria-label="Notifications">
              <span className="notification-dot" />
              <Bell size={18} />
            </button>
            <TopbarAvatar profile={profile} />
          </div>
        </header>

        <div className="admin-content" style={{ maxWidth: "860px" }}>
          <section className="dashboard-heading">
            <div>
              <p className="dashboard-date">ACCOUNT</p>
              <h1>Settings</h1>
              <p className="dashboard-subtitle">Update the name, photo, and password for your super admin account.</p>
            </div>
          </section>

          <section className="dashboard-panel">
            <div className="panel-heading">
              <div>
                <h2>Personal details</h2>
                <p>This name and photo appear in the super admin sidebar.</p>
              </div>
            </div>

            <form onSubmit={saveDetails} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "18px", flexWrap: "wrap" }}>
                <label
                  htmlFor="settings-avatar"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "88px",
                    height: "88px",
                    borderRadius: "50%",
                    border: "2px dashed var(--admin-border-strong)",
                    background: details.avatar
                      ? `url(${details.avatar}) center/cover no-repeat`
                      : "var(--admin-surface-subtle)",
                    cursor: "pointer",
                    overflow: "hidden",
                    position: "relative",
                    flexShrink: 0,
                  }}
                >
                  {details.avatar ? (
                    <span
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(21, 39, 35, 0.45)",
                        color: "#fff",
                        fontSize: "11px",
                        fontWeight: 700,
                      }}
                    >
                      Change
                    </span>
                  ) : (
                    <UploadCloud size={22} color="var(--admin-muted)" />
                  )}
                  <input
                    id="settings-avatar"
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      event.target.value = "";
                      if (!file) return;
                      void readImageFile(file).then((avatar) => {
                        setDetails((current) => ({ ...current, avatar }));
                        setDetailsMessage(null);
                      });
                    }}
                  />
                </label>
                <div>
                  <strong style={{ display: "block", color: "var(--admin-ink)" }}>{profile.name}</strong>
                  <small style={{ color: "var(--admin-muted)" }}>{profile.roleLabel}</small>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="settings-firstname">First name</label>
                  <input
                    id="settings-firstname"
                    value={details.firstname}
                    required
                    onChange={(event) => setDetails({ ...details, firstname: event.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="settings-surname">Surname</label>
                  <input
                    id="settings-surname"
                    value={details.surname}
                    required
                    onChange={(event) => setDetails({ ...details, surname: event.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="settings-email">Email</label>
                <input
                  id="settings-email"
                  type="email"
                  required
                  value={details.email}
                  onChange={(event) => setDetails({ ...details, email: event.target.value })}
                />
              </div>

              {detailsError ? (
                <p role="alert" style={{ margin: 0, color: "var(--coral)", fontSize: "13px" }}>
                  {detailsError}
                </p>
              ) : null}
              {detailsMessage ? (
                <p role="status" style={{ margin: 0, color: "var(--sage)", fontSize: "13px" }}>
                  {detailsMessage}
                </p>
              ) : null}

              <div>
                <button className="add-student-button" type="submit" disabled={isSavingDetails}>
                  <CheckCircle2 size={16} />
                  {isSavingDetails ? "Saving…" : "Save details"}
                </button>
              </div>
            </form>
          </section>

          <section className="dashboard-panel">
            <div className="panel-heading">
              <div>
                <h2>Update password</h2>
                <p>Enter your current password, then choose a new one.</p>
              </div>
            </div>

            <form onSubmit={savePassword} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div className="form-group">
                <label htmlFor="settings-current-password">Current password</label>
                <input
                  id="settings-current-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={passwords.currentPassword}
                  onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="settings-new-password">New password</label>
                  <input
                    id="settings-new-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={passwords.newPassword}
                    onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="settings-confirm-password">Confirm new password</label>
                  <input
                    id="settings-confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={passwords.confirmPassword}
                    onChange={(event) => setPasswords({ ...passwords, confirmPassword: event.target.value })}
                  />
                </div>
              </div>

              {passwordError ? (
                <p role="alert" style={{ margin: 0, color: "var(--coral)", fontSize: "13px" }}>
                  {passwordError}
                </p>
              ) : null}
              {passwordMessage ? (
                <p role="status" style={{ margin: 0, color: "var(--sage)", fontSize: "13px" }}>
                  {passwordMessage}
                </p>
              ) : null}

              <div>
                <button className="add-student-button" type="submit" disabled={isSavingPassword}>
                  <CheckCircle2 size={16} />
                  {isSavingPassword ? "Updating…" : "Update password"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
