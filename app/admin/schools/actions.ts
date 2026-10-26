"use server";

import { revalidatePath } from "next/cache";
import { requireRoles } from "@/lib/auth";
import { getDirectorySchools, schoolCode, schoolSelect, toDirectorySchool, type DirectorySchool } from "@/lib/admin-schools";
import prisma from "@/lib/prisma";

export type CreateSchoolInput = {
  name: string;
  address: string;
  email: string;
  phone: string;
  logo?: string;
};

export type CreateSchoolResult =
  | { ok: true; school: DirectorySchool }
  | { ok: false; error: string };

async function requireSchoolAdmin() {
  await requireRoles(["EQUILINKS_ADMIN", "SUPER_ADMIN"], "/admin/schools");
}

export async function listSchools(): Promise<DirectorySchool[]> {
  await requireSchoolAdmin();
  return getDirectorySchools();
}

export async function createSchool(input: CreateSchoolInput): Promise<CreateSchoolResult> {
  await requireSchoolAdmin();

  const name = input.name.trim();
  const address = input.address.trim();
  const email = input.email.trim().toLowerCase();
  const phone = input.phone.trim();
  const logo = input.logo?.trim() ?? "";

  if (!name || !address || !email || !phone) {
    return { ok: false, error: "School name, address, email, and phone are required." };
  }

  const created = await prisma.school.create({
    data: {
      name,
      code: schoolCode(name),
      address,
      email,
      phone,
      logo: logo || null,
      type: "Inclusive Campus",
      status: "ACTIVE",
    },
    select: schoolSelect,
  });

  revalidatePath("/admin/schools");
  revalidatePath("/super-admin/schools");
  revalidatePath("/admin/users");
  revalidatePath("/super-admin/users");

  return { ok: true, school: toDirectorySchool(created) };
}
