import { Suspense } from "react";
import { requireRoles } from "@/lib/auth";
import { getDirectorySchools } from "@/lib/admin-schools";
import SchoolsPage from "./schools-client";
import { AdminContentFallback } from "../shell";

export default function AdminSchoolsPage() {
  return (
    <Suspense fallback={<AdminContentFallback title="Schools" />}>
      <AdminSchools />
    </Suspense>
  );
}

async function AdminSchools() {
  await requireRoles(["EQUILINKS_ADMIN", "SUPER_ADMIN"], "/admin/schools");
  const schools = await getDirectorySchools();
  return <SchoolsPage initialSchools={schools} />;
}
