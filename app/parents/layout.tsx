import { Suspense } from "react";
import { requireRoles } from "@/lib/auth";
import { getParentSidebar } from "@/lib/parent-portal";
import { ParentProfileSync, ParentShell } from "./shell";

export default function ParentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <ParentShell>
      <Suspense fallback={null}>
        <SignedInParent />
      </Suspense>
      {children}
    </ParentShell>
  );
}

async function SignedInParent() {
  const user = await requireRoles(["PARENT"], "/parents");
  const details = await getParentSidebar(user.id);
  return <ParentProfileSync profile={details.profile} schoolName={details.schoolName} />;
}
