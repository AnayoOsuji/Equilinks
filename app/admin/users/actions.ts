"use server";

import { Prisma } from "@prisma/client";
import type { Role, UserStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { storedAvatar } from "@/lib/avatar";
import { hashPassword } from "@/lib/password";
import { requireRoles } from "@/lib/auth";
import { parentSelect, toAdminParent, toAdminUser, userSelect, type AdminUser } from "@/lib/admin-users";

type AccountRole = Exclude<AdminUser["role"], "Parent">;

const roleValues: Record<AccountRole, Role> = {
  "School Admin": "SCHOOL_ADMIN",
  "Equilinks Admin": "EQUILINKS_ADMIN",
  "Super Admin": "SUPER_ADMIN",
  Educator: "EDUCATOR",
  Specialist: "SPECIALIST",
  Student: "STUDENT",
};

function isAccountRole(role: AdminUser["role"]): role is AccountRole {
  return role !== "Parent";
}

const statusValues: Record<AdminUser["status"], UserStatus> = {
  Active: "ACTIVE",
  "Pending Invite": "PENDING_INVITE",
  Inactive: "INACTIVE",
};

const superAdminDenied = {
  ok: false as const,
  error: "Only a super admin can create or change a super admin account.",
};

async function requireUserManager() {
  return requireRoles(["EQUILINKS_ADMIN", "SUPER_ADMIN"], "/admin/users");
}

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
  const actor = await requireUserManager();
  const firstname = input.firstname.trim();
  const surname = input.surname.trim();
  const email = input.email.trim().toLowerCase();
  const status = statusValues[input.status];

  if (!firstname || !surname || !email || !input.password) {
    return { ok: false, error: "First name, surname, email, and password are required." };
  }
  if (!isAccountRole(input.role) || !status) {
    return { ok: false, error: "Choose a valid role and status." };
  }
  const role = roleValues[input.role];
  if (role === "SUPER_ADMIN" && actor.role !== "SUPER_ADMIN") return superAdminDenied;
  const avatar = storedAvatar(input.avatar);
  if (avatar === "too-large") {
    return { ok: false, error: "That photo is too large. Choose a smaller image." };
  }

  try {
    const created = await prisma.user.create({
      data: {
        firstname,
        surname,
        email,
        password: await hashPassword(input.password),
        avatar,
        role,
        status,
        schoolId: await resolveSchoolId(input.school),
        lastActive: new Date(),
      },
      select: userSelect,
    });

    revalidateUserPaths();
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
  const actor = await requireUserManager();
  const firstname = input.firstname.trim();
  const surname = input.surname.trim();
  const email = input.email.trim().toLowerCase();
  const status = statusValues[input.status];
  const password = input.password?.trim() ?? "";

  if (!input.id || !firstname || !surname || !email) {
    return { ok: false, error: "First name, surname, and email are required." };
  }
  if (!status || (input.role !== "Parent" && !isAccountRole(input.role))) {
    return { ok: false, error: "Choose a valid role and status." };
  }
  const existing = await prisma.user.findUnique({ where: { id: input.id }, select: { role: true } });
  const role = input.role === "Parent" ? null : roleValues[input.role];
  if (
    actor.role !== "SUPER_ADMIN" &&
    (existing?.role === "SUPER_ADMIN" || role === "SUPER_ADMIN")
  ) {
    return superAdminDenied;
  }
  if (input.role === "Parent") {
    return updateParentAccount(input, status);
  }
  if (!role) return { ok: false, error: "Choose a valid role and status." };
  const avatar = input.avatar === undefined ? undefined : storedAvatar(input.avatar);
  if (avatar === "too-large") {
    return { ok: false, error: "That photo is too large. Choose a smaller image." };
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
        ...(avatar !== undefined ? { avatar } : {}),
      },
      select: userSelect,
    });

    revalidateUserPaths();
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

async function updateParentAccount(
  input: UpdateAdminUserInput,
  status: UserStatus,
): Promise<CreateAdminUserResult> {
  const avatar = input.avatar === undefined ? undefined : storedAvatar(input.avatar);
  if (avatar === "too-large") {
    return { ok: false, error: "That photo is too large. Choose a smaller image." };
  }
  try {
    const updated = await prisma.parent.update({
      where: { id: input.id },
      data: {
        firstname: input.firstname.trim(),
        surname: input.surname.trim(),
        email: input.email.trim().toLowerCase(),
        status,
        schoolId: await resolveSchoolId(input.school),
        ...(avatar !== undefined ? { avatar } : {}),
      },
      select: parentSelect,
    });

    revalidateUserPaths();
    return { ok: true, user: toAdminParent(updated) };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { ok: false, error: "This parent no longer exists." };
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, error: "A user with this email already exists." };
    }
    throw error;
  }
}

function revalidateUserPaths() {
  revalidatePath("/admin/users");
  revalidatePath("/super-admin/users");
  revalidatePath("/school-admin/users");
  revalidatePath("/school-admin/users/parents");
}

export async function deleteAdminUser(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const actor = await requireUserManager();
  if (!id) return { ok: false, error: "Choose a user to delete." };

  try {
    const parent = await prisma.parent.findUnique({ where: { id }, select: { id: true } });
    if (parent) {
      await prisma.parent.delete({ where: { id } });
    } else {
      const existing = await prisma.user.findUnique({ where: { id }, select: { role: true } });
      if (existing?.role === "SUPER_ADMIN" && actor.role !== "SUPER_ADMIN") return superAdminDenied;
      await prisma.user.delete({ where: { id } });
    }
    revalidateUserPaths();
    return { ok: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { ok: false, error: "This user no longer exists." };
    }
    throw error;
  }
}
