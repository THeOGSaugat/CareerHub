// app/api/auth/register/route.js
// ─── User Registration Endpoint ───────────────────────────────
// POST: Creates a new user with hashed password. Validates input,
// checks for duplicate emails, and returns the created user.

import { prisma } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { setAuthCookie } from "@/lib/session";
import { successResponse, errorResponse } from "@/lib/api";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, name, role } = body;

    // ── Input Validation ──────────────────────────────────────
    if (!email || !password || !name) {
      return errorResponse("Email, password, and name are required", 400);
    }

    if (password.length < 6) {
      return errorResponse("Password must be at least 6 characters", 400);
    }

    // Validate role if provided
    const validRoles = ["SEEKER", "EMPLOYER"];
    if (role && !validRoles.includes(role)) {
      return errorResponse("Role must be SEEKER or EMPLOYER", 400);
    }

    // ── Duplicate Check ───────────────────────────────────────
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return errorResponse("A user with this email already exists", 409);
    }

    // ── Hash Password ─────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 10);

    // ── Create User ───────────────────────────────────────────
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || "SEEKER",
      },
    });

    // ── Generate JWT Token ────────────────────────────────────
    const token = signToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    // Log the new user in: the token only ever travels in an httpOnly cookie
    await setAuthCookie(token);

    return successResponse(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      201
    );
  } catch (error) {
    console.error("[Register Error]:", error);
    return errorResponse("Registration failed. Please try again.", 500);
  }
}
