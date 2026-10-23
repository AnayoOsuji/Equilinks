"use server";

import { Prisma } from "@prisma/client";
import type { UserStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { campus, type CampusPerson, type PersonStatus } from "@/app/school-admin/data";
import { createAdminUser } from "@/app/admin/users/actions";
import prisma from "@/lib/prisma";

const statusValues: Record<PersonStatus, UserStatus> = {
  Active: "ACTIVE",
  "Pending Invite": "PENDING_INVITE",
  Inactive: "INACTIVE",
};

export type CreateSchoolUserInput = {
  firstname: string;
  surname: string;
  email: string;
  password?: string;
  role: CampusPerson["role"];
  status: PersonStatus;
};

export type CreateSchoolUserResult = { ok: true } | { ok: false; error: string };

export async function createSchoolAdminPerson(input: CreateSchoolUserInput): Promise<CreateSchoolUserResult> {
  const firstname = input.firstname.trim();
  const surname = input.surname.trim();
  const email = input.email.trim().toLowerCase();
  const status = statusValues[input.status];

  if (!firstname || !surname || !email) {
    return { ok: false, error: "First name, surname, and email are required." };
  }
  if (!status || (input.role !== "Educator" && input.role !== "Parent")) {
    return { ok: false, error: "Choose a valid role and status." };
  }

  try {
    if (input.role === "Educator") {
      if (!input.password?.trim()) {
        return { ok: false, error: "A password is required for an educator account." };
      }
      const created = await createAdminUser({
        firstname,
        surname,
        email,
        password: input.password,
        school: campus.name,
        role: "Educator",
        status: input.status,
      });
      if (!created.ok) return created;
    } else {
      const school = await prisma.school.findFirst({
        where: { name: campus.name },
        select: { id: true },
      });
      await prisma.parent.create({
        data: {
          firstname,
          surname,
          email,
          status,
          studentName: "Unassigned",
          relationship: "GUARDIAN",
          schoolId: school?.id ?? null,
          lastCommunication: new Date(),
        },
      });
    }

    revalidatePath("/school-admin");
    revalidatePath("/school-admin/users");
    revalidatePath("/school-admin/users/educators");
    revalidatePath("/school-admin/users/parents");
    return { ok: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, error: "A user with this email already exists." };
    }
    throw error;
  }
}
