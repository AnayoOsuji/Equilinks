"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Layers, Menu, Search } from "lucide-react";
import { signOut } from "@/app/login/actions";
import { ProfileAvatar, TopbarAvatar } from "../admin/profile-avatar";
import type { SidebarProfile } from "@/lib/sidebar-profile";
import type { EducatorSchool, HomeIncidentNotification } from "@/lib/educator-roster";
import { NotificationBell } from "./notifications";
import "../admin/admin.css";
import "./educator.css";

type EducatorShellValue = {
  profile: SidebarProfile | null;
  school: EducatorSchool | null;
  setProfile: (profile: SidebarProfile) => void;
  setSchool: (school: EducatorSchool) => void;
  setNotifications: (items: HomeIncidentNotification[]) => void;
  openMenu: () => void;
  searchQuery: string;
};

const emptyProfile: SidebarProfile = {
  name: "",
  initials: "",
  roleLabel: "Educator",
};

const EducatorShellContext = createContext<EducatorShellValue | null>(null);

export function useEducatorShell() {
  return useContext(EducatorShellContext);
}

export function ProfileSync({ profile }: { profile: SidebarProfile }) {
  const setProfile = useEducatorShell()?.setProfile;

  useEffect(() => {
    setProfile?.(profile);
  }, [setProfile, profile]);

  return null;
}

export function SchoolSync({ school }: { school: EducatorSchool }) {
  const setSchool = useEducatorShell()?.setSchool;

  useEffect(() => {
    setSchool?.(school);
  }, [setSchool, school]);

  return null;
}

export function NotificationsSync({ items }: { items: HomeIncidentNotification[] }) {
  const setNotifications = useEducatorShell()?.setNotifications;

  useEffect(() => {
    setNotifications?.(items);
  }, [setNotifications, items]);

  return null;
}

export function EducatorShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<SidebarProfile | null>(null);
  const [school, setSchool] = useState<EducatorSchool | null>(null);
  const [notifications, setNotifications] = useState<HomeIncidentNotification[] | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const shownProfile = profile ?? emptyProfile;
  const studentsActive = pathname.startsWith("/educator/students");
  const currentTitle = studentsActive ? "Students" : "Overview";

  const openMenu = () => setMobileSidebarOpen(true);
  const closeMenu = () => setMobileSidebarOpen(false);

  return (
    <EducatorShellContext.Provider value={{ profile, school, setProfile, setSchool, setNotifications, openMenu, searchQuery }}>
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
            <p className="school-admin-campus">
              {school?.logo ? (
                <img className="school-admin-logo" src={school.logo} alt="" />
              ) : (
                <span className="school-admin-logo school-admin-logo-fallback" aria-hidden="true">
                  {(school?.name ?? "S").trim().charAt(0).toUpperCase() || "S"}
                </span>
              )}
              <span>
                <strong>{school?.name ?? "Your school"}</strong>
                <small>{school?.type || "School"}</small>
              </span>
            </p>
            <p className="nav-section-title">CLASSROOM</p>
            <nav className="workspace-nav" aria-label="Primary Navigation" onClick={closeMenu}>
              <Link className={`workspace-link${pathname === "/educator" ? " is-active" : ""}`} href="/educator">
                <Layers size={18} />
                <span>Overview</span>
              </Link>
              <Link className={`workspace-link${studentsActive ? " is-active" : ""}`} href="/educator/students">
                <GraduationCap size={18} />
                <span>Students</span>
              </Link>
            </nav>
          </div>
          <div className="sidebar-bottom">
            <div className="sidebar-profile">
              <ProfileAvatar profile={shownProfile} />
              <div className="profile-copy">
                <strong>{shownProfile.name || "Educator"}</strong>
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
                <span>Educator</span>
                <b>/</b>
                <strong>{currentTitle}</strong>
              </div>
            </div>
            <div className="topbar-actions">
              {studentsActive ? null : (
                <div className="admin-search" role="search">
                  <Search size={15} />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    aria-label="Search students"
                  />
                </div>
              )}
              <NotificationBell initial={notifications} />
              {profile ? <TopbarAvatar profile={profile} /> : <span className="topbar-avatar" />}
            </div>
          </header>
          {children}
        </main>
      </div>
    </EducatorShellContext.Provider>
  );
}
