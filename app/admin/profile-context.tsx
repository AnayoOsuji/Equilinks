"use client";

import { useAdminShell } from "./shell";

export function useAdminProfile() {
  return useAdminShell()?.profile ?? null;
}
