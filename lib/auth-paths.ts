export const SESSION_ROLES = [
  "SCHOOL_ADMIN",
  "EQUILINKS_ADMIN",
  "SUPER_ADMIN",
  "EDUCATOR",
  "SPECIALIST",
  "STUDENT",
] as const;

export type SessionRole = (typeof SESSION_ROLES)[number];

const DASHBOARDS: Record<SessionRole, string> = {
  SUPER_ADMIN: "/super-admin",
  EQUILINKS_ADMIN: "/admin",
  SCHOOL_ADMIN: "/school-admin",
  EDUCATOR: "/home",
  SPECIALIST: "/home",
  STUDENT: "/home",
};

export function isSessionRole(value: unknown): value is SessionRole {
  return typeof value === "string" && (SESSION_ROLES as readonly string[]).includes(value);
}

export function dashboardForRole(role: SessionRole) {
  return DASHBOARDS[role];
}

export function safeInternalPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\") || value.includes("://")) {
    return null;
  }
  return value;
}

function canOpen(role: SessionRole, path: string) {
  const prefixes =
    role === "SUPER_ADMIN"
      ? ["/super-admin", "/admin"]
      : role === "EQUILINKS_ADMIN"
        ? ["/admin"]
        : role === "SCHOOL_ADMIN"
          ? ["/school-admin"]
          : ["/home"];

  return prefixes.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`) || path.startsWith(`${prefix}?`) || path.startsWith(`${prefix}#`),
  );
}

export function safeDashboardPath(role: SessionRole, requested: string | null | undefined) {
  const home = dashboardForRole(role);
  const next = safeInternalPath(requested);
  if (!next || !canOpen(role, next)) return home;
  return next;
}

export function safeSuperAdminPath(value: string | null | undefined) {
  return safeDashboardPath("SUPER_ADMIN", value);
}
