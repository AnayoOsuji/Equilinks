import { Suspense } from "react";
import { unstable_rethrow } from "next/navigation";
import { getSchoolAdminClasses, getSchoolAdminPeople } from "@/lib/school-admin-users";
import { ClassesDirectory } from "./directory";

export default function SchoolAdminClassesPage() {
  return (
    <Suspense
      fallback={
        <div className="admin-content">
          <p className="dashboard-subtitle">Loading classes…</p>
        </div>
      }
    >
      <LoadedClasses />
    </Suspense>
  );
}

async function LoadedClasses() {
  try {
    const [classes, people] = await Promise.all([getSchoolAdminClasses(), getSchoolAdminPeople()]);
    const educators = people
      .filter((person) => person.role === "Educator")
      .map((person) => ({ id: person.id, name: person.name }));
    return <ClassesDirectory classes={classes} educators={educators} />;
  } catch (error) {
    unstable_rethrow(error);
    const message =
      error instanceof Error
        ? error.message.replace(/postgres(?:ql)?:\/\/\S+/gi, "postgresql://…")
        : "Classes could not be loaded.";
    return (
      <div className="admin-content">
        <p className="dashboard-subtitle">Classes could not be loaded.</p>
        <p className="dashboard-subtitle">{message}</p>
      </div>
    );
  }
}
