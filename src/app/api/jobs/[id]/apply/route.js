import { errorResponse, successResponse } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isJobOpen } from "@/lib/jobStyles";
import { notify } from "@/lib/notify";
import { isOwnUploadUrl } from "@/lib/session";

export async function POST(request, { params }) {
  const { id } = await params;
  const jobId = parseInt(id);
  if (isNaN(jobId)) return errorResponse("Invalid Job ID", 400);

  const user = getAuthUser(request);
  if (!user) return errorResponse("UNAUTHORIZED", 401);
  if (user.role !== "SEEKER") return errorResponse("FORBIDDEN", 403);

  const body = await request.json().catch(() => null);
  if (!body) return errorResponse("Invalid request body", 400);

  const coverLetter =
    typeof body.coverLetter === "string" ? body.coverLetter.trim() : "";
  const yearsOfExperience = String(body.yearsOfExperience ?? "").trim();

  // verify fields
  if (!coverLetter || !yearsOfExperience)
    return errorResponse("Please fill all fields!", 400);

  try {
    const [job, seeker] = await Promise.all([
      prisma.job.findUnique({
        where: { id: jobId },
        select: {
          title: true,
          status: true,
          deadline: true,
          employerId: true,
        },
      }),
      prisma.user.findUnique({
        where: { id: user.id },
        select: { name: true, cvUrl: true },
      }),
    ]);

    if (!job) return errorResponse("Job not found", 404);
    if (!seeker) return errorResponse("UNAUTHORIZED", 401);
    if (!isJobOpen(job))
      return errorResponse("This job is no longer accepting applications", 409);

    // Use the CV sent with the application, or fall back to the profile CV
    const cvUrl = body.cvUrl || seeker.cvUrl;
    if (!cvUrl) return errorResponse("Please attach your CV", 400);
    if (!isOwnUploadUrl(cvUrl))
      return errorResponse("CV must be uploaded through CareerHub", 400);

    const application = await prisma.application.create({
      data: {
        cvUrl,
        coverLetter,
        yearsOfExperience,
        seekerId: user.id,
        jobId: jobId,
      },
    });

    await notify(job.employerId, {
      title: "New application",
      body: `${seeker.name} applied to ${job.title}.`,
      link: `/dashboard?job=${jobId}`,
    });

    return successResponse(
      {
        message: "Applied to Job Successfully!",
        data: application,
      },
      201,
    );
  } catch (err) {
    if (err.code === "P2002")
      return errorResponse("You have already applied for this job!", 409);
    if (err.code === "P2003") return errorResponse("Job not found", 404);
    console.error("[API Error]:", err);
    return errorResponse("Error applying to the job");
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const jobId = parseInt(id);
  if (isNaN(jobId)) return errorResponse("Invalid Job ID", 400);

  const user = getAuthUser(request);
  if (!user) return errorResponse("UNAUTHORIZED", 401);
  if (user.role !== "SEEKER") return errorResponse("FORBIDDEN", 403);

  try {
    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_seekerId: {
          jobId,
          seekerId: user.id,
        },
      },
      select: { id: true },
    });

    if (!existingApplication)
      return errorResponse("You have yet to apply for the job!", 404);

    const removedApplication = await prisma.application.delete({
      where: {
        id: existingApplication.id,
      },
      // the employer's private note must never reach the seeker
      omit: { note: true },
    });

    return successResponse(removedApplication, 200);
  } catch (err) {
    console.error("[API Error]:", err);
    return errorResponse("Error unapplying to the job");
  }
}
