"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { campus } from "@/app/school-admin/data";
import prisma from "@/lib/prisma";

export type CreateSchoolClassInput = {
  name: string;
  grade: string;
  educatorId: string;
};

export type CreateSchoolClassResult = { ok: true } | { ok: false; error: string };

async function campusSchoolId() {
  const existing = await prisma.school.findFirst({
    where: { name: campus.name },
    select: { id: true },
  });
  if (existing) return existing.id;

  const created = await prisma.school.create({
    data: {
      name: campus.name,
      type: campus.type,
      address: "",
      email: "",
      phone: "",
    },
    select: { id: true },
  });
  return created.id;
}

export async function createSchoolAdminClass(input: CreateSchoolClassInput): Promise<CreateSchoolClassResult> {
  const name = input.name.trim();
  const grade = input.grade.trim();
  const educatorId = input.educatorId.trim();

  if (!name) {
    return { ok: false, error: "Class name is required." };
  }

  try {
    const schoolId = await campusSchoolId();
    const educator = educatorId
      ? await prisma.user.findFirst({
          where: { id: educatorId, role: "EDUCATOR" },
          select: { id: true },
        })
      : null;

    if (educatorId && !educator) {
      return { ok: false, error: "Choose an educator at this school." };
    }

    const duplicate = await prisma.class.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        schoolId,
      },
      select: { id: true },
    });

    if (duplicate) {
      return { ok: false, error: "A class with this name already exists." };
    }

    await prisma.class.create({
      data: {
        name,
        grade: grade || null,
        schoolId,
        ...(educator ? { educatorId: educator.id } : {}),
      },
    });

    revalidatePath("/school-admin");
    revalidatePath("/school-admin/classes");
    revalidatePath("/school-admin/students");
    return { ok: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, error: "A class with this name already exists." };
    }
    if (error instanceof Prisma.PrismaClientValidationError) {
      return { ok: false, error: "The class could not be saved." };
    }
    throw error;
  }
}
