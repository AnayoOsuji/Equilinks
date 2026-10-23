"use server";

import { redirect } from "next/navigation";
import { safeSuperAdminPath } from "@/lib/auth-paths";
import { verifyPassword } from "@/lib/password";
import prisma from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";

const DUMMY_PASSWORD_HASH = `scrypt:${"0".repeat(32)}:${"0".repeat(128)}`;

export type LoginState = {
  error?: string;
  email?: string;
};

export async function login(_state: LoginState | undefined, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeSuperAdminPath(String(formData.get("next") ?? ""));

  if (!email || !password) {
    return { error: "Enter your email and password.", email };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      password: true,
      role: true,
      status: true,
    },
  });

  const passwordMatches = await verifyPassword(password, user?.password ?? DUMMY_PASSWORD_HASH);
  if (!user || !user.password || !passwordMatches || user.status !== "ACTIVE") {
    return { error: "Email or password is incorrect.", email };
  }

  if (user.role !== "SUPER_ADMIN") {
    return { error: "Only a Super Admin account can open this dashboard.", email };
  }

  await createSession(user.id);
  redirect(next);
}

export async function signOut() {
  await deleteSession();
  redirect("/login");
}
