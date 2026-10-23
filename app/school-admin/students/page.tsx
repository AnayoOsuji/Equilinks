import { Suspense } from "react";
import { unstable_rethrow } from "next/navigation";
import { getSchoolAdminClasses, getSchoolAdminStudents } from "@/lib/school-admin-users";
import { StudentsDirectory } from "./directory";

export default function SchoolAdminStudentsPage() {
  return (
    <Suspense
      fallback={
        <div className="admin-content">
          <p className="dashboard-subtitle">Loading students…</p>
        </div>
      }
    >
      <LoadedStudents />
    </Suspense>
  );
}

async function LoadedStudents() {
  try {
    const [students, classes] = await Promise.all([getSchoolAdminStudents(), getSchoolAdminClasses()]);
    return <StudentsDirectory students={students} classes={classes} />;
  } catch (error) {
    unstable_rethrow(error);
    const message =
      error instanceof Error
        ? error.message.replace(/postgres(?:ql)?:\/\/\S+/gi, "postgresql://…")
        : "Students could not be loaded.";
    return (
      <div className="admin-content">
        <p className="dashboard-subtitle">Students could not be loaded.</p>
        <p className="dashboard-subtitle">{message}</p>
      </div>
    );
  }
}
