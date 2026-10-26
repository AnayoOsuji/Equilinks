import "server-only";

import prisma from "@/lib/prisma";
import { displayAvatar } from "@/lib/avatar";
import { sidebarProfile, type SidebarProfile } from "@/lib/sidebar-profile";
import { emotionalStateLabel, type EmotionalStateLabel } from "@/lib/emotional-state";
import type { EnergyLevelId, IncidentMoodId } from "@/lib/incident";

export type EducatorStudent = {
  id: string;
  name: string;
  initials: string;
  avatarColor: "green" | "coral" | "blue" | "amber" | "purple";
  className: string;
  state: EmotionalStateLabel | null;
  note: string | null;
  recordedAt: string | null;
};

export type EducatorRoster = {
  scope: "classes" | "school" | "none";
  students: EducatorStudent[];
};

const avatarColors: EducatorStudent["avatarColor"][] = ["green", "coral", "blue", "amber", "purple"];

export type EducatorSchool = {
  name: string;
  type: string;
  logo?: string;
};

export async function getEducatorSidebar(educatorId: string): Promise<{
  profile: SidebarProfile;
  school: EducatorSchool;
}> {
  const educator = await prisma.user.findUnique({
    where: { id: educatorId },
    select: {
      firstname: true,
      surname: true,
      avatar: true,
      role: true,
      school: { select: { name: true, type: true, logo: true } },
    },
  });

  return {
    profile: sidebarProfile({
      firstname: educator?.firstname ?? "",
      surname: educator?.surname ?? "",
      role: educator?.role ?? "EDUCATOR",
      avatar: displayAvatar(educator?.avatar),
    }),
    school: {
      name: educator?.school?.name ?? "Unassigned",
      type: educator?.school?.type || "School",
      logo: displayAvatar(educator?.school?.logo),
    },
  };
}

function initialsFor(firstname: string, surname: string) {
  return `${firstname.trim()[0] ?? ""}${surname.trim()[0] ?? ""}`.toUpperCase() || "ST";
}

function colorFor(id: string): EducatorStudent["avatarColor"] {
  let hash = 0;
  for (const char of id) hash = (hash + char.charCodeAt(0)) % avatarColors.length;
  return avatarColors[hash];
}

export type EducatorDirectoryStudent = {
  id: string;
  name: string;
  initials: string;
  avatarColor: EducatorStudent["avatarColor"];
  avatar?: string;
  className: string;
  guardians: string;
  status: "Active" | "Pending Invite" | "Inactive";
};

async function educatorStudentWhere(educatorId: string) {
  const educator = await prisma.user.findUnique({
    where: { id: educatorId },
    select: { schoolId: true },
  });
  const classes = await prisma.class.findMany({
    where: { educatorId },
    select: { id: true },
  });
  const scope: EducatorRoster["scope"] =
    classes.length > 0 ? "classes" : educator?.schoolId ? "school" : "none";
  const where =
    scope === "classes"
      ? { classId: { in: classes.map((schoolClass) => schoolClass.id) } }
      : scope === "school"
        ? { schoolId: educator?.schoolId }
        : null;

  return { scope, where };
}

function statusLabel(status: "ACTIVE" | "PENDING_INVITE" | "INACTIVE"): EducatorDirectoryStudent["status"] {
  if (status === "PENDING_INVITE") return "Pending Invite";
  if (status === "INACTIVE") return "Inactive";
  return "Active";
}

export async function getEducatorRoster(educatorId: string): Promise<EducatorRoster> {
  const { scope, where } = await educatorStudentWhere(educatorId);
  if (!where) return { scope, students: [] };

  const students = await prisma.student.findMany({
    where: { status: { not: "INACTIVE" }, ...where },
    orderBy: [{ surname: "asc" }, { firstname: "asc" }],
    select: {
      id: true,
      firstname: true,
      surname: true,
      class: { select: { name: true } },
      checkIns: {
        orderBy: { recordedAt: "desc" },
        take: 1,
        select: { state: true, note: true, recordedAt: true },
      },
    },
  });

  const roster: EducatorStudent[] = students.map((student) => {
    const latest = student.checkIns[0];
    return {
      id: student.id,
      name: `${student.firstname} ${student.surname}`.trim(),
      initials: initialsFor(student.firstname, student.surname),
      avatarColor: colorFor(student.id),
      className: student.class?.name ?? "Unassigned",
      state: latest ? emotionalStateLabel(latest.state) : null,
      note: latest?.note ?? null,
      recordedAt: latest ? latest.recordedAt.toISOString() : null,
    };
  });

  return { scope, students: roster };
}

export async function getEducatorStudents(educatorId: string): Promise<EducatorDirectoryStudent[]> {
  const { where } = await educatorStudentWhere(educatorId);
  if (!where) return [];

  const students = await prisma.student.findMany({
    where,
    orderBy: [{ surname: "asc" }, { firstname: "asc" }],
    select: {
      id: true,
      firstname: true,
      surname: true,
      avatar: true,
      status: true,
      class: { select: { name: true } },
      parents: { select: { firstname: true, surname: true } },
    },
  });

  return students.map((student) => {
    const guardians = student.parents
      .map((parent) => `${parent.firstname} ${parent.surname}`.trim())
      .filter(Boolean);

    return {
      id: student.id,
      name: `${student.firstname} ${student.surname}`.trim(),
      initials: initialsFor(student.firstname, student.surname),
      avatarColor: colorFor(student.id),
      avatar: displayAvatar(student.avatar),
      className: student.class?.name ?? "Unassigned",
      guardians: guardians.length > 0 ? guardians.join(", ") : "No guardian linked",
      status: statusLabel(student.status),
    };
  });
}

export async function educatorCanRecord(educatorId: string, studentId: string) {
  const roster = await getEducatorRoster(educatorId);
  return roster.students.some((student) => student.id === studentId);
}

export type HomeIncidentNotification = {
  id: string;
  studentName: string;
  parentName: string;
  mood: IncidentMoodId;
  energy: EnergyLevelId | null;
  note: string | null;
  occurredAt: string;
  read: boolean;
};

export async function getEducatorNotifications(educatorId: string): Promise<HomeIncidentNotification[]> {
  const { where } = await educatorStudentWhere(educatorId);
  if (!where) return [];

  const incidents = await prisma.homeIncident.findMany({
    where: { student: where },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      mood: true,
      energy: true,
      note: true,
      occurredAt: true,
      student: { select: { firstname: true, surname: true } },
      parent: { select: { firstname: true, surname: true } },
      reads: { where: { educatorId }, select: { readAt: true } },
    },
  });

  return incidents.map((incident) => ({
    id: incident.id,
    studentName: `${incident.student.firstname} ${incident.student.surname}`.trim(),
    parentName: incident.parent
      ? `${incident.parent.firstname} ${incident.parent.surname}`.trim()
      : "A parent",
    mood: incident.mood,
    energy: incident.energy,
    note: incident.note,
    occurredAt: incident.occurredAt.toISOString(),
    read: incident.reads.length > 0,
  }));
}

export async function educatorCanAccessStudent(educatorId: string, studentId: string) {
  const { where } = await educatorStudentWhere(educatorId);
  if (!where) return false;
  const student = await prisma.student.findFirst({
    where: { id: studentId, ...where },
    select: { id: true },
  });
  return Boolean(student);
}
