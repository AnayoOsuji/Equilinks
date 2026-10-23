import { Suspense } from "react";
import { getSchoolAdminClasses, getSchoolAdminPeople, getSchoolAdminStudents } from "@/lib/school-admin-users";
import { SchoolAdminShell } from "./shell";
import "../admin/admin.css";

export default function SchoolAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="admin-shell">
          <main className="admin-main" style={{ marginLeft: 0, width: "100%" }}>
            <div className="admin-content">
              <p className="dashboard-subtitle">Loading workspace…</p>
            </div>
          </main>
        </div>
      }
    >
      <SchoolAdminFrame>{children}</SchoolAdminFrame>
    </Suspense>
  );
}

async function SchoolAdminFrame({ children }: { children: React.ReactNode }) {
  const [people, students, classes] = await Promise.all([
    getSchoolAdminPeople(),
    getSchoolAdminStudents(),
    getSchoolAdminClasses(),
  ]);
  return (
    <SchoolAdminShell userCount={people.length} studentCount={students.length} classCount={classes.length}>
      {children}
    </SchoolAdminShell>
  );
}
