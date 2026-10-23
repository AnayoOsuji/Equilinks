import { Suspense } from "react";
import { requireRoles } from "@/lib/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AdminAccess>{children}</AdminAccess>
    </Suspense>
  );
}

async function AdminAccess({ children }: { children: React.ReactNode }) {
  await requireRoles(["EQUILINKS_ADMIN", "SUPER_ADMIN"], "/admin");
  return children;
}
