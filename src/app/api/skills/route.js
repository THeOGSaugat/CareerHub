import { errorResponse, successResponse } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request) {
  const user = getAuthUser(request);
  if (!user) return errorResponse("UNAUTHORIZED", 401);

  try {
    const skills = await prisma.skill.findMany({
      where: { userId: user.id },
      orderBy: { id: "asc" },
    });
    return successResponse(skills, 200);
  } catch (err) {
    console.error("[API Error]:", err);
    return errorResponse("Error fetching skills");
  }
}

export async function POST(request) {
  const user = getAuthUser(request);
  if (!user) return errorResponse("UNAUTHORIZED", 401);

  const body = await request.json();
  const { name } = body;

  if (!name || !name.trim()) return errorResponse("Skill name is required", 400);

  try {
    const skill = await prisma.skill.create({
      data: {
        name: name.trim(),
        userId: user.id,
      },
    });
    return successResponse(skill, 201);
  } catch (err) {
    if (err.code === "P2002")
      return errorResponse("You've already added this skill", 409);
    console.error("[API Error]:", err);
    return errorResponse("Error adding skill");
  }
}

export async function DELETE(request) {
  const user = getAuthUser(request);
  if (!user) return errorResponse("UNAUTHORIZED", 401);

  const body = await request.json();
  const { id } = body;

  if (!id) return errorResponse("Skill id is required", 400);

  try {
    const skill = await prisma.skill.findUnique({ where: { id: parseInt(id) } });
    if (!skill || skill.userId !== user.id)
      return errorResponse("Skill not found", 404);

    await prisma.skill.delete({ where: { id: parseInt(id) } });
    return successResponse({ message: "Skill removed" }, 200);
  } catch (err) {
    console.error("[API Error]:", err);
    return errorResponse("Error removing skill");
  }
}