"use server";

import { Prisma } from "@prisma/client";
import type { UserStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { campus, type PersonStatus } from "@/app/school-admin/data";
import prisma from "@/lib/prisma";

const statusValues: Record<PersonStatus, UserStatus> = {
  Active: "ACTIVE",
  "Pending Invite": "PENDING_INVITE",
  Inactive: "INACTIVE",
};

export type CreateSchoolStudentInput = {
  firstname: string;
  surname: string;
  email: string;
  status: PersonStatus;
  classId: string;
};

export type CreateSchoolStudentResult = { ok: true } | { ok: false; error: string };

export async function createSchoolAdminStudent(
  input: CreateSchoolStudentInput,
): Promise<CreateSchoolStudentResult> {
  const firstname = input.firstname.trim();
  const surname = input.surname.trim();
  const email = input.email.trim().toLowerCase();
  const status = statusValues[input.status];
  const classId = input.classId.trim();

  if (!firstname || !surname) {
    return { ok: false, error: "First name and surname are required." };
  }
  if (!status) {
    return { ok: false, error: "Choose a valid status." };
  }

  try {
    const school = await prisma.school.findFirst({
      where: { name: campus.name },
      select: { id: true },
    });
    const selectedClass = classId
      ? await prisma.class.findFirst({
          where: { id: classId, ...(school ? { schoolId: school.id } : {}) },
          select: { id: true, schoolId: true },
        })
      : null;

    if (classId && !selectedClass) {
      return { ok: false, error: "Choose a class at this school." };
    }

    await prisma.student.create({
      data: {
        firstname,
        surname,
        email: email || null,
        status,
        schoolId: selectedClass?.schoolId ?? school?.id ?? null,
        classId: selectedClass?.id ?? null,
      },
    });

    revalidatePath("/school-admin");
    revalidatePath("/school-admin/students");
    return { ok: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, error: "A student with this email already exists." };
    }
    throw error;
  }
}
