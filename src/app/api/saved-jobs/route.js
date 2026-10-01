import { errorResponse, successResponse } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request) {
  const user = getAuthUser(request);
  if (!user) return errorResponse("UNAUTHORIZED", 401);
  if (user.role !== "SEEKER") return errorResponse("FORBIDDEN", 403);

  try {
    const savedJobs = await prisma.savedJob.findMany({
      where: { seekerId: user.id },
      include: {
        job: {
          include: {
            employer: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return successResponse(savedJobs, 200);
  } catch (err) {
    console.error("[API Error]:", err);
    return errorResponse("Error fetching saved jobs");
  }
}

export async function POST(request) {
  const user = getAuthUser(request);
  if (!user) return errorResponse("UNAUTHORIZED", 401);
  if (user.role !== "SEEKER") return errorResponse("FORBIDDEN", 403);

  const body = await request.json();
  const jobId = parseInt(body.jobId);
  if (isNaN(jobId)) return errorResponse("Invalid Job ID", 400);

  try {
    const saved = await prisma.savedJob.create({
      data: { seekerId: user.id, jobId },
    });
    return successResponse(saved, 201);
  } catch (err) {
    if (err.code === "P2002")
      return errorResponse("You've already saved this job", 409);
    if (err.code === "P2003") return errorResponse("Job not found", 404);
    console.error("[API Error]:", err);
    return errorResponse("Error saving job");
  }
}

export async function DELETE(request) {
  const user = getAuthUser(request);
  if (!user) return errorResponse("UNAUTHORIZED", 401);
  if (user.role !== "SEEKER") return errorResponse("FORBIDDEN", 403);

  const body = await request.json();
  const jobId = parseInt(body.jobId);
  if (isNaN(jobId)) return errorResponse("Invalid Job ID", 400);

  try {
    await prisma.savedJob.delete({
      where: { seekerId_jobId: { seekerId: user.id, jobId } },
    });
    return successResponse({ message: "Job unsaved" }, 200);
  } catch (err) {
    if (err.code === "P2025") return errorResponse("Saved job not found", 404);
    console.error("[API Error]:", err);
    return errorResponse("Error unsaving job");
  }
}