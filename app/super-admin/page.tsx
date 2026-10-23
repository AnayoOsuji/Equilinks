import { Suspense } from "react";
import { requireSuperAdmin } from "@/lib/auth";
import SuperAdminDashboard from "./dashboard";
import "../admin/admin.css";

export default function SuperAdminPage() {
  return (
    <Suspense
      fallback={
        <div className="admin-shell">
          <main className="admin-main">
            <div className="admin-content">
              <p className="dashboard-subtitle">Checking access…</p>
            </div>
          </main>
        </div>
      }
    >
      <ProtectedDashboard />
    </Suspense>
  );
}

async function ProtectedDashboard() {
  await requireSuperAdmin("/super-admin");
  return <SuperAdminDashboard />;
}
