import "server-only";

import { cookies } from "next/headers";
import type { SessionRole } from "@/lib/auth-paths";
import { encryptSession, sessionExpiry, SESSION_COOKIE } from "@/lib/session-token";

export async function createSession(userId: string, role: SessionRole) {
  const expires = sessionExpiry();
  const session = await encryptSession(userId, role);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
