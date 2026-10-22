import { Suspense } from "react";
import { unstable_rethrow } from "next/navigation";
import { getAdminUsers, getSchoolNames } from "@/lib/admin-users";
import UsersClient from "./users-client";
import "../admin.css";

export default function UsersPage() {
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
    const [users, schools] = await Promise.all([getAdminUsers(), getSchoolNames()]);
    return <UsersClient initialUsers={users} schools={schools} />;
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
