import { errorResponse, successResponse } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request) {
  const user = getAuthUser(request);
  if (!user) return errorResponse("UNAUTHORIZED", 401);
  if (user.role !== "SEEKER") return errorResponse("FORBIDDEN", 403);

  try {
    const applications = await prisma.application.findMany({
      where: { seekerId: user.id },
      // the employer's private note must never reach the seeker
      omit: { note: true },
      include: {
        job: {
          include: {
            employer: {
              select: { name: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(applications, 200);
  } catch (err) {
    console.error("[API Error]:", err);
    return errorResponse("Error retrieving your applications");
  }
}