import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { dashboardForRole, safeDashboardPath, type SessionRole } from "@/lib/auth-paths";
import { MAX_AVATAR_LENGTH } from "@/lib/avatar";
import prisma from "@/lib/prisma";
import { decryptSession, SESSION_COOKIE } from "@/lib/session-token";

export type SignedInUser = {
  id: string;
  firstname: string;
  surname: string;
  avatar?: string;
  role: SessionRole;
};

export const getSignedInUser = cache(async (): Promise<SignedInUser | null> => {
  await connection();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await decryptSession(token);
  if (!session) return null;

  const rows = await prisma.$queryRaw<
    Array<{
      id: string;
      firstname: string;
      surname: string;
      avatar: string | null;
      role: SessionRole;
      status: string;
    }>
  >`
    SELECT id, firstname, surname, role::text AS role, status::text AS status,
      CASE
        WHEN avatar IS NULL OR octet_length(avatar) > ${MAX_AVATAR_LENGTH} THEN NULL
        ELSE avatar
      END AS avatar
    FROM users
    WHERE id = ${session.userId}
    LIMIT 1
  `;
  const user = rows[0];

  if (!user || user.status !== "ACTIVE") return null;

  return {
    id: user.id,
    firstname: user.firstname,
    surname: user.surname,
    avatar: user.avatar ?? undefined,
    role: user.role,
  };
});

export async function requireRoles(roles: SessionRole[], nextPath: string) {
  const user = await getSignedInUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(safeDashboardPath(roles[0], nextPath))}`);
  }
  if (!roles.includes(user.role)) {
    redirect(dashboardForRole(user.role));
  }
  return user;
}

export async function requireSuperAdmin(nextPath = "/super-admin") {
  return requireRoles(["SUPER_ADMIN"], nextPath);
}
