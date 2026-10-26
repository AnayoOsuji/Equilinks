import { Suspense } from "react";
import { unstable_rethrow } from "next/navigation";
import { requireRoles } from "@/lib/auth";
import { getEducatorStudents } from "@/lib/educator-roster";
import { PageLoader } from "../../page-loader";
import { EducatorStudents } from "./directory";

export default function EducatorStudentsPage() {
  return (
    <Suspense fallback={<PageLoader label="students" />}>
      <LoadedStudents />
    </Suspense>
  );
}

async function LoadedStudents() {
  try {
    const user = await requireRoles(["EDUCATOR"], "/educator/students");
    const students = await getEducatorStudents(user.id);
    return <EducatorStudents students={students} />;
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
