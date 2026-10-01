import { errorResponse, successResponse } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request) {
  const user = getAuthUser(request);
  if (!user) return errorResponse("UNAUTHORIZED", 401);
  if (user.role !== "EMPLOYER") return errorResponse("FORBIDDEN", 403);

  try {
    const jobs = await prisma.job.findMany({
      where: {
        employerId: user.id,
      },
      include: {
        applications: {
          include: {
            seeker: {
              select: {
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return successResponse(
      { message: "Jobs Retrieved Successfully!", data: jobs },
      200,
    );
  } catch (err) {
    console.error("[Dashboard Error]:", err);
    return errorResponse("Error retrieving the jobs");
  }
}
