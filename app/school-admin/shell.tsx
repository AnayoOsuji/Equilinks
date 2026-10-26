"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, BookOpen, GraduationCap, Layers, Menu, Search, Settings, Users } from "lucide-react";
import { signOut } from "@/app/login/actions";
import { ProfileAvatar, TopbarAvatar } from "../admin/profile-avatar";
import type { SidebarProfile } from "@/lib/sidebar-profile";
import "../admin/admin.css";

type NavCounts = {
  userCount: number;
  studentCount: number;
  classCount: number;
};

export type SchoolIdentity = {
  name: string;
  type: string;
  logo?: string;
};

type SchoolAdminShellValue = {
  school: SchoolIdentity | null;
  setProfile: (profile: SidebarProfile) => void;
  setCounts: (counts: NavCounts) => void;
  setSchool: (school: SchoolIdentity) => void;
};

const SchoolAdminShellContext = createContext<SchoolAdminShellValue | null>(null);

function useSchoolAdminShell() {
  return useContext(SchoolAdminShellContext);
}

export function useSchoolAdminSchool() {
  return useSchoolAdminShell()?.school ?? null;
}

const emptyProfile: SidebarProfile = {
  name: "",
  initials: "",
  roleLabel: "School Admin",
};

export function ProfileSync({ profile }: { profile: SidebarProfile }) {
  const setProfile = useSchoolAdminShell()?.setProfile;

  useEffect(() => {
    setProfile?.(profile);
  }, [setProfile, profile]);

  return null;
}

export function SchoolSync({ school }: { school: SchoolIdentity }) {
  const setSchool = useSchoolAdminShell()?.setSchool;

  useEffect(() => {
    setSchool?.(school);
  }, [setSchool, school]);

  return null;
}

export function CountsSync({ userCount, studentCount, classCount }: NavCounts) {
  const setCounts = useSchoolAdminShell()?.setCounts;

  useEffect(() => {
    setCounts?.({ userCount, studentCount, classCount });
  }, [setCounts, userCount, studentCount, classCount]);

  return null;
}

const titles: Record<string, string> = {
  "/school-admin": "Overview",
  "/school-admin/classes": "Classes",
  "/school-admin/users": "Users",
  "/school-admin/users/educators": "Educators",
  "/school-admin/users/parents": "Parents",
  "/school-admin/students": "Students",
  "/school-admin/settings": "Settings",
};

export function SchoolAdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<SidebarProfile | null>(null);
  const [school, setSchool] = useState<SchoolIdentity | null>(null);
  const [counts, setCounts] = useState<NavCounts | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const usersActive = pathname.startsWith("/school-admin/users");
  const currentTitle = titles[pathname] ?? "Overview";
  const shownProfile = profile ?? emptyProfile;

  return (
    <SchoolAdminShellContext.Provider value={{ school, setProfile, setCounts, setSchool }}>
    <div className="admin-shell">
      {mobileSidebarOpen ? (
        <div
          className="drawer-backdrop"
          style={{ zIndex: 39 }}
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      ) : null}

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

          <p className="nav-section-title">WORKSPACE</p>
          <nav className="workspace-nav" aria-label="Primary Navigation">
            <Link
              className={`workspace-link ${pathname === "/school-admin" ? "is-active" : ""}`}
              href="/school-admin"
              onClick={() => setMobileSidebarOpen(false)}
            >
              <Layers size={18} />
              <span>Overview</span>
            </Link>

            <Link
              className={`workspace-link ${pathname.startsWith("/school-admin/classes") ? "is-active" : ""}`}
              href="/school-admin/classes"
              onClick={() => setMobileSidebarOpen(false)}
            >
              <BookOpen size={18} />
              <span>Classes</span>
              {counts ? <span className="nav-count">{counts.classCount}</span> : null}
            </Link>

            <Link
              className={`workspace-link ${usersActive ? "is-active" : ""}`}
              href="/school-admin/users"
              onClick={() => setMobileSidebarOpen(false)}
            >
              <Users size={18} />
              <span>Users</span>
              {counts ? <span className="nav-count">{counts.userCount}</span> : null}
            </Link>

            <Link
              className={`workspace-link ${pathname.startsWith("/school-admin/students") ? "is-active" : ""}`}
              href="/school-admin/students"
              onClick={() => setMobileSidebarOpen(false)}
            >
              <GraduationCap size={18} />
              <span>Students</span>
              {counts ? <span className="nav-count">{counts.studentCount}</span> : null}
            </Link>
            <Link
              className={`workspace-link ${pathname.startsWith("/school-admin/settings") ? "is-active" : ""}`}
              href="/school-admin/settings"
              onClick={() => setMobileSidebarOpen(false)}
            >
              <Settings size={18} />
              <span>Settings</span>
            </Link>
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-profile">
            <ProfileAvatar profile={shownProfile} />
            <div className="profile-copy">
              <strong>{shownProfile.name || "School Admin"}</strong>
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
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              aria-label="Toggle navigation menu"
            >
              <Menu size={18} />
            </button>
            <div className="breadcrumb">
              <span>School Admin</span>
              <b>/</b>
              {currentTitle === "Educators" || currentTitle === "Parents" ? (
                <>
                  <Link href="/school-admin/users">Users</Link>
                  <b>/</b>
                </>
              ) : null}
              <strong>{currentTitle}</strong>
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
            </div>
            <button className="icon-button notification-button" aria-label="Notifications">
              <span className="notification-dot" />
              <Bell size={18} />
            </button>
            {profile ? <TopbarAvatar profile={profile} /> : <span className="topbar-avatar" />}
          </div>
        </header>
        {children}
      </main>
    </div>
    </SchoolAdminShellContext.Provider>
  );
}
