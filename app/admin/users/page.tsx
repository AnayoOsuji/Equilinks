import { Suspense } from "react";
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
  const [users, schools] = await Promise.all([getAdminUsers(), getSchoolNames()]);
  return <UsersClient initialUsers={users} schools={schools} />;
}
