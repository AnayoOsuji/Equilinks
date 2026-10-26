"use server";

import { revalidatePath } from "next/cache";
import { requireRoles } from "@/lib/auth";
import { isEnergyLevel, isIncidentMood } from "@/lib/incident";
import prisma from "@/lib/prisma";

export async function reportHomeIncident(input: {
  mood: string;
  energy: string | null;
  note: string;
  occurredAt?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requireRoles(["PARENT"], "/parents");
  if (!isIncidentMood(input.mood)) return { ok: false, error: "Choose how your child is feeling." };
  const energy = input.energy === null ? null : isEnergyLevel(input.energy) ? input.energy : undefined;
  if (energy === undefined) return { ok: false, error: "Choose a valid energy level." };

  const note = input.note.trim();
  if (note.length > 500) return { ok: false, error: "Keep the note under 500 characters." };

  let occurredAt = new Date();
  if (input.occurredAt) {
    const parsed = new Date(input.occurredAt);
    if (Number.isNaN(parsed.getTime())) return { ok: false, error: "Choose a valid time." };
    if (parsed.getTime() > Date.now() + 5 * 60_000) return { ok: false, error: "That time is in the future." };
    occurredAt = parsed;
  }

  const parent = await prisma.parent.findUnique({
    where: { userId: user.id },
    select: { id: true, studentId: true },
  });
  if (!parent?.studentId) {
    return { ok: false, error: "Your account is not linked to a child yet. Contact the school." };
  }

  await prisma.homeIncident.create({
    data: {
      mood: input.mood,
      energy,
      note: note || null,
      occurredAt,
      studentId: parent.studentId,
      parentId: parent.id,
    },
  });

  revalidatePath("/parents");
  return { ok: true };
}
