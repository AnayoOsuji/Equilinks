import { connection } from "next/server";
import type { Role, UserStatus } from "@prisma/client";
import { requireSuperAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";

export interface AdminUser {
  id: string;
  firstname: string;
  surname: string;
  name: string;
  email: string;
  initials: string;
  role: "School Admin" | "Equilinks Admin" | "Super Admin" | "Educator" | "Student" | "Specialist";
  school: string;
  status: "Active" | "Pending Invite" | "Inactive";
  lastActive: string;
  avatarColor: "green" | "coral" | "blue" | "amber" | "purple";
  avatar?: string;
}

const roleLabels: Record<Role, AdminUser["role"]> = {
  SCHOOL_ADMIN: "School Admin",
  EQUILINKS_ADMIN: "Equilinks Admin",
  SUPER_ADMIN: "Super Admin",
  EDUCATOR: "Educator",
  SPECIALIST: "Specialist",
  STUDENT: "Student",
};

const statusLabels: Record<UserStatus, AdminUser["status"]> = {
  ACTIVE: "Active",
  PENDING_INVITE: "Pending Invite",
  INACTIVE: "Inactive",
};

const avatarColors: AdminUser["avatarColor"][] = ["green", "coral", "blue", "amber", "purple"];

function initialsFor(firstname: string, surname: string) {
  const initials = `${firstname.trim()[0] ?? ""}${surname.trim()[0] ?? ""}`.toUpperCase();
  return initials || "US";
}

function colorFor(id: string): AdminUser["avatarColor"] {
  let hash = 0;
  for (const char of id) hash = (hash + char.charCodeAt(0)) % avatarColors.length;
  return avatarColors[hash];
}

type UserRecord = {
  id: string;
  firstname: string;
  surname: string;
  email: string;
  avatar: string | null;
  role: Role;
  status: UserStatus;
  lastActive: Date | null;
  school: { name: string } | null;
};

export function toAdminUser(user: UserRecord): AdminUser {
  return {
    id: user.id,
    firstname: user.firstname,
    surname: user.surname,
    name: `${user.firstname} ${user.surname}`.trim(),
    email: user.email,
    initials: initialsFor(user.firstname, user.surname),
    role: roleLabels[user.role],
    school: user.school?.name ?? "Unassigned",
    status: statusLabels[user.status],
    lastActive: formatLastActive(user.lastActive),
    avatarColor: colorFor(user.id),
    avatar: user.avatar ?? undefined,
  };
}

function formatLastActive(value: Date | null) {
  if (!value) return "Never";

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(value);

  if (value >= startOfToday) return `Today, ${time}`;
  if (value >= startOfYesterday) return "Yesterday";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

export async function getAdminUsers(options?: {
  includeSuperAdmins?: boolean;
}): Promise<AdminUser[]> {
  await connection();
  if (options?.includeSuperAdmins) {
    await requireSuperAdmin("/super-admin/users");
  }

  const rows = await prisma.user.findMany({
    where: options?.includeSuperAdmins ? undefined : { role: { not: "SUPER_ADMIN" } },
    orderBy: { createdAt: "desc" },
    select: userSelect,
  });

  return rows.map(toAdminUser);
}

const userSelect = {
  id: true,
  firstname: true,
  surname: true,
  email: true,
  avatar: true,
  role: true,
  status: true,
  lastActive: true,
  school: { select: { name: true } },
} as const;

export async function getSchoolNames(): Promise<string[]> {
  await connection();

  const schools = await prisma.school.findMany({
    orderBy: { name: "asc" },
    select: { name: true },
  });

  return schools.map((school) => school.name);
}

export { userSelect };
