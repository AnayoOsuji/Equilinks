import { cache } from "react";
import { connection } from "next/server";
import type { ParentRelationship, UserStatus } from "@prisma/client";
import type { CampusPerson, CampusStudent, PersonStatus } from "@/app/school-admin/data";
import prisma from "@/lib/prisma";

const statusLabels: Record<UserStatus, PersonStatus> = {
  ACTIVE: "Active",
  PENDING_INVITE: "Pending Invite",
  INACTIVE: "Inactive",
};

const relationshipLabels: Record<ParentRelationship, string> = {
  MOTHER: "Mother",
  FATHER: "Father",
  GUARDIAN: "Guardian",
  CAREGIVER: "Caregiver",
};

const avatarColors: CampusPerson["avatarColor"][] = ["green", "coral", "blue", "amber", "purple"];

function initialsFor(firstname: string, surname: string) {
  const initials = `${firstname.trim()[0] ?? ""}${surname.trim()[0] ?? ""}`.toUpperCase();
  return initials || "US";
}

function colorFor(id: string): CampusPerson["avatarColor"] {
  let hash = 0;
  for (const char of id) hash = (hash + char.charCodeAt(0)) % avatarColors.length;
  return avatarColors[hash];
}

function formatWhen(value: Date | null) {
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

export const getSchoolAdminPeople = cache(async (): Promise<CampusPerson[]> => {
  await connection();

  const [educators, parents] = await Promise.all([
    prisma.user.findMany({
      where: { role: "EDUCATOR" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstname: true,
        surname: true,
        email: true,
        status: true,
        lastActive: true,
        createdAt: true,
        school: { select: { name: true } },
      },
    }),
    prisma.parent.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstname: true,
        surname: true,
        email: true,
        status: true,
        studentName: true,
        relationship: true,
        lastCommunication: true,
        createdAt: true,
        school: { select: { name: true } },
      },
    }),
  ]);

  const people = [
    ...educators.map((user) => ({
      createdAt: user.createdAt.getTime(),
      person: {
        id: user.id,
        name: `${user.firstname} ${user.surname}`.trim(),
        email: user.email,
        initials: initialsFor(user.firstname, user.surname),
        role: "Educator" as const,
        detail: user.school?.name ?? "Unassigned",
        status: statusLabels[user.status],
        lastActive: formatWhen(user.lastActive),
        avatarColor: colorFor(user.id),
      },
    })),
    ...parents.map((parent) => ({
      createdAt: parent.createdAt.getTime(),
      person: {
        id: parent.id,
        name: `${parent.firstname} ${parent.surname}`.trim(),
        email: parent.email,
        initials: initialsFor(parent.firstname, parent.surname),
        role: "Parent" as const,
        detail: parent.studentName
          ? `${relationshipLabels[parent.relationship]} of ${parent.studentName}`
          : relationshipLabels[parent.relationship],
        status: statusLabels[parent.status],
        lastActive: formatWhen(parent.lastCommunication),
        avatarColor: colorFor(parent.id),
      },
    })),
  ];

  return people.sort((left, right) => right.createdAt - left.createdAt).map((entry) => entry.person);
});

export type SchoolClassOption = {
  id: string;
  name: string;
  grade: string | null;
  educator: string;
  studentCount: number;
};

export const getSchoolAdminClasses = cache(async (): Promise<SchoolClassOption[]> => {
  await connection();

  const classes = await prisma.class.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      grade: true,
      educator: { select: { firstname: true, surname: true } },
      _count: { select: { students: true } },
    },
  });

  return classes.map((schoolClass) => ({
    id: schoolClass.id,
    name: schoolClass.name,
    grade: schoolClass.grade,
    educator: schoolClass.educator
      ? `${schoolClass.educator.firstname} ${schoolClass.educator.surname}`.trim()
      : "Unassigned",
    studentCount: schoolClass._count.students,
  }));
});

export const getSchoolAdminStudents = cache(async (): Promise<CampusStudent[]> => {
  await connection();

  const students = await prisma.student.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      firstname: true,
      surname: true,
      email: true,
      status: true,
      createdAt: true,
      school: { select: { name: true } },
      parents: { select: { firstname: true, surname: true } },
      user: { select: { lastActive: true } },
    },
  });

  return students.map((student) => {
    const guardians = student.parents
      .map((parent) => `${parent.firstname} ${parent.surname}`.trim())
      .filter(Boolean);

    return {
      id: student.id,
      name: `${student.firstname} ${student.surname}`.trim(),
      email: student.email ?? "",
      initials: initialsFor(student.firstname, student.surname),
      school: student.school?.name ?? "Unassigned",
      guardians: guardians.length > 0 ? guardians.join(", ") : "No guardian linked",
      status: statusLabels[student.status],
      lastActive: formatWhen(student.user?.lastActive ?? student.createdAt),
      avatarColor: colorFor(student.id),
    };
  });
});
