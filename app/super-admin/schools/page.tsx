import { Suspense } from "react";
import { getDirectorySchools } from "@/lib/admin-schools";
import SchoolsPage from "../../admin/schools/schools-client";
import { WorkspaceContentFallback } from "../shell";

export default function SuperAdminSchoolsPage() {
  return (
    <Suspense fallback={<WorkspaceContentFallback title="Schools" />}>
      <SuperAdminSchools />
    </Suspense>
  );
}

async function SuperAdminSchools() {
  const schools = await getDirectorySchools();
  return <SchoolsPage workspace="super-admin" initialSchools={schools} />;
}
