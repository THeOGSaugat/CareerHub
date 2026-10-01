// src/lib/session.js
// ─── Auth Cookie Helpers ──────────────────────────────────────
// The JWT lives only in an httpOnly cookie so client-side scripts
// can never read it. Kept separate from lib/auth.js because
// next/headers is only usable inside route handlers, server
// actions, and server components.

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";

export const AUTH_COOKIE = "auth-token";

// Must match the JWT lifetime in lib/auth.js (1 day)
const MAX_AGE = 60 * 60 * 24;

export async function setAuthCookie(token) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
}

/**
 * Read the logged-in user from the auth cookie (server components).
 * Returns the decoded payload or null.
 */
export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Guard a page to one role. Redirects visitors to login and users
 * with the other role to their own home page.
 */
export async function requireRole(role) {
  const user = await getSessionUser();
  if (!user) redirect("/auth/login");
  if (user.role !== role)
    redirect(user.role === "EMPLOYER" ? "/dashboard" : "/jobs");
  return user;
}

/** True when the URL is a file uploaded to this app's Cloudinary account. */
export function isOwnUploadUrl(url) {
  return (
    typeof url === "string" &&
    url.startsWith(
      `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`,
    )
  );
}
