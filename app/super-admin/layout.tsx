import { Suspense } from "react";
import { requireSuperAdmin } from "@/lib/auth";
import { sidebarProfile } from "@/lib/sidebar-profile";
import { ProfileSync, SuperAdminShell } from "./shell";
import "../admin/admin.css";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SuperAdminShell>
      <Suspense fallback={null}>
        <SignedInProfile />
      </Suspense>
      {children}
    </SuperAdminShell>
  );
}

async function SignedInProfile() {
  const user = await requireSuperAdmin("/super-admin");
  return <ProfileSync profile={sidebarProfile(user)} />;
}
