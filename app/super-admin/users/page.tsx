import { Suspense } from "react";
import { unstable_rethrow } from "next/navigation";
import { sidebarProfile } from "@/lib/sidebar-profile";
import { requireSuperAdmin } from "@/lib/auth";
import { getAdminUsers, getSchoolNames } from "@/lib/admin-users";
import UsersClient from "../../admin/users/users-client";
import { WorkspaceContentFallback } from "../shell";

export default function SuperAdminUsersPage() {
  return (
    <Suspense fallback={<WorkspaceContentFallback title="Users" />}>
      <SuperAdminUsers />
    </Suspense>
  );
}

async function SuperAdminUsers() {
  try {
    const user = await requireSuperAdmin("/super-admin/users");
    const [users, schools] = await Promise.all([
      getAdminUsers({ includeSuperAdmins: true, includeParents: true }),
      getSchoolNames(),
    ]);
    return (
      <UsersClient
        initialUsers={users}
        schools={schools}
        workspace="super-admin"
        profile={sidebarProfile(user)}
      />
    );
  } catch (error) {
    unstable_rethrow(error);
    const message =
      error instanceof Error
        ? error.message.replace(/postgres(?:ql)?:\/\/\S+/gi, "postgresql://…")
        : "Users could not be loaded.";
    return (
      <main className="admin-main">
        <div className="admin-content">
          <p className="dashboard-subtitle">Users could not be loaded.</p>
          <p className="dashboard-subtitle">{message}</p>
        </div>
      </main>
    );
  }
}
