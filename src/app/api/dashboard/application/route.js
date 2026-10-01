import { errorResponse, successResponse } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { APPLICATION_STATUSES, getStatusMeta } from "@/lib/jobStyles";
import { notify } from "@/lib/notify";

const MAX_NOTE_LENGTH = 2000;

// Move an application through the hiring pipeline and/or save a private note.
// Body: { appId, status?, note? }
export async function PATCH(request) {
  const user = getAuthUser(request);
  if (!user) return errorResponse("UNAUTHORIZED", 401);
  if (user.role !== "EMPLOYER") return errorResponse("FORBIDDEN", 403);

  try {
    const body = await request.json().catch(() => null);
    if (!body) return errorResponse("Invalid request body", 400);
    const { appId, status, note } = body;

    const applicationId = parseInt(appId);
    if (isNaN(applicationId)) return errorResponse("Invalid application ID", 400);

    const data = {};
    if (status !== undefined) {
      if (!(status in APPLICATION_STATUSES))
        return errorResponse("Invalid application status", 400);
      data.status = status;
    }
    if (note !== undefined) {
      if (typeof note !== "string" || note.length > MAX_NOTE_LENGTH)
        return errorResponse("Note is too long", 400);
      data.note = note.trim() || null;
    }
    if (Object.keys(data).length === 0)
      return errorResponse("Nothing to update", 400);

    // Employers can only change applications to their own jobs
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: {
        status: true,
        seekerId: true,
        job: { select: { employerId: true, title: true, company: true } },
      },
    });

    if (!application) return errorResponse("Application not found", 404);
    if (application.job.employerId !== user.id)
      return errorResponse(
        "FORBIDDEN: Can only update applications to your own jobs",
        403,
      );

    const updated = await prisma.application.update({
      where: {
        id: applicationId,
      },
      data,
    });

    // Tell the seeker when their application moves to a new stage
    if (data.status && data.status !== application.status) {
      await notify(application.seekerId, {
        title: "Application update",
        body: `Your application for ${application.job.title} at ${application.job.company} is now: ${getStatusMeta(data.status).label}.`,
        link: "/applications",
      });
    }

    return successResponse(
      {
        message: "Application updated successfully!",
        data: updated,
      },
      200,
    );
  } catch (err) {
    console.error("[Application Status Error]:", err);
    return errorResponse("Error in the application status change process");
  }
}
