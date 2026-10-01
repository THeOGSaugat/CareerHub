// src/lib/notify.js
// ─── In-app Notifications (server only) ───────────────────────

import { prisma } from "@/lib/db";

/**
 * Create a notification for a user. Never throws: a failed
 * notification must not break the action that triggered it.
 */
export async function notify(userId, { title, body, link = null }) {
  try {
    await prisma.notification.create({
      data: { userId, title, body, link },
    });
  } catch (err) {
    console.error("[Notification Error]:", err);
  }
}
