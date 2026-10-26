"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { Home, Menu } from "lucide-react";
import { signOut } from "@/app/login/actions";
import { ProfileAvatar, TopbarAvatar } from "../admin/profile-avatar";
import type { SidebarProfile } from "@/lib/sidebar-profile";
import "../admin/admin.css";
import "../educator/educator.css";
import "./parents.css";

type ParentShellValue = {
  setProfile: (profile: SidebarProfile) => void;
  setSchoolName: (name: string) => void;
};

const emptyProfile: SidebarProfile = { name: "", initials: "", roleLabel: "Parent" };

const ParentShellContext = createContext<ParentShellValue | null>(null);

export function ParentProfileSync({ profile, schoolName }: { profile: SidebarProfile; schoolName: string }) {
  const context = useContext(ParentShellContext);
  const setProfile = context?.setProfile;
  const setSchoolName = context?.setSchoolName;

  useEffect(() => {
    setProfile?.(profile);
    setSchoolName?.(schoolName);
  }, [setProfile, setSchoolName, profile, schoolName]);

  return null;
}

export function ParentShell({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<SidebarProfile | null>(null);
  const [schoolName, setSchoolName] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const shownProfile = profile ?? emptyProfile;

  return (
    <ParentShellContext.Provider value={{ setProfile, setSchoolName }}>
      <div className="admin-shell">
        {mobileSidebarOpen ? (
          <div
            className="drawer-backdrop"
            style={{ zIndex: 39 }}
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden="true"
          />
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
            <p className="school-admin-campus">
              <span className="school-admin-logo school-admin-logo-fallback" aria-hidden="true">
                {(schoolName ?? "S").trim().charAt(0).toUpperCase() || "S"}
              </span>
              <span>
                <strong>{schoolName ?? "Your school"}</strong>
                <small>Family portal</small>
              </span>
            </p>
            <p className="nav-section-title">FAMILY</p>
            <nav className="workspace-nav" aria-label="Primary Navigation" onClick={() => setMobileSidebarOpen(false)}>
              <Link className="workspace-link is-active" href="/parents">
                <Home size={18} />
                <span>Overview</span>
              </Link>
            </nav>
          </div>
          <div className="sidebar-bottom">
            <div className="sidebar-profile">
              <ProfileAvatar profile={shownProfile} />
              <div className="profile-copy">
                <strong>{shownProfile.name || "Parent"}</strong>
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
        <main className="admin-main">
          <header className="admin-topbar">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                className="icon-button mobile-menu-btn"
                style={{ display: "none" }}
                onClick={() => setMobileSidebarOpen((open) => !open)}
                aria-label="Toggle navigation menu"
              >
                <Menu size={18} />
              </button>
              <div className="breadcrumb">
                <span>Parents</span>
                <b>/</b>
                <strong>Overview</strong>
              </div>
            </div>
            <div className="topbar-actions">
              {profile ? <TopbarAvatar profile={profile} /> : <span className="topbar-avatar" />}
            </div>
          </header>
          {children}
        </main>
      </div>
    </ParentShellContext.Provider>
  );
}
