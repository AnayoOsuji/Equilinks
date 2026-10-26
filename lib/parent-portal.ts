import "server-only";

import prisma from "@/lib/prisma";
import { displayAvatar } from "@/lib/avatar";
import { emotionalStateLabel, type EmotionalStateLabel } from "@/lib/emotional-state";
import type { ActivityContextId, EnergyLevelId, IncidentMoodId } from "@/lib/incident";
import { sidebarProfile, type SidebarProfile } from "@/lib/sidebar-profile";

export type ParentChild = {
  id: string;
  name: string;
  firstname: string;
  initials: string;
  avatar?: string;
  className: string;
  educatorName: string | null;
  schoolName: string;
};

export type ParentSchoolCheckIn = {
  id: string;
  state: EmotionalStateLabel;
  note: string | null;
  recordedAt: string;
};

export type ParentSchoolIncident = {
  id: string;
  mood: IncidentMoodId;
  energy: EnergyLevelId;
  activity: ActivityContextId;
  recordedAt: string;
};

export type ParentHomeIncident = {
  id: string;
  mood: IncidentMoodId;
  energy: EnergyLevelId | null;
  note: string | null;
  occurredAt: string;
  seen: boolean;
};

export type ParentDashboard = {
  firstname: string;
  child: ParentChild | null;
  checkIns: ParentSchoolCheckIn[];
  schoolIncidents: ParentSchoolIncident[];
  homeIncidents: ParentHomeIncident[];
};

export async function getParentSidebar(userId: string): Promise<{
  profile: SidebarProfile;
  schoolName: string;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstname: true, surname: true, avatar: true, school: { select: { name: true } } },
  });

  return {
    profile: sidebarProfile({
      firstname: user?.firstname ?? "",
      surname: user?.surname ?? "",
      role: "PARENT",
      avatar: displayAvatar(user?.avatar),
    }),
    schoolName: user?.school?.name ?? "Your school",
  };
}

export async function getParentDashboard(userId: string): Promise<ParentDashboard> {
  const parent = await prisma.parent.findUnique({
    where: { userId },
    select: {
      id: true,
      firstname: true,
      student: {
        select: {
          id: true,
          firstname: true,
          surname: true,
          avatar: true,
          school: { select: { name: true } },
          class: {
            select: {
              name: true,
              educator: { select: { firstname: true, surname: true } },
            },
          },
        },
      },
    },
  });

  if (!parent) {
    return { firstname: "", child: null, checkIns: [], schoolIncidents: [], homeIncidents: [] };
  }

  const student = parent.student;
  if (!student) {
    return { firstname: parent.firstname, child: null, checkIns: [], schoolIncidents: [], homeIncidents: [] };
  }

  const [checkIns, schoolIncidents, homeIncidents] = await Promise.all([
    prisma.emotionalCheckIn.findMany({
      where: { studentId: student.id },
      orderBy: { recordedAt: "desc" },
      take: 6,
      select: { id: true, state: true, note: true, recordedAt: true },
    }),
    prisma.incident.findMany({
      where: { studentId: student.id },
      orderBy: { recordedAt: "desc" },
      take: 6,
      select: { id: true, mood: true, energy: true, activity: true, recordedAt: true },
    }),
    prisma.homeIncident.findMany({
      where: { studentId: student.id, parentId: parent.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        mood: true,
        energy: true,
        note: true,
        occurredAt: true,
        _count: { select: { reads: true } },
      },
    }),
  ]);

  const educator = student.class?.educator;

  return {
    firstname: parent.firstname,
    child: {
      id: student.id,
      name: `${student.firstname} ${student.surname}`.trim(),
      firstname: student.firstname,
      initials: `${student.firstname[0] ?? ""}${student.surname[0] ?? ""}`.toUpperCase() || "ST",
      avatar: displayAvatar(student.avatar),
      className: student.class?.name ?? "No class yet",
      educatorName: educator ? `${educator.firstname} ${educator.surname}`.trim() : null,
      schoolName: student.school?.name ?? "Your school",
    },
    checkIns: checkIns.map((row) => ({
      id: row.id,
      state: emotionalStateLabel(row.state),
      note: row.note,
      recordedAt: row.recordedAt.toISOString(),
    })),
    schoolIncidents: schoolIncidents.map((row) => ({
      id: row.id,
      mood: row.mood,
      energy: row.energy,
      activity: row.activity,
      recordedAt: row.recordedAt.toISOString(),
    })),
    homeIncidents: homeIncidents.map((row) => ({
      id: row.id,
      mood: row.mood,
      energy: row.energy,
      note: row.note,
      occurredAt: row.occurredAt.toISOString(),
      seen: row._count.reads > 0,
    })),
  };
}
