"use server";

import { revalidatePath } from "next/cache";
import { requireRoles } from "@/lib/auth";
import {
  educatorCanAccessStudent,
  educatorCanRecord,
  getEducatorNotifications,
  type HomeIncidentNotification,
} from "@/lib/educator-roster";
import { emotionalStateToEnum, isEmotionalStateLabel, type EmotionalStateLabel } from "@/lib/emotional-state";
import {
  isActivityContext,
  isEnergyLevel,
  isIncidentMood,
  type ActivityContextId,
  type EnergyLevelId,
  type IncidentMoodId,
} from "@/lib/incident";
import prisma from "@/lib/prisma";

export async function recordEmotionalState(input: {
  studentId: string;
  state: string;
  note: string;
}): Promise<{ ok: true; recordedAt: string; state: EmotionalStateLabel; note: string | null } | { ok: false; error: string }> {
  const educator = await requireRoles(["EDUCATOR"], "/educator");
  if (!isEmotionalStateLabel(input.state)) {
    return { ok: false, error: "Choose an emotional state." };
  }

  const studentId = input.studentId.trim();
  const allowed = await educatorCanRecord(educator.id, studentId);
  if (!allowed) return { ok: false, error: "That student is not in your classroom." };

  const note = input.note.trim();
  if (note.length > 280) return { ok: false, error: "Keep the note under 280 characters." };

  const checkIn = await prisma.emotionalCheckIn.create({
    data: {
      studentId,
      educatorId: educator.id,
      state: emotionalStateToEnum(input.state),
      note: note || null,
    },
    select: { recordedAt: true, note: true },
  });

  revalidatePath("/educator");
  return {
    ok: true,
    recordedAt: checkIn.recordedAt.toISOString(),
    state: input.state,
    note: checkIn.note,
  };
}

export async function recordIncident(input: {
  studentId: string;
  mood: string;
  energy: string;
  activity: string;
}): Promise<{ ok: true; recordedAt: string } | { ok: false; error: string }> {
  const educator = await requireRoles(["EDUCATOR"], "/educator/students");
  if (!isIncidentMood(input.mood)) return { ok: false, error: "Choose an emotional state." };
  if (!isEnergyLevel(input.energy)) return { ok: false, error: "Choose an energy level." };
  if (!isActivityContext(input.activity)) return { ok: false, error: "Choose an activity." };

  const studentId = input.studentId.trim();
  const allowed = await educatorCanAccessStudent(educator.id, studentId);
  if (!allowed) return { ok: false, error: "That student is not in your classroom." };

  const incident = await prisma.incident.create({
    data: {
      studentId,
      educatorId: educator.id,
      mood: input.mood,
      energy: input.energy,
      activity: input.activity,
    },
    select: { recordedAt: true },
  });

  revalidatePath("/educator/students");
  return { ok: true, recordedAt: incident.recordedAt.toISOString() };
}

export type StudentIncidentItem = {
  id: string;
  source: "school" | "home";
  mood: IncidentMoodId;
  energy: EnergyLevelId | null;
  activity: ActivityContextId | null;
  note: string | null;
  recordedAt: string;
  reporter: string;
};

export async function loadStudentIncidents(
  studentId: string,
): Promise<{ ok: true; incidents: StudentIncidentItem[] } | { ok: false; error: string }> {
  const educator = await requireRoles(["EDUCATOR"], "/educator/students");
  const id = studentId.trim();
  const allowed = await educatorCanAccessStudent(educator.id, id);
  if (!allowed) return { ok: false, error: "That student is not in your classroom." };

  const since = new Date();
  since.setDate(since.getDate() - 40);

  const [school, home] = await Promise.all([
    prisma.incident.findMany({
      where: { studentId: id, recordedAt: { gte: since } },
      orderBy: { recordedAt: "desc" },
      select: {
        id: true,
        mood: true,
        energy: true,
        activity: true,
        recordedAt: true,
        educator: { select: { firstname: true, surname: true } },
      },
    }),
    prisma.homeIncident.findMany({
      where: { studentId: id, occurredAt: { gte: since } },
      orderBy: { occurredAt: "desc" },
      select: {
        id: true,
        mood: true,
        energy: true,
        note: true,
        occurredAt: true,
        parent: { select: { firstname: true, surname: true } },
      },
    }),
  ]);

  if (home.length > 0) {
    await prisma.homeIncidentRead.createMany({
      data: home.map((item) => ({ incidentId: item.id, educatorId: educator.id })),
      skipDuplicates: true,
    });
  }

  const incidents: StudentIncidentItem[] = [
    ...school.map((item) => ({
      id: item.id,
      source: "school" as const,
      mood: item.mood,
      energy: item.energy,
      activity: item.activity,
      note: null,
      recordedAt: item.recordedAt.toISOString(),
      reporter: `${item.educator.firstname} ${item.educator.surname}`.trim(),
    })),
    ...home.map((item) => ({
      id: item.id,
      source: "home" as const,
      mood: item.mood,
      energy: item.energy,
      activity: null,
      note: item.note,
      recordedAt: item.occurredAt.toISOString(),
      reporter: item.parent ? `${item.parent.firstname} ${item.parent.surname}`.trim() : "A parent",
    })),
  ].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));

  return { ok: true, incidents };
}

export async function loadNotifications(): Promise<HomeIncidentNotification[]> {
  const educator = await requireRoles(["EDUCATOR"], "/educator");
  return getEducatorNotifications(educator.id);
}

export async function markNotificationsRead(ids: string[]): Promise<{ ok: boolean }> {
  const educator = await requireRoles(["EDUCATOR"], "/educator");
  const visible = new Set((await getEducatorNotifications(educator.id)).map((item) => item.id));
  const allowed = ids.filter((id) => visible.has(id)).slice(0, 50);
  if (allowed.length === 0) return { ok: true };

  await prisma.homeIncidentRead.createMany({
    data: allowed.map((incidentId) => ({ incidentId, educatorId: educator.id })),
    skipDuplicates: true,
  });
  return { ok: true };
}
