import { Suspense } from "react";
import { requireSuperAdmin } from "@/lib/auth";
import { sidebarProfile } from "@/lib/sidebar-profile";
import prisma from "@/lib/prisma";
import SuperAdminSettings from "./settings-client";
import { WorkspaceContentFallback } from "../shell";

export default function SuperAdminSettingsPage() {
  return (
    <Suspense fallback={<WorkspaceContentFallback title="Settings" />}>
      <SuperAdminSettingsContent />
    </Suspense>
  );
}

async function SuperAdminSettingsContent() {
  const session = await requireSuperAdmin("/super-admin/settings");
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { firstname: true, surname: true, email: true, avatar: true, role: true },
  });

  if (!user) {
    return (
      <main className="admin-main">
        <div className="admin-content">
          <p className="dashboard-subtitle">This account could not be loaded.</p>
        </div>
      </main>
    );
  }

  return (
    <SuperAdminSettings
      profile={sidebarProfile(user)}
      account={{
        firstname: user.firstname,
        surname: user.surname,
        email: user.email,
        avatar: user.avatar ?? undefined,
      }}
    />
  );
}
