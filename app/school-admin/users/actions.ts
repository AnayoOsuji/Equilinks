"use server";

import { Prisma } from "@prisma/client";
import type { UserStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import type { CampusPerson, PersonStatus } from "@/app/school-admin/data";
import { requireRoles } from "@/lib/auth";
import { storedAvatar } from "@/lib/avatar";
import { hashPassword } from "@/lib/password";
import { getSignedInSchool } from "@/lib/school-admin-users";
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
  avatar?: string;
};

export type CreateSchoolUserResult = { ok: true } | { ok: false; error: string };

export async function createSchoolAdminPerson(input: CreateSchoolUserInput): Promise<CreateSchoolUserResult> {
  await requireRoles(["SCHOOL_ADMIN"], "/school-admin/users");
  const firstname = input.firstname.trim();
  const surname = input.surname.trim();
  const email = input.email.trim().toLowerCase();
  const status = statusValues[input.status];
  const avatar = storedAvatar(input.avatar);
  if (avatar === "too-large") {
    return { ok: false, error: "That photo is too large. Choose a smaller image." };
  }
  const { schoolId } = await getSignedInSchool();

  if (!firstname || !surname || !email) {
    return { ok: false, error: "First name, surname, and email are required." };
  }
  if (!status || (input.role !== "Educator" && input.role !== "Parent")) {
    return { ok: false, error: "Choose a valid role and status." };
  }
  if (!schoolId) return { ok: false, error: "Your account is not linked to a school." };

  try {
    if (input.role === "Educator") {
      if (!input.password?.trim()) {
        return { ok: false, error: "A password is required for an educator account." };
      }
      await prisma.user.create({
        data: {
          firstname,
          surname,
          email,
          password: await hashPassword(input.password),
          role: "EDUCATOR",
          status,
          avatar,
          schoolId,
          lastActive: new Date(),
        },
      });
    } else {
      const password = input.password?.trim() ?? "";
      if (password && password.length < 8) {
        return { ok: false, error: "Password must be at least 8 characters." };
      }
      const hashed = password ? await hashPassword(password) : null;
      await prisma.$transaction(async (tx) => {
        const account = hashed
          ? await tx.user.create({
              data: { firstname, surname, email, password: hashed, role: "PARENT", status, avatar, schoolId },
              select: { id: true },
            })
          : null;
        await tx.parent.create({
          data: {
            firstname,
            surname,
            email,
            status,
            avatar,
            studentName: "Unassigned",
            relationship: "GUARDIAN",
            schoolId,
            lastCommunication: new Date(),
            userId: account?.id ?? null,
          },
        });
      });
    }

    revalidateSchoolUsers();
    return { ok: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, error: "A user with this email already exists." };
    }
    throw error;
  }
}

export type UpdateSchoolUserInput = CreateSchoolUserInput & { id: string };

export async function updateSchoolAdminPerson(input: UpdateSchoolUserInput): Promise<CreateSchoolUserResult> {
  await requireRoles(["SCHOOL_ADMIN"], "/school-admin/users");
  const firstname = input.firstname.trim();
  const surname = input.surname.trim();
  const email = input.email.trim().toLowerCase();
  const status = statusValues[input.status];
  const password = input.password?.trim() ?? "";
  const avatar = storedAvatar(input.avatar);
  if (avatar === "too-large") {
    return { ok: false, error: "That photo is too large. Choose a smaller image." };
  }

  if (!input.id || !firstname || !surname || !email) {
    return { ok: false, error: "First name, surname, and email are required." };
  }
  if (!status || (input.role !== "Educator" && input.role !== "Parent")) {
    return { ok: false, error: "Choose a valid role and status." };
  }
  if (password && password.length < 8) {
    return { ok: false, error: "New password must be at least 8 characters." };
  }
  const { schoolId } = await getSignedInSchool();
  if (!schoolId) return { ok: false, error: "Your account is not linked to a school." };

  try {
    if (input.role === "Educator") {
      const existing = await prisma.user.findFirst({
        where: { id: input.id, role: "EDUCATOR", schoolId },
        select: { id: true },
      });
      if (!existing) return { ok: false, error: "This educator no longer exists." };
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          firstname,
          surname,
          email,
          status,
          avatar,
          ...(password ? { password: await hashPassword(password) } : {}),
        },
      });
    } else {
      const existing = await prisma.parent.findFirst({
        where: { id: input.id, schoolId },
        select: { id: true, userId: true },
      });
      if (!existing) return { ok: false, error: "This parent no longer exists." };
      const hashed = password ? await hashPassword(password) : null;
      await prisma.$transaction(async (tx) => {
        let userId = existing.userId;
        if (userId) {
          await tx.user.update({
            where: { id: userId },
            data: { firstname, surname, email, status, avatar, ...(hashed ? { password: hashed } : {}) },
          });
        } else if (hashed) {
          const account = await tx.user.create({
            data: { firstname, surname, email, password: hashed, role: "PARENT", status, avatar, schoolId },
            select: { id: true },
          });
          userId = account.id;
        }
        await tx.parent.update({
          where: { id: existing.id },
          data: { firstname, surname, email, status, avatar, userId },
        });
      });
    }

    revalidateSchoolUsers();
    return { ok: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { ok: false, error: "This user no longer exists." };
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, error: "A user with this email already exists." };
    }
    throw error;
  }
}

export async function deleteSchoolAdminPerson(input: {
  id: string;
  role: CampusPerson["role"];
}): Promise<CreateSchoolUserResult> {
  await requireRoles(["SCHOOL_ADMIN"], "/school-admin/users");
  if (!input.id) return { ok: false, error: "Choose a user to delete." };
  const { schoolId } = await getSignedInSchool();
  if (!schoolId) return { ok: false, error: "Your account is not linked to a school." };

  try {
    if (input.role === "Educator") {
      const existing = await prisma.user.findFirst({
        where: { id: input.id, role: "EDUCATOR", schoolId },
        select: { id: true },
      });
      if (!existing) return { ok: false, error: "This educator no longer exists." };
      await prisma.user.delete({ where: { id: existing.id } });
    } else if (input.role === "Parent") {
      const existing = await prisma.parent.findFirst({
        where: { id: input.id, schoolId },
        select: { id: true, userId: true },
      });
      if (!existing) return { ok: false, error: "This parent no longer exists." };
      await prisma.$transaction(async (tx) => {
        await tx.parent.delete({ where: { id: existing.id } });
        if (existing.userId) {
          await tx.user.deleteMany({ where: { id: existing.userId, role: "PARENT" } });
        }
      });
    } else {
      return { ok: false, error: "Choose a valid user to delete." };
    }

    revalidateSchoolUsers();
    return { ok: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { ok: false, error: "This user no longer exists." };
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return { ok: false, error: "This account is still linked to other records." };
    }
    throw error;
  }
}

function revalidateSchoolUsers() {
  revalidatePath("/school-admin");
  revalidatePath("/school-admin/users");
  revalidatePath("/school-admin/users/educators");
  revalidatePath("/school-admin/users/parents");
}
