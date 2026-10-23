import { Suspense } from "react";
import { signOut } from "@/app/login/actions";
import { requireRoles } from "@/lib/auth";
import type { SessionRole } from "@/lib/auth-paths";
import "../admin/admin.css";

const ROLE_LABELS: Partial<Record<SessionRole, string>> = {
  EDUCATOR: "Educator",
  SPECIALIST: "Specialist",
  STUDENT: "Student",
};

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <main className="admin-shell">
          <div className="admin-main" style={{ marginLeft: 0, width: "100%" }}>
            <div className="admin-content">
              <p className="dashboard-subtitle">Loading your dashboard…</p>
            </div>
          </div>
        </main>
      }
    >
      <RoleHome />
    </Suspense>
  );
}

async function RoleHome() {
  const user = await requireRoles(["EDUCATOR", "SPECIALIST", "STUDENT"], "/home");
  const role = ROLE_LABELS[user.role] ?? "Account";

  return (
    <main className="admin-shell">
      <div className="admin-main" style={{ marginLeft: 0, width: "100%" }}>
        <div className="admin-content">
          <section className="dashboard-heading">
            <div>
              <p className="dashboard-date">{role.toUpperCase()}</p>
              <h1>
                {user.firstname} {user.surname}
              </h1>
              <p className="dashboard-subtitle">Signed in to the {role.toLowerCase()} dashboard.</p>
            </div>
            <form action={signOut}>
              <button className="sign-out-button" type="submit">
                Sign out
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
