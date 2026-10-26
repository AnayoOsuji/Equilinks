import { Suspense } from "react";
import { requireRoles } from "@/lib/auth";
import { sidebarProfile } from "@/lib/sidebar-profile";
import { AdminShell, ProfileSync } from "./shell";
import "./admin.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminShell>
      <Suspense fallback={null}>
        <SignedInProfile />
      </Suspense>
      {children}
    </AdminShell>
  );
}

async function SignedInProfile() {
  const user = await requireRoles(["EQUILINKS_ADMIN", "SUPER_ADMIN"], "/admin");
  return <ProfileSync profile={sidebarProfile(user)} />;
}
