"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Layers, Settings, Users } from "lucide-react";
import { signOut } from "@/app/login/actions";
import { ProfileAvatar } from "../admin/profile-avatar";
import type { SidebarProfile } from "@/lib/sidebar-profile";
import "../admin/admin.css";

type SuperAdminShellValue = {
  profile: SidebarProfile | null;
  setProfile: (profile: SidebarProfile) => void;
  openMenu: () => void;
};

const emptyProfile: SidebarProfile = {
  name: "",
  initials: "",
  roleLabel: "Super Admin",
};

const SuperAdminShellContext = createContext<SuperAdminShellValue | null>(null);

export function useSuperAdminShell() {
  return useContext(SuperAdminShellContext);
}

export function ProfileSync({ profile }: { profile: SidebarProfile }) {
  const setProfile = useSuperAdminShell()?.setProfile;

  useEffect(() => {
    setProfile?.(profile);
  }, [setProfile, profile]);

  return null;
}

export function WorkspaceContentFallback({ title }: { title: string }) {
  return (
    <main className="admin-main">
      <header className="admin-topbar">
        <div className="breadcrumb">
          <span>Super Admin</span>
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

export function SuperAdminShell({ children }: { children: React.ReactNode }) {
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
    <SuperAdminShellContext.Provider value={{ profile, setProfile, openMenu }}>
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
              <Link className={linkClass("/super-admin", true)} href="/super-admin">
                <Layers size={18} />
                <span>Overview</span>
              </Link>
              <Link className={linkClass("/super-admin/schools")} href="/super-admin/schools">
                <Building2 size={18} />
                <span>Schools</span>
              </Link>
              <Link className={linkClass("/super-admin/users")} href="/super-admin/users">
                <Users size={18} />
                <span>Users</span>
              </Link>
              <Link className={linkClass("/super-admin/settings")} href="/super-admin/settings">
                <Settings size={18} />
                <span>Settings</span>
              </Link>
            </nav>
          </div>
          <div className="sidebar-bottom">
            <div className="sidebar-profile">
              <ProfileAvatar profile={shownProfile} />
              <div className="profile-copy">
                <strong>{shownProfile.name || "Super Admin"}</strong>
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
    </SuperAdminShellContext.Provider>
  );
}
