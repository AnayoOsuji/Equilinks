"use server";

import { Prisma } from "@prisma/client";
import type { Role, UserStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { toAdminUser, userSelect, type AdminUser } from "@/lib/admin-users";

const roleValues: Record<AdminUser["role"], Role> = {
  "School Admin": "SCHOOL_ADMIN",
  "Equilinks Admin": "EQUILINKS_ADMIN",
  Educator: "EDUCATOR",
  Specialist: "SPECIALIST",
  Student: "STUDENT",
};

const statusValues: Record<AdminUser["status"], UserStatus> = {
  Active: "ACTIVE",
  "Pending Invite": "PENDING_INVITE",
  Inactive: "INACTIVE",
};

export type CreateAdminUserInput = {
  firstname: string;
  surname: string;
  email: string;
  password: string;
  school: string;
  role: AdminUser["role"];
  status: AdminUser["status"];
  avatar?: string;
};

export type CreateAdminUserResult =
  | { ok: true; user: AdminUser }
  | { ok: false; error: string };

export async function createAdminUser(input: CreateAdminUserInput): Promise<CreateAdminUserResult> {
  const firstname = input.firstname.trim();
  const surname = input.surname.trim();
  const email = input.email.trim().toLowerCase();
  const role = roleValues[input.role];
  const status = statusValues[input.status];

  if (!firstname || !surname || !email || !input.password) {
    return { ok: false, error: "First name, surname, email, and password are required." };
  }
  if (!role || !status) {
    return { ok: false, error: "Choose a valid role and status." };
  }

  try {
    const created = await prisma.user.create({
      data: {
        firstname,
        surname,
        email,
        password: await hashPassword(input.password),
        avatar: input.avatar?.trim() ? input.avatar : null,
        role,
        status,
        schoolId: await resolveSchoolId(input.school),
        lastActive: new Date(),
      },
      select: userSelect,
    });

    revalidatePath("/admin/users");
    return { ok: true, user: toAdminUser(created) };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, error: "A user with this email already exists." };
    }
    throw error;
  }
}

export type UpdateAdminUserInput = {
  id: string;
  firstname: string;
  surname: string;
  email: string;
  password?: string;
  school: string;
  role: AdminUser["role"];
  status: AdminUser["status"];
  avatar?: string;
};

async function resolveSchoolId(schoolName: string) {
  const name = schoolName.trim();
  if (!name || name === "Unassigned") return null;

  const school = await prisma.school.findFirst({
    where: { name },
    select: { id: true },
  });

  return school?.id ?? null;
}

export async function updateAdminUser(input: UpdateAdminUserInput): Promise<CreateAdminUserResult> {
  const firstname = input.firstname.trim();
  const surname = input.surname.trim();
  const email = input.email.trim().toLowerCase();
  const role = roleValues[input.role];
  const status = statusValues[input.status];
  const password = input.password?.trim() ?? "";

  if (!input.id || !firstname || !surname || !email) {
    return { ok: false, error: "First name, surname, and email are required." };
  }
  if (!role || !status) {
    return { ok: false, error: "Choose a valid role and status." };
  }

  try {
    const updated = await prisma.user.update({
      where: { id: input.id },
      data: {
        firstname,
        surname,
        email,
        role,
        status,
        schoolId: await resolveSchoolId(input.school),
        ...(password ? { password: await hashPassword(password) } : {}),
        ...(input.avatar !== undefined
          ? { avatar: input.avatar.trim() ? input.avatar : null }
          : {}),
      },
      select: userSelect,
    });

    revalidatePath("/admin/users");
    return { ok: true, user: toAdminUser(updated) };
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

export async function deleteAdminUser(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!id) return { ok: false, error: "Choose a user to delete." };

  try {
    await prisma.user.delete({ where: { id } });
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { ok: false, error: "This user no longer exists." };
    }
    throw error;
  }
}
