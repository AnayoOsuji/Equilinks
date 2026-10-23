import { Suspense } from "react";
import { unstable_rethrow } from "next/navigation";
import { requireSuperAdmin } from "@/lib/auth";
import { getAdminUsers, getSchoolNames } from "@/lib/admin-users";
import UsersClient from "../../admin/users/users-client";
import "../../admin/admin.css";

export default function SuperAdminUsersPage() {
  return (
    <Suspense
      fallback={
        <div className="admin-shell">
          <main className="admin-main">
            <div className="admin-content">
              <p className="dashboard-subtitle">Loading users…</p>
            </div>
          </main>
        </div>
      }
    >
      <UsersDirectory />
    </Suspense>
  );
}

async function UsersDirectory() {
  try {
    await requireSuperAdmin("/super-admin/users");
    const [users, schools] = await Promise.all([
      getAdminUsers({ includeSuperAdmins: true }),
      getSchoolNames(),
    ]);
    return <UsersClient initialUsers={users} schools={schools} workspace="super-admin" />;
  } catch (error) {
    unstable_rethrow(error);
    const message =
      error instanceof Error
        ? error.message.replace(/postgres(?:ql)?:\/\/\S+/gi, "postgresql://…")
        : "Users could not be loaded.";
    return (
      <div className="admin-shell">
        <main className="admin-main">
          <div className="admin-content">
            <p className="dashboard-subtitle">Users could not be loaded.</p>
            <p className="dashboard-subtitle">{message}</p>
          </div>
        </main>
      </div>
    );
  }
}
