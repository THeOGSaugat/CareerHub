"use server";

import { clearAuthCookie } from "@/lib/session";

export async function logoutHandler() {
  await clearAuthCookie();
  return {
    success: true,
    redirectTo: "/auth/login",
  };
}
