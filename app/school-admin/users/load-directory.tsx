import { Suspense } from "react";
import { unstable_rethrow } from "next/navigation";
import { getSchoolAdminPeople } from "@/lib/school-admin-users";
import { UsersDirectory } from "./directory";

export function SchoolUsersPage({ role }: { role: "all" | "educator" | "parent" }) {
  return (
    <Suspense
      fallback={
        <div className="admin-content">
          <p className="dashboard-subtitle">Loading users…</p>
        </div>
      }
    >
      <LoadedUsers role={role} />
    </Suspense>
  );
}

async function LoadedUsers({ role }: { role: "all" | "educator" | "parent" }) {
  try {
    const people = await getSchoolAdminPeople();
    return <UsersDirectory role={role} people={people} />;
  } catch (error) {
    unstable_rethrow(error);
    const message =
      error instanceof Error
        ? error.message.replace(/postgres(?:ql)?:\/\/\S+/gi, "postgresql://…")
        : "Users could not be loaded.";
    return (
      <div className="admin-content">
        <p className="dashboard-subtitle">Users could not be loaded.</p>
        <p className="dashboard-subtitle">{message}</p>
      </div>
    );
  }
}
