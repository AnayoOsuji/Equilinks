"use server";

import { Prisma } from "@prisma/client";
import type { UserStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import type { PersonStatus } from "@/app/school-admin/data";
import { storedAvatar } from "@/lib/avatar";
import { getSignedInSchool } from "@/lib/school-admin-users";
import prisma from "@/lib/prisma";

const statusValues: Record<PersonStatus, UserStatus> = {
  Active: "ACTIVE",
  "Pending Invite": "PENDING_INVITE",
  Inactive: "INACTIVE",
};

export type CreateSchoolStudentInput = {
  firstname: string;
  surname: string;
  status: PersonStatus;
  classId: string;
  avatar?: string;
  parentIds: string[];
};

export type CreateSchoolStudentResult = { ok: true } | { ok: false; error: string };

export async function createSchoolAdminStudent(
  input: CreateSchoolStudentInput,
): Promise<CreateSchoolStudentResult> {
  const firstname = input.firstname.trim();
  const surname = input.surname.trim();
  const status = statusValues[input.status];
  const classId = input.classId.trim();

  if (!firstname || !surname) {
    return { ok: false, error: "First name and surname are required." };
  }
  if (!status) {
    return { ok: false, error: "Choose a valid status." };
  }

  try {
    const { schoolId } = await getSignedInSchool();
    if (!schoolId) {
      return { ok: false, error: "Your account is not linked to a school." };
    }
    const selectedClass = classId
      ? await prisma.class.findFirst({
          where: { id: classId, schoolId },
          select: { id: true, schoolId: true },
        })
      : null;

    if (classId && !selectedClass) {
      return { ok: false, error: "Choose a class at this school." };
    }
    const avatar = storedAvatar(input.avatar);
    if (avatar === "too-large") {
      return { ok: false, error: "That photo is too large. Choose a smaller image." };
    }
    const guardians = await guardiansAtSchool(schoolId, input.parentIds ?? []);
    if (!guardians.ok) return guardians;

    const created = await prisma.student.create({
      data: {
        firstname,
        surname,
        avatar,
        status,
        schoolId: selectedClass?.schoolId ?? schoolId,
        classId: selectedClass?.id ?? null,
      },
      select: { id: true },
    });
    await syncStudentGuardians(created.id, schoolId, guardians.ids, `${firstname} ${surname}`.trim());

    revalidateStudents();
    return { ok: true };
  } catch (error) {
    throw error;
  }
}

function revalidateStudents() {
  revalidatePath("/school-admin");
  revalidatePath("/school-admin/students");
  revalidatePath("/school-admin/classes");
  revalidatePath("/school-admin/users");
  revalidatePath("/school-admin/users/parents");
  revalidatePath("/educator");
}

async function guardiansAtSchool(schoolId: string, parentIds: string[]) {
  const ids = [...new Set(parentIds.map((id) => id.trim()).filter(Boolean))];
  if (!ids.length) return { ok: true as const, ids };
  const found = await prisma.parent.findMany({
    where: { id: { in: ids }, schoolId },
    select: { id: true },
  });
  if (found.length !== ids.length) {
    return { ok: false as const, error: "Choose a parent or guardian at this school." };
  }
  return { ok: true as const, ids };
}

async function syncStudentGuardians(
  studentId: string,
  schoolId: string,
  parentIds: string[],
  studentName: string,
) {
  await prisma.parent.updateMany({
    where: {
      studentId,
      schoolId,
      ...(parentIds.length ? { id: { notIn: parentIds } } : {}),
    },
    data: { studentId: null, studentName: "Unassigned" },
  });
  if (!parentIds.length) return;
  await prisma.parent.updateMany({
    where: { id: { in: parentIds }, schoolId },
    data: { studentId, studentName },
  });
}

export async function updateSchoolAdminStudent(
  input: CreateSchoolStudentInput & { id: string },
): Promise<CreateSchoolStudentResult> {
  const id = input.id.trim();
  const firstname = input.firstname.trim();
  const surname = input.surname.trim();
  const status = statusValues[input.status];
  const classId = input.classId.trim();

  if (!id || !firstname || !surname) {
    return { ok: false, error: "First name and surname are required." };
  }
  if (!status) {
    return { ok: false, error: "Choose a valid status." };
  }

  try {
    const { schoolId } = await getSignedInSchool();
    if (!schoolId) {
      return { ok: false, error: "Your account is not linked to a school." };
    }

    const existing = await prisma.student.findFirst({
      where: { id, schoolId },
      select: { id: true },
    });
    if (!existing) {
      return { ok: false, error: "This student is not at your school." };
    }

    const selectedClass = classId
      ? await prisma.class.findFirst({
          where: { id: classId, schoolId },
          select: { id: true },
        })
      : null;
    if (classId && !selectedClass) {
      return { ok: false, error: "Choose a class at this school." };
    }
    const avatar = storedAvatar(input.avatar);
    if (avatar === "too-large") {
      return { ok: false, error: "That photo is too large. Choose a smaller image." };
    }
    const guardians = await guardiansAtSchool(schoolId, input.parentIds ?? []);
    if (!guardians.ok) return guardians;

    await prisma.student.update({
      where: { id },
      data: {
        firstname,
        surname,
        avatar,
        status,
        classId: selectedClass?.id ?? null,
      },
    });
    await syncStudentGuardians(id, schoolId, guardians.ids, `${firstname} ${surname}`.trim());

    revalidateStudents();
    return { ok: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { ok: false, error: "This student no longer exists." };
    }
    throw error;
  }
}

export async function deleteSchoolAdminStudent(id: string): Promise<CreateSchoolStudentResult> {
  const studentId = id.trim();
  if (!studentId) return { ok: false, error: "Choose a student to delete." };

  try {
    const { schoolId } = await getSignedInSchool();
    if (!schoolId) {
      return { ok: false, error: "Your account is not linked to a school." };
    }

    const existing = await prisma.student.findFirst({
      where: { id: studentId, schoolId },
      select: { id: true },
    });
    if (!existing) {
      return { ok: false, error: "This student is not at your school." };
    }

    await prisma.parent.updateMany({
      where: { studentId, schoolId },
      data: { studentName: "Unassigned" },
    });
    await prisma.student.delete({ where: { id: studentId } });
    revalidateStudents();
    return { ok: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { ok: false, error: "This student no longer exists." };
    }
    throw error;
  }
}
