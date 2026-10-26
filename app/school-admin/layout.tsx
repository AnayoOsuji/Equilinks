import { Suspense } from "react";
import { requireRoles } from "@/lib/auth";
import { sidebarProfile } from "@/lib/sidebar-profile";
import {
  getSchoolAdminClasses,
  getSchoolAdminPeople,
  getSchoolAdminStudents,
  getSignedInSchool,
} from "@/lib/school-admin-users";
import { CountsSync, ProfileSync, SchoolAdminShell, SchoolSync } from "./shell";
import "../admin/admin.css";

export default function SchoolAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SchoolAdminShell>
      <Suspense fallback={null}>
        <SignedInProfile />
      </Suspense>
      <Suspense fallback={null}>
        <SignedInSchool />
      </Suspense>
      <Suspense fallback={null}>
        <NavCounts />
      </Suspense>
      {children}
    </SchoolAdminShell>
  );
}

async function SignedInProfile() {
  const user = await requireRoles(["SCHOOL_ADMIN"], "/school-admin");
  return <ProfileSync profile={sidebarProfile(user)} />;
}

async function SignedInSchool() {
  const school = await getSignedInSchool();
  return (
    <SchoolSync
      school={{
        name: school.schoolName ?? "Your school",
        type: school.schoolType ?? "School",
        logo: school.schoolLogo ?? undefined,
      }}
    />
  );
}

async function NavCounts() {
  await requireRoles(["SCHOOL_ADMIN"], "/school-admin");
  const [people, students, classes] = await Promise.all([
    getSchoolAdminPeople(),
    getSchoolAdminStudents(),
    getSchoolAdminClasses(),
  ]);
  return <CountsSync userCount={people.length} studentCount={students.length} classCount={classes.length} />;
}
