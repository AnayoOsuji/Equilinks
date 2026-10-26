import { Suspense } from "react";
import { requireRoles } from "@/lib/auth";
import { getEducatorNotifications, getEducatorSidebar } from "@/lib/educator-roster";
import { EducatorShell, NotificationsSync, ProfileSync, SchoolSync } from "./shell";
import "../admin/admin.css";
import "./educator.css";

export default function EducatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <EducatorShell>
      <Suspense fallback={null}>
        <SignedInProfile />
      </Suspense>
      {children}
    </EducatorShell>
  );
}

async function SignedInProfile() {
  const user = await requireRoles(["EDUCATOR"], "/educator");
  const [details, notifications] = await Promise.all([
    getEducatorSidebar(user.id),
    getEducatorNotifications(user.id),
  ]);
  return (
    <>
      <ProfileSync profile={details.profile} />
      <SchoolSync school={details.school} />
      <NotificationsSync items={notifications} />
    </>
  );
}
