import { errorResponse, successResponse } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { listJobs, parseJobFilters, parseJobInput } from "@/lib/jobs";

export async function POST(request) {
  const user = getAuthUser(request);
  // verify logged in users
  if (!user) return errorResponse("UNAUTHORIZED!", 401);
  // verify role
  if (user.role !== "EMPLOYER")
    return errorResponse("FORBIDDEN: Employers Only!", 403);

  const body = await request.json().catch(() => null);
  if (!body) return errorResponse("Invalid request body", 400);

  // verify values
  const { data, error } = parseJobInput(body);
  if (error) return errorResponse(error, 400);

  try {
    // insert values to database -> PostgreSQL
    const newJob = await prisma.job.create({
      data: { ...data, employerId: user.id },
    });
    return successResponse(newJob, 201);
  } catch (err) {
    console.error("[API Error]:", err);
    return errorResponse("Error inserting jobs to the database");
  }
}

// Public: open jobs, filtered and paginated.
// Query params: search, type, workMode, level, category, sort, page
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = parseJobFilters(Object.fromEntries(searchParams));
    const result = await listJobs(filters);
    return successResponse(result, 200);
  } catch (err) {
    console.error("[API Error]:", err);
    return errorResponse("Error trying to fetch jobs");
  }
}
