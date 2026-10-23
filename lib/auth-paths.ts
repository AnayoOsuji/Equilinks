export function safeSuperAdminPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/super-admin")) return "/super-admin";
  if (value.startsWith("//") || value.includes("\\") || value.includes("://")) {
    return "/super-admin";
  }
  return value;
}
