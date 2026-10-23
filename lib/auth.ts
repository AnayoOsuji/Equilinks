import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { safeSuperAdminPath } from "@/lib/auth-paths";
import prisma from "@/lib/prisma";
import { decryptSession, SESSION_COOKIE } from "@/lib/session-token";

export type SuperAdminProfile = {
  id: string;
  firstname: string;
  surname: string;
};

type SuperAdminAccess =
  | { status: "ok"; user: SuperAdminProfile }
  | { status: "anonymous" | "forbidden" };

export const getSuperAdminAccess = cache(async (): Promise<SuperAdminAccess> => {
  await connection();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await decryptSession(token);
  if (!session) return { status: "anonymous" };

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      firstname: true,
      surname: true,
      role: true,
      status: true,
    },
  });

  if (!user || user.role !== "SUPER_ADMIN" || user.status !== "ACTIVE") {
    return { status: "forbidden" };
  }

  return {
    status: "ok",
    user: {
      id: user.id,
      firstname: user.firstname,
      surname: user.surname,
    },
  };
});

export async function requireSuperAdmin(nextPath = "/super-admin") {
  const access = await getSuperAdminAccess();
  if (access.status === "ok") return access.user;

  const next = encodeURIComponent(safeSuperAdminPath(nextPath));
  if (access.status === "forbidden") {
    redirect(`/login?error=forbidden&next=${next}`);
  }
  redirect(`/login?next=${next}`);
}
