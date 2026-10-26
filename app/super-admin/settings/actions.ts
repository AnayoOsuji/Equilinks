"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { sidebarProfile, type SidebarProfile } from "@/lib/sidebar-profile";
import prisma from "@/lib/prisma";

export type SuperAdminAccount = {
  firstname: string;
  surname: string;
  email: string;
  avatar?: string;
};

export type SettingsResult =
  | { ok: true; account: SuperAdminAccount; profile: SidebarProfile }
  | { ok: false; error: string };

function toAccount(user: {
  firstname: string;
  surname: string;
  email: string;
  avatar: string | null;
  role: "SUPER_ADMIN";
}): { account: SuperAdminAccount; profile: SidebarProfile } {
  return {
    account: {
      firstname: user.firstname,
      surname: user.surname,
      email: user.email,
      avatar: user.avatar ?? undefined,
    },
    profile: sidebarProfile(user),
  };
}

export async function updateSuperAdminProfile(input: SuperAdminAccount): Promise<SettingsResult> {
  const user = await requireSuperAdmin("/super-admin/settings");
  const firstname = input.firstname.trim();
  const surname = input.surname.trim();
  const email = input.email.trim().toLowerCase();
  const avatar = input.avatar?.trim() ?? "";

  if (!firstname || !surname || !email) {
    return { ok: false, error: "First name, surname, and email are required." };
  }

  try {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        firstname,
        surname,
        email,
        avatar: avatar || null,
      },
      select: { firstname: true, surname: true, email: true, avatar: true, role: true },
    });

    revalidatePath("/super-admin/settings");
    revalidatePath("/super-admin");
    revalidatePath("/super-admin/users");
    revalidatePath("/super-admin/schools");

    if (updated.role !== "SUPER_ADMIN") {
      return { ok: false, error: "This account is no longer a super admin." };
    }

    return { ok: true, ...toAccount({ ...updated, role: "SUPER_ADMIN" }) };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, error: "Another account already uses this email." };
    }
    throw error;
  }
}

export async function updateSuperAdminPassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requireSuperAdmin("/super-admin/settings");
  const currentPassword = input.currentPassword;
  const newPassword = input.newPassword.trim();

  if (!currentPassword || !newPassword) {
    return { ok: false, error: "Enter your current password and a new password." };
  }
  if (newPassword.length < 8) {
    return { ok: false, error: "Use at least 8 characters for the new password." };
  }

  const stored = await prisma.user.findUnique({
    where: { id: user.id },
    select: { password: true },
  });

  const matches = await verifyPassword(currentPassword, stored?.password);
  if (!matches) {
    return { ok: false, error: "Current password is incorrect." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { password: await hashPassword(newPassword) },
  });

  return { ok: true };
}
