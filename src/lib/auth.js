// src/lib/auth.js
// ─── JWT Authentication Helpers ───────────────────────────────
// Provides sign and verify utilities for role-scoped JSON Web Tokens.
// Used by API route handlers to protect private endpoints.

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Sign a JWT token containing the user's id, email, and role.
 * Token expires in 1 day by default.
 */
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
}

/**
 * Verify and decode a JWT token.
 * Returns the decoded payload or null if invalid/expired.
 */
export function verifyToken(token) {
  try {
    const decodedToken = jwt.verify(token, JWT_SECRET);
    return decodedToken;
  } catch {
    return null;
  }
}

/**
 * Extract and verify the JWT from a Request. The browser sends it in the
 * httpOnly "auth-token" cookie; a bearer Authorization header is still
 * accepted for non-browser API clients.
 * Returns decoded user payload or null.
 */
export function getAuthUser(request) {
  const cookieToken = request.cookies?.get("auth-token")?.value;
  if (cookieToken) return verifyToken(cookieToken);

  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;

  const token = authHeader.split(" ")[1];
  if (!token) return null;

  return verifyToken(token);
}
