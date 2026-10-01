import { errorResponse, successResponse } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isOwnUploadUrl } from "@/lib/session";

// Editable text fields and their maximum lengths
const TEXT_FIELDS = {
  name: 80,
  headline: 120,
  location: 80,
  bio: 1000,
  experience: 3000,
  education: 3000,
};

const profileSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  headline: true,
  location: true,
  bio: true,
  experience: true,
  education: true,
  cvUrl: true,
};

export async function GET(request) {
  const user = getAuthUser(request);
  if (!user) return errorResponse("UNAUTHORIZED", 401);

  try {
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: { ...profileSelect, skills: { orderBy: { id: "asc" } } },
    });
    if (!profile) return errorResponse("User not found", 404);
    return successResponse(profile, 200);
  } catch (err) {
    console.error("[API Error]:", err);
    return errorResponse("Error fetching profile");
  }
}

// Updates only the fields that are present in the body
export async function PATCH(request) {
  const user = getAuthUser(request);
  if (!user) return errorResponse("UNAUTHORIZED", 401);

  const body = await request.json().catch(() => null);
  if (!body) return errorResponse("Invalid request body", 400);

  const data = {};

  for (const [field, maxLength] of Object.entries(TEXT_FIELDS)) {
    if (body[field] === undefined) continue;
    if (body[field] !== null && typeof body[field] !== "string")
      return errorResponse(`Invalid value for ${field}`, 400);

    const value = (body[field] || "").trim();
    if (value.length > maxLength)
      return errorResponse(`${field} can be at most ${maxLength} characters`, 400);
    if (field === "name" && !value) return errorResponse("Name is required", 400);

    data[field] = value || null;
  }

  if (body.cvUrl !== undefined) {
    if (body.cvUrl !== null && !isOwnUploadUrl(body.cvUrl))
      return errorResponse("CV must be uploaded through CareerHub", 400);
    data.cvUrl = body.cvUrl;
  }

  if (Object.keys(data).length === 0)
    return errorResponse("Nothing to update", 400);

  try {
    const profile = await prisma.user.update({
      where: { id: user.id },
      data,
      select: profileSelect,
    });
    return successResponse(profile, 200);
  } catch (err) {
    console.error("[API Error]:", err);
    return errorResponse("Error updating profile");
  }
}
