"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getSignedInSchool } from "@/lib/school-admin-users";
import prisma from "@/lib/prisma";

export type CreateSchoolClassInput = {
  name: string;
  grade: string;
  educatorId: string;
};

export type CreateSchoolClassResult = { ok: true } | { ok: false; error: string };

function revalidateClasses() {
  revalidatePath("/school-admin");
  revalidatePath("/school-admin/classes");
  revalidatePath("/school-admin/students");
  revalidatePath("/educator");
}

async function educatorAtSchool(educatorId: string, schoolId: string) {
  if (!educatorId) return null;
  return prisma.user.findFirst({
    where: { id: educatorId, role: "EDUCATOR", schoolId },
    select: { id: true },
  });
}

export async function createSchoolAdminClass(input: CreateSchoolClassInput): Promise<CreateSchoolClassResult> {
  const name = input.name.trim();
  const grade = input.grade.trim();
  const educatorId = input.educatorId.trim();

  if (!name) {
    return { ok: false, error: "Class name is required." };
  }

  try {
    const { schoolId } = await getSignedInSchool();
    if (!schoolId) {
      return { ok: false, error: "Your account is not linked to a school." };
    }
    const educator = await educatorAtSchool(educatorId, schoolId);

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
        educatorId: educator?.id ?? null,
      },
    });

    revalidateClasses();
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

export async function updateSchoolAdminClass(
  input: CreateSchoolClassInput & { id: string },
): Promise<CreateSchoolClassResult> {
  const id = input.id.trim();
  const name = input.name.trim();
  const grade = input.grade.trim();
  const educatorId = input.educatorId.trim();

  if (!id || !name) {
    return { ok: false, error: "Class name is required." };
  }

  try {
    const { schoolId } = await getSignedInSchool();
    if (!schoolId) {
      return { ok: false, error: "Your account is not linked to a school." };
    }
    const educator = await educatorAtSchool(educatorId, schoolId);
    if (educatorId && !educator) {
      return { ok: false, error: "Choose an educator at this school." };
    }

    const existing = await prisma.class.findFirst({
      where: { id, schoolId },
      select: { id: true },
    });
    if (!existing) {
      return { ok: false, error: "This class is not at your school." };
    }

    const duplicate = await prisma.class.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        schoolId,
        NOT: { id },
      },
      select: { id: true },
    });
    if (duplicate) {
      return { ok: false, error: "A class with this name already exists." };
    }

    await prisma.class.update({
      where: { id },
      data: {
        name,
        grade: grade || null,
        educatorId: educator?.id ?? null,
      },
    });

    revalidateClasses();
    return { ok: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { ok: false, error: "This class no longer exists." };
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, error: "A class with this name already exists." };
    }
    if (error instanceof Prisma.PrismaClientValidationError) {
      return { ok: false, error: "The class could not be saved." };
    }
    throw error;
  }
}

export async function deleteSchoolAdminClass(id: string): Promise<CreateSchoolClassResult> {
  const classId = id.trim();
  if (!classId) return { ok: false, error: "Choose a class to delete." };

  try {
    const { schoolId } = await getSignedInSchool();
    if (!schoolId) {
      return { ok: false, error: "Your account is not linked to a school." };
    }

    const existing = await prisma.class.findFirst({
      where: { id: classId, schoolId },
      select: { id: true },
    });
    if (!existing) {
      return { ok: false, error: "This class is not at your school." };
    }

    await prisma.class.delete({ where: { id: classId } });
    revalidateClasses();
    return { ok: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { ok: false, error: "This class no longer exists." };
    }
    throw error;
  }
}
