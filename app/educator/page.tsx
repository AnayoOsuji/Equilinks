import { Suspense } from "react";
import { requireRoles } from "@/lib/auth";
import { getEducatorRoster } from "@/lib/educator-roster";
import { PageLoader } from "../page-loader";
import { EmotionBoard } from "./board";

export default function EducatorPage() {
  return (
    <Suspense fallback={<PageLoader label="overview" />}>
      <Classroom />
    </Suspense>
  );
}

async function Classroom() {
  const user = await requireRoles(["EDUCATOR"], "/educator");
  const roster = await getEducatorRoster(user.id);
  return <EmotionBoard firstName={user.firstname} roster={roster} />;
}
