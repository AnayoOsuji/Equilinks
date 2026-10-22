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
  MapPin,
  Mail,
  UserCheck,
  GraduationCap,
  Sparkles,
  ExternalLink,
  X,
  Phone,
  UploadCloud,
} from "lucide-react";

interface School {
  id: string;
  name: string;
  code: string;
  type: string;
  address: string;
  leadAdmin: string;
  email: string;
  phone: string;
  learnersCount: number;
  educatorsCount: number;
  parentsCount: number;
  specializations: string[];
  status: "Active" | "Review";
  logo?: string;
}

const initialSchools: School[] = [
  {
    id: "sch-1",
    name: "Harborview Learning Center",
    code: "HLC",
    type: "Specialized Inclusive Center",
    address: "1420 Shoreline Way, Seattle, WA 98101",
    leadAdmin: "Dr. Aris Vance",
    email: "harborview@equilinks.edu",
    phone: "(555) 234-8900",
    learnersCount: 64,
    educatorsCount: 18,
    parentsCount: 52,
    specializations: ["Sensory Integration", "Low-Stimulus Pods", "AAC Support"],
    status: "Active",
  },
  {
    id: "sch-2",
    name: "Cascade Inclusive Academy",
    code: "CIA",
    type: "Elementary & Middle Campus",
    address: "885 Evergreen Blvd, Portland, OR 97201",
    leadAdmin: "Sarah Lin, M.Ed.",
    email: "cascade@equilinks.edu",
    phone: "(555) 345-6700",
    learnersCount: 42,
    educatorsCount: 12,
    parentsCount: 38,
    specializations: ["Executive Function", "Visual Scheduling", "Peer Mentoring"],
    status: "Active",
  },
  {
    id: "sch-3",
    name: "Sunridge Neurodiverse High",
    code: "SNH",
    type: "Secondary Learning Lab",
    address: "310 Canyon Crest Rd, Bend, OR 97701",
    leadAdmin: "Marcus Reed, MS-SLP",
    email: "sunridge@equilinks.edu",
    phone: "(555) 456-7800",
    learnersCount: 22,
    educatorsCount: 6,
    parentsCount: 18,
    specializations: ["Vocational Transitions", "Self-Advocacy", "Assistive Tech"],
    status: "Active",
  },
];

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>(initialSchools);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  // New School Form State - Only required fields
  const [newSchool, setNewSchool] = useState({
    name: "",
    address: "",
    email: "",
    phone: "",
    logo: "",
  });

  const totalLearners = useMemo(() => schools.reduce((a, s) => a + s.learnersCount, 0), [schools]);
  const totalEducators = useMemo(() => schools.reduce((a, s) => a + s.educatorsCount, 0), [schools]);
  const totalParents = useMemo(() => schools.reduce((a, s) => a + s.parentsCount, 0), [schools]);

  const filteredSchools = useMemo(() => {
    return schools.filter((school) => {
      const matchSearch =
        school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        school.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        school.leadAdmin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        school.type.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;
      if (selectedType === "all") return true;
      if (selectedType === "specialized") return school.type.includes("Specialized");
      if (selectedType === "k12") return school.type.includes("Elementary") || school.type.includes("Secondary");
      return true;
    });
  }, [schools, searchQuery, selectedType]);

  const handleCreateSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchool.name.trim()) return;

    const code = newSchool.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 3);

    const created: School = {
      id: `sch-${Date.now()}`,
      name: newSchool.name,
      code: code || "SCH",
      type: "Inclusive Support Campus",
      address: newSchool.address || "100 Campus Way, Suite 100",
      leadAdmin: "Campus Administrator",
      email: newSchool.email || "info@equilinks.edu",
      phone: newSchool.phone || "(555) 000-0000",
      learnersCount: 0,
      educatorsCount: 0,
      parentsCount: 0,
      specializations: ["Inclusive Support", "Visual Schedules"],
      status: "Active",
      logo: newSchool.logo,
    };

    setSchools([...schools, created]);
    setIsAddModalOpen(false);
    setNewSchool({
      name: "",
      address: "",
      email: "",
      phone: "",
      logo: "",
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
            <Link className="workspace-link is-active" href="/admin/schools">
              <Building2 size={18} />
              <span>Schools</span>
              <span className="nav-count">{schools.length}</span>
            </Link>
            <Link className="workspace-link" href="/admin/users">
              <Users size={18} />
              <span>Users</span>
              <span className="nav-count">{totalLearners}</span>
            </Link>
            <Link className="workspace-link" href="/admin/parents">
              <HeartHandshake size={18} />
              <span>Parents</span>
              <span className="nav-count">{totalParents}</span>
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
      <main className="admin-main" id="schools-main">
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
              <strong>Schools</strong>
            </div>
          </div>

          <div className="topbar-actions">
            <div className="admin-search" role="search">
              <Search size={15} />
              <input
                type="text"
                placeholder="Search campuses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search schools"
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
              <p className="dashboard-date">CAMPUS MANAGEMENT</p>
              <h1>Schools & Campuses</h1>
              <p className="dashboard-subtitle">
                Manage registered inclusive schools, specialized learning centers, and administrative leads.
              </p>
            </div>
            <div className="heading-actions">
              <button
                className="add-student-button"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus size={16} />
                <span>Add new school</span>
              </button>
            </div>
          </section>

          {/* Simple Metric Grid */}
          <section className="metric-grid" aria-label="Schools metrics">
            <article className="metric-card">
              <div className="metric-top">
                <span>Total Campuses</span>
                <span className="metric-icon" style={{ background: "var(--iris-soft)", color: "var(--iris)" }}>
                  <Building2 size={17} />
                </span>
              </div>
              <div className="metric-number">{schools.length}</div>
              <div className="metric-footer">
                <span className="metric-up">100%</span>
                <span>all operational</span>
              </div>
            </article>

            <article className="metric-card">
              <div className="metric-top">
                <span>Enrolled Learners</span>
                <span className="metric-icon" style={{ background: "var(--sage-soft)", color: "var(--sage)" }}>
                  <Users size={17} />
                </span>
              </div>
              <div className="metric-number">{totalLearners}</div>
              <div className="metric-footer">
                <span className="metric-up">Active</span>
                <span>across 3 schools</span>
              </div>
            </article>

            <article className="metric-card">
              <div className="metric-top">
                <span>Staff & Specialists</span>
                <span className="metric-icon" style={{ background: "var(--amber-soft)", color: "var(--amber)" }}>
                  <GraduationCap size={17} />
                </span>
              </div>
              <div className="metric-number">{totalEducators}</div>
              <div className="metric-footer">
                <span className="metric-up">Assigned</span>
                <span>OT, SLP, and teachers</span>
              </div>
            </article>

            <article className="metric-card">
              <div className="metric-top">
                <span>Family Connections</span>
                <span className="metric-icon" style={{ background: "var(--coral-soft)", color: "var(--coral)" }}>
                  <HeartHandshake size={17} />
                </span>
              </div>
              <div className="metric-number">{totalParents}</div>
              <div className="metric-footer">
                <span className="metric-up">Connected</span>
                <span>guardians on portal</span>
              </div>
            </article>
          </section>

          {/* Filter Pills */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
            <div className="table-filter-tabs">
              <button
                className={`filter-tab ${selectedType === "all" ? "is-active" : ""}`}
                onClick={() => setSelectedType("all")}
              >
                All Campuses ({schools.length})
              </button>
              <button
                className={`filter-tab ${selectedType === "specialized" ? "is-active" : ""}`}
                onClick={() => setSelectedType("specialized")}
              >
                Specialized Support Centers
              </button>
              <button
                className={`filter-tab ${selectedType === "k12" ? "is-active" : ""}`}
                onClick={() => setSelectedType("k12")}
              >
                K-12 Campuses
              </button>
            </div>
            <span style={{ fontSize: "12.5px", color: "var(--admin-muted)" }}>
              Showing {filteredSchools.length} of {schools.length} schools
            </span>
          </div>

          {/* Tabulated Schools Table Matching Modal Fields */}
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
                aria-label="Schools Table"
                style={{ width: "100%", borderCollapse: "collapse" }}
              >
                <thead>
                  <tr style={{ background: "var(--admin-surface-subtle)", borderBottom: "1px solid var(--admin-border)" }}>
                    <th scope="col" style={{ padding: "14px 20px" }}>SCHOOL / CAMPUS</th>
                    <th scope="col" style={{ padding: "14px 16px" }}>ADDRESS</th>
                    <th scope="col" style={{ padding: "14px 16px" }}>CONTACT EMAIL</th>
                    <th scope="col" style={{ padding: "14px 20px", textAlign: "right" }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchools.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        style={{
                          textAlign: "center",
                          padding: "48px 24px",
                          color: "var(--admin-muted)",
                          fontSize: "13.5px",
                        }}
                      >
                        No campuses found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredSchools.map((school) => (
                      <tr
                        key={school.id}
                        onClick={() => setSelectedSchool(school)}
                        style={{
                          cursor: "pointer",
                          borderBottom: "1px solid var(--admin-border-subtle)",
                          transition: "background 0.15s ease",
                        }}
                      >
                        {/* School / Logo Field */}
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            {school.logo ? (
                              <img
                                src={school.logo}
                                alt={school.name}
                                style={{
                                  width: "42px",
                                  height: "42px",
                                  borderRadius: "10px",
                                  objectFit: "cover",
                                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                  flexShrink: 0,
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: "42px",
                                  height: "42px",
                                  borderRadius: "10px",
                                  background: "#1f3732",
                                  color: "#fff",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 700,
                                  fontSize: "13.5px",
                                  letterSpacing: "-0.01em",
                                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                  flexShrink: 0,
                                }}
                              >
                                {school.code}
                              </div>
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
                                {school.name}
                              </strong>
                              <span style={{ fontSize: "11.5px", color: "var(--admin-muted)" }}>
                                {school.type}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Address Field */}
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "7px", color: "var(--admin-ink-secondary)" }}>
                            <MapPin size={14} color="var(--admin-muted)" style={{ flexShrink: 0 }} />
                            <span style={{ fontSize: "12.5px", lineHeight: 1.35 }}>
                              {school.address}
                            </span>
                          </div>
                        </td>

                        {/* Contact Email Field */}
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                            <Mail size={14} color="var(--admin-muted)" style={{ flexShrink: 0 }} />
                            <a
                              href={`mailto:${school.email}`}
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                fontSize: "12.5px",
                                color: "var(--iris)",
                                textDecoration: "none",
                              }}
                            >
                              {school.email}
                            </a>
                          </div>
                        </td>

                        {/* Actions */}
                        <td
                          style={{ padding: "14px 20px", textAlign: "right" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            <button
                              className="row-action-btn"
                              onClick={() => setSelectedSchool(school)}
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
                              Details
                            </button>
                            <button
                              className="secondary-action-button"
                              onClick={() => alert(`Entering ${school.name} portal`)}
                              style={{
                                padding: "5px 10px",
                                fontSize: "12px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <ExternalLink size={13} />
                              Portal
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
            <span>Equilinks School Directory</span>
            <span>Total: {schools.length} active campuses</span>
          </footer>
        </div>
      </main>

      {/* Add School Modal (Register New Campus) */}
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
              <h3>Register New Campus</h3>
              <button
                className="drawer-close"
                onClick={() => setIsAddModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={handleCreateSchool}
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
                {/* Centered Upload Logo Field */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", margin: "4px 0 10px" }}>
                  <label
                    htmlFor="school-logo-input"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "104px",
                      height: "104px",
                      borderRadius: "50%",
                      border: "2px dashed var(--admin-border-strong)",
                      background: newSchool.logo
                        ? `url(${newSchool.logo}) center/cover no-repeat`
                        : "var(--admin-surface-subtle)",
                      cursor: "pointer",
                      transition: "all var(--transition-fast)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                    title="Click to upload school logo"
                  >
                    {!newSchool.logo ? (
                      <>
                        <UploadCloud size={24} color="var(--admin-muted)" />
                        <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--admin-muted)", marginTop: "4px" }}>
                          Upload Logo
                        </span>
                      </>
                    ) : (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "rgba(0, 0, 0, 0.4)",
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
                      id="school-logo-input"
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setNewSchool((prev) => ({ ...prev, logo: reader.result as string }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  <span style={{ fontSize: "11.5px", color: "var(--admin-muted)" }}>
                    Click to upload school logo
                  </span>
                </div>

                {/* School Name */}
                <div className="form-group">
                  <label htmlFor="school-name">School Name</label>
                  <input
                    id="school-name"
                    type="text"
                    required
                    placeholder="e.g. Harborview Learning Center"
                    value={newSchool.name}
                    onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
                  />
                </div>

                {/* Address */}
                <div className="form-group">
                  <label htmlFor="school-address">Address</label>
                  <input
                    id="school-address"
                    type="text"
                    required
                    placeholder="e.g. 1420 Shoreline Way, Seattle, WA 98101"
                    value={newSchool.address}
                    onChange={(e) => setNewSchool({ ...newSchool, address: e.target.value })}
                  />
                </div>

                {/* Contact Email & Phone */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="school-email">Contact Email</label>
                    <input
                      id="school-email"
                      type="email"
                      required
                      placeholder="admin@school.edu"
                      value={newSchool.email}
                      onChange={(e) => setNewSchool({ ...newSchool, email: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="school-phone">Phone</label>
                    <input
                      id="school-phone"
                      type="tel"
                      required
                      placeholder="(555) 234-8900"
                      value={newSchool.phone}
                      onChange={(e) => setNewSchool({ ...newSchool, phone: e.target.value })}
                    />
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
                  <CheckCircle2 size={16} /> Save Campus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* School Detail Modal */}
      {selectedSchool && (
        <div className="modal-backdrop" onClick={() => setSelectedSchool(null)}>
          <div className="modal-card" style={{ maxWidth: "560px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "6px",
                    background: "#1f3732",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                >
                  {selectedSchool.code}
                </span>
                <h3 style={{ margin: 0 }}>{selectedSchool.name}</h3>
              </div>
              <button
                className="drawer-close"
                onClick={() => setSelectedSchool(null)}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ gap: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "var(--admin-muted)" }}>{selectedSchool.type}</span>
                <span className="status-pill status-green"><i />{selectedSchool.status}</span>
              </div>

              <div className="profile-card-grid">
                <div className="profile-info-box">
                  <small>Lead Administrator</small>
                  <strong>{selectedSchool.leadAdmin}</strong>
                </div>
                <div className="profile-info-box">
                  <small>Phone Number</small>
                  <strong>{selectedSchool.phone}</strong>
                </div>
                <div className="profile-info-box">
                  <small>Contact Email</small>
                  <strong>{selectedSchool.email}</strong>
                </div>
                <div className="profile-info-box">
                  <small>Campus Address</small>
                  <strong style={{ fontSize: "11.5px" }}>{selectedSchool.address}</strong>
                </div>
              </div>

              <div>
                <small style={{ fontSize: "11px", fontWeight: 700, color: "var(--admin-muted)", textTransform: "uppercase" }}>
                  Active Specializations
                </small>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
                  {selectedSchool.specializations.map((spec, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: "11.5px",
                        padding: "3px 8px",
                        background: "var(--sage-soft)",
                        color: "var(--sage)",
                        borderRadius: "4px",
                        fontWeight: 600,
                      }}
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "10px",
                  textAlign: "center",
                  padding: "12px",
                  background: "var(--admin-surface-subtle)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--admin-border-subtle)",
                }}
              >
                <div>
                  <strong style={{ fontSize: "18px", color: "var(--admin-ink)" }}>{selectedSchool.learnersCount}</strong>
                  <small style={{ display: "block", fontSize: "11px", color: "var(--admin-muted)" }}>Learners</small>
                </div>
                <div>
                  <strong style={{ fontSize: "18px", color: "var(--admin-ink)" }}>{selectedSchool.educatorsCount}</strong>
                  <small style={{ display: "block", fontSize: "11px", color: "var(--admin-muted)" }}>Educators</small>
                </div>
                <div>
                  <strong style={{ fontSize: "18px", color: "var(--admin-ink)" }}>{selectedSchool.parentsCount}</strong>
                  <small style={{ display: "block", fontSize: "11px", color: "var(--admin-muted)" }}>Parents</small>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="secondary-action-button"
                onClick={() => setSelectedSchool(null)}
              >
                Close
              </button>
              <button
                className="add-student-button"
                onClick={() => {
                  alert(`Navigating to ${selectedSchool.name} administration dashboard.`);
                  setSelectedSchool(null);
                }}
              >
                Enter Campus Portal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
