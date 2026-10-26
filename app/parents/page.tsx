import { Suspense } from "react";
import { requireRoles } from "@/lib/auth";
import { getParentDashboard } from "@/lib/parent-portal";
import { PageLoader } from "../page-loader";
import { ParentDashboardView } from "./dashboard";

export default function ParentsPage() {
  return (
    <Suspense fallback={<PageLoader label="your family overview" />}>
      <LoadedDashboard />
    </Suspense>
  );
}

async function LoadedDashboard() {
  const user = await requireRoles(["PARENT"], "/parents");
  const dashboard = await getParentDashboard(user.id);
  return <ParentDashboardView dashboard={dashboard} fallbackName={user.firstname} />;
}
