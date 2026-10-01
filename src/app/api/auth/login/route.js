import { prisma } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { setAuthCookie } from "@/lib/session";
import { successResponse, errorResponse } from "@/lib/api";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password)
      return errorResponse("Email and Password are required", 400);

    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) return errorResponse("Email or Password incorrect!", 401);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return errorResponse("Email or Password incorrect!", 401);

    const token = signToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    // The token only ever travels in an httpOnly cookie
    await setAuthCookie(token);

    return successResponse({
      userInfo: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("[Login Error]:", err);
    return errorResponse("Login failed. Please try again.", 500);
  }
}
