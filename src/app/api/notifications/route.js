import { errorResponse, successResponse } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request) {
  const user = getAuthUser(request);
  if (!user) return errorResponse("UNAUTHORIZED", 401);

  try {
    const [items, unread] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.notification.count({ where: { userId: user.id, read: false } }),
    ]);
    return successResponse({ items, unread }, 200);
  } catch (err) {
    console.error("[API Error]:", err);
    return errorResponse("Error fetching notifications");
  }
}

// Mark as read. Body: { id } for one notification, or { all: true }
export async function PATCH(request) {
  const user = getAuthUser(request);
  if (!user) return errorResponse("UNAUTHORIZED", 401);

  const body = await request.json().catch(() => null);
  if (!body) return errorResponse("Invalid request body", 400);

  const id = parseInt(body.id);
  if (!body.all && isNaN(id))
    return errorResponse("Notification id is required", 400);

  try {
    // userId in the filter means users can only touch their own notifications
    const result = await prisma.notification.updateMany({
      where: { userId: user.id, read: false, ...(body.all ? {} : { id }) },
      data: { read: true },
    });
    return successResponse({ updated: result.count }, 200);
  } catch (err) {
    console.error("[API Error]:", err);
    return errorResponse("Error updating notifications");
  }
}
