"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Layers, Settings, Users } from "lucide-react";
import { signOut } from "@/app/login/actions";
import { ProfileAvatar } from "./profile-avatar";
import type { SidebarProfile } from "@/lib/sidebar-profile";
import "./admin.css";

type AdminShellValue = {
  profile: SidebarProfile | null;
  setProfile: (profile: SidebarProfile) => void;
  openMenu: () => void;
};

const emptyProfile: SidebarProfile = {
  name: "",
  initials: "",
  roleLabel: "Equilinks Admin",
};

const AdminShellContext = createContext<AdminShellValue | null>(null);

export function useAdminShell() {
  return useContext(AdminShellContext);
}

export function ProfileSync({ profile }: { profile: SidebarProfile }) {
  const setProfile = useAdminShell()?.setProfile;

  useEffect(() => {
    setProfile?.(profile);
  }, [setProfile, profile]);

  return null;
}

export function AdminContentFallback({ title }: { title: string }) {
  return (
    <main className="admin-main">
      <header className="admin-topbar">
        <div className="breadcrumb">
          <span>Admin</span>
          <b>/</b>
          <strong>{title}</strong>
        </div>
      </header>
      <div className="admin-content">
        <p className="dashboard-subtitle">Loading {title.toLowerCase()}…</p>
      </div>
    </main>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<SidebarProfile | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const shownProfile = profile ?? emptyProfile;

  const openMenu = () => setMobileSidebarOpen(true);
  const closeMenu = () => setMobileSidebarOpen(false);

  const linkClass = (href: string, exact = false) => {
    const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
    return `workspace-link${active ? " is-active" : ""}`;
  };

  return (
    <AdminShellContext.Provider value={{ profile, setProfile, openMenu }}>
      <div className="admin-shell">
        {mobileSidebarOpen ? (
          <div className="drawer-backdrop" style={{ zIndex: 39 }} onClick={closeMenu} aria-hidden="true" />
        ) : null}
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
            <nav className="workspace-nav" aria-label="Primary Navigation" onClick={closeMenu}>
              <Link className={linkClass("/admin", true)} href="/admin">
                <Layers size={18} />
                <span>Overview</span>
              </Link>
              <Link className={linkClass("/admin/schools")} href="/admin/schools">
                <Building2 size={18} />
                <span>Schools</span>
              </Link>
              <Link className={linkClass("/admin/users")} href="/admin/users">
                <Users size={18} />
                <span>Users</span>
              </Link>
              <Link className="workspace-link" href="/admin#settings">
                <Settings size={18} />
                <span>Settings</span>
              </Link>
            </nav>
          </div>
          <div className="sidebar-bottom">
            <div className="sidebar-profile">
              <ProfileAvatar profile={shownProfile} />
              <div className="profile-copy">
                <strong>{shownProfile.name || "Equilinks Admin"}</strong>
                <small>{shownProfile.roleLabel}</small>
              </div>
            </div>
            <form action={signOut}>
              <button className="sign-out-button" type="submit">
                Sign out
              </button>
            </form>
          </div>
        </aside>
        {children}
      </div>
    </AdminShellContext.Provider>
  );
}
