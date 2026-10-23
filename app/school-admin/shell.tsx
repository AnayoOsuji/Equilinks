"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, BookOpen, GraduationCap, Layers, Menu, Search, Settings, Users } from "lucide-react";
import { signOut } from "@/app/login/actions";
import { campus } from "./data";
import "../admin/admin.css";

const titles: Record<string, string> = {
  "/school-admin": "Overview",
  "/school-admin/classes": "Classes",
  "/school-admin/users": "Users",
  "/school-admin/users/educators": "Educators",
  "/school-admin/users/parents": "Parents",
  "/school-admin/students": "Students",
  "/school-admin/settings": "Settings",
};

export function SchoolAdminShell({
  children,
  userCount,
  studentCount,
  classCount,
}: {
  children: React.ReactNode;
  userCount: number;
  studentCount: number;
  classCount: number;
}) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const usersActive = pathname.startsWith("/school-admin/users");
  const currentTitle = titles[pathname] ?? "Overview";

  return (
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
            <strong>{campus.name}</strong>
            <small>{campus.type}</small>
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
              <span className="nav-count">{classCount}</span>
            </Link>

            <Link
              className={`workspace-link ${usersActive ? "is-active" : ""}`}
              href="/school-admin/users"
              onClick={() => setMobileSidebarOpen(false)}
            >
              <Users size={18} />
              <span>Users</span>
              <span className="nav-count">{userCount}</span>
            </Link>

            <Link
              className={`workspace-link ${pathname.startsWith("/school-admin/students") ? "is-active" : ""}`}
              href="/school-admin/students"
              onClick={() => setMobileSidebarOpen(false)}
            >
              <GraduationCap size={18} />
              <span>Students</span>
              <span className="nav-count">{studentCount}</span>
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
            <span className="profile-avatar">
              JE
              <span className="profile-avatar-online" title="Online" />
            </span>
            <div className="profile-copy">
              <strong>Jordan Ellis</strong>
              <small>School Admin</small>
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
            <span className="topbar-avatar" title="Jordan Ellis">
              JE
            </span>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
