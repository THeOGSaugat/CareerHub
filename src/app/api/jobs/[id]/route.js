import { errorResponse, successResponse } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseJobInput } from "@/lib/jobs";

// Shared by PUT, PATCH and DELETE: the job must exist and belong to the employer
async function getOwnedJob(request, params) {
  const { id } = await params;
  const jobId = parseInt(id);
  if (isNaN(jobId)) return { error: errorResponse("Invalid Job ID", 400) };

  const user = getAuthUser(request);
  if (!user) return { error: errorResponse("UNAUTHORIZED", 401) };
  if (user.role !== "EMPLOYER") return { error: errorResponse("FORBIDDEN", 403) };

  const existingJob = await prisma.job.findUnique({
    where: { id: jobId },
    select: { employerId: true },
  });

  if (!existingJob) return { error: errorResponse("Job does not exist!", 404) };
  if (existingJob.employerId !== user.id)
    return {
      error: errorResponse("FORBIDDEN: Can only change your own jobs", 403),
    };

  return { jobId };
}

export async function GET(request, { params }) {
  const { id } = await params;
  const jobId = parseInt(id);
  if (isNaN(jobId)) return errorResponse("Invalid Params ID", 400);

  try {
    const job = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
      include: {
        employer: {
          select: { name: true },
        },
        // applicants are private: only expose how many there are
        _count: { select: { applications: true } },
      },
    });

    if (!job) return errorResponse("Job not found", 404);

    return successResponse(
      { message: "Data retrieved successfully!", data: job },
      200,
    );
  } catch (err) {
    console.error("[API Error]:", err);
    return errorResponse("Error getting the particular Job");
  }
}

export async function PUT(request, { params }) {
  try {
    const { jobId, error: accessError } = await getOwnedJob(request, params);
    if (accessError) return accessError;

    const body = await request.json().catch(() => null);
    if (!body) return errorResponse("Invalid request body", 400);

    // never pass the raw body: it could overwrite employerId or id
    const { data, error } = parseJobInput(body);
    if (error) return errorResponse(error, 400);

    const job = await prisma.job.update({
      where: {
        id: jobId,
      },
      data,
    });

    return successResponse(
      { message: "Job updated successfully!", data: job },
      200,
    );
  } catch (err) {
    console.error("[API Error]:", err);
    return errorResponse("Error updating the particular Job");
  }
}

// Close or reopen a job without editing the rest of it
export async function PATCH(request, { params }) {
  try {
    const { jobId, error: accessError } = await getOwnedJob(request, params);
    if (accessError) return accessError;

    const body = await request.json().catch(() => null);
    if (body?.status !== "OPEN" && body?.status !== "CLOSED")
      return errorResponse("Status must be OPEN or CLOSED", 400);

    const job = await prisma.job.update({
      where: { id: jobId },
      data: { status: body.status },
    });

    return successResponse({ message: "Job status updated", data: job }, 200);
  } catch (err) {
    console.error("[API Error]:", err);
    return errorResponse("Error updating the job status");
  }
}

export async function DELETE(request, { params }) {
  try {
    const { jobId, error: accessError } = await getOwnedJob(request, params);
    if (accessError) return accessError;

    const deleteJob = await prisma.job.delete({
      where: {
        id: jobId,
      },
    });

    return successResponse({ message: "Job deleted successfully", data: deleteJob }, 200);
  } catch (err) {
    console.error("[API Error]:", err);
    return errorResponse("Error deleting the job");
  }
}
