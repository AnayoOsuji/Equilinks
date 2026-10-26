import { Suspense } from "react";
import { unstable_rethrow } from "next/navigation";
import { getSchoolAdminClasses, getSchoolAdminPeople, getSchoolAdminStudents } from "@/lib/school-admin-users";
import { PageLoader } from "../../page-loader";
import { StudentsDirectory } from "./directory";

export default function SchoolAdminStudentsPage() {
  return (
    <Suspense fallback={<PageLoader label="students" />}>
      <LoadedStudents />
    </Suspense>
  );
}

async function LoadedStudents() {
  try {
    const [students, classes, people] = await Promise.all([
      getSchoolAdminStudents(),
      getSchoolAdminClasses(),
      getSchoolAdminPeople(),
    ]);
    const guardians = people
      .filter((person) => person.role === "Parent")
      .map((person) => ({ id: person.id, name: person.name }));
    return <StudentsDirectory students={students} classes={classes} guardians={guardians} />;
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
