import type { SessionRole } from "@/lib/auth-paths";

export type SidebarProfile = {
  name: string;
  initials: string;
  roleLabel: string;
  avatar?: string;
};

const roleLabels: Record<SessionRole, string> = {
  SUPER_ADMIN: "Super Admin",
  EQUILINKS_ADMIN: "Equilinks Admin",
  SCHOOL_ADMIN: "School Admin",
  EDUCATOR: "Educator",
  SPECIALIST: "Specialist",
  STUDENT: "Student",
};

export function sidebarProfile(user: {
  firstname: string;
  surname: string;
  role: SessionRole;
  avatar?: string | null;
}): SidebarProfile {
  const firstname = user.firstname.trim();
  const surname = user.surname.trim();
  const initials = `${firstname[0] ?? ""}${surname[0] ?? ""}`.toUpperCase() || "US";

  return {
    name: `${firstname} ${surname}`.trim() || "Account",
    initials,
    roleLabel: roleLabels[user.role],
    avatar: user.avatar || undefined,
  };
}
