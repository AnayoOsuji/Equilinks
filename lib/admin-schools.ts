import type { Role, SchoolStatus } from "@prisma/client";
import prisma from "@/lib/prisma";

const staffRoles: Role[] = ["EDUCATOR", "SPECIALIST"];

export type DirectorySchool = {
  id: string;
  name: string;
  code: string;
  type: string;
  address: string;
  leadAdmin: string;
  email: string;
  phone: string;
  learnersCount: number;
  educatorsCount: number;
  parentsCount: number;
  specializations: string[];
  status: "Active" | "Review";
  logo?: string;
};

const schoolSelect = {
  id: true,
  name: true,
  code: true,
  type: true,
  address: true,
  email: true,
  phone: true,
  logo: true,
  leadAdmin: true,
  status: true,
  specializations: true,
  users: {
    where: { role: { in: staffRoles } },
    select: { id: true },
  },
  _count: { select: { students: true, parents: true } },
} as const;

type SchoolRecord = {
  id: string;
  name: string;
  code: string | null;
  type: string | null;
  address: string;
  email: string;
  phone: string;
  logo: string | null;
  leadAdmin: string | null;
  status: SchoolStatus;
  specializations: string[];
  users: { id: string }[];
  _count: { students: number; parents: number };
};

export function schoolCode(name: string) {
  const code = name
    .trim()
    .split(/\s+/)
    .map((word) => word[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 3);
  return code || "SCH";
}

export function toDirectorySchool(school: SchoolRecord): DirectorySchool {
  return {
    id: school.id,
    name: school.name,
    code: school.code || schoolCode(school.name),
    type: school.type || "Inclusive Campus",
    address: school.address,
    leadAdmin: school.leadAdmin || "Unassigned",
    email: school.email,
    phone: school.phone,
    learnersCount: school._count.students,
    educatorsCount: school.users.length,
    parentsCount: school._count.parents,
    specializations: school.specializations,
    status: school.status === "ACTIVE" ? "Active" : "Review",
    logo: school.logo ?? undefined,
  };
}

export async function getDirectorySchools(): Promise<DirectorySchool[]> {
  const schools = await prisma.school.findMany({
    orderBy: { name: "asc" },
    select: schoolSelect,
  });
  return schools.map(toDirectorySchool);
}

export { schoolSelect };
