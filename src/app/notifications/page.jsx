// src/app/notifications/page.jsx
// ─── Notifications ────────────────────────────────────────────

import { redirect } from "next/navigation";
import { BellOff } from "lucide-react";
import NotificationList from "@/components/notifications/NotificationList";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/auth/login");

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <PageHeader
        title="Notifications"
        description={
          user.role === "EMPLOYER"
            ? "New applications to your jobs."
            : "Updates on the jobs you've applied to."
        }
      />

      {notifications.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title="Nothing here yet"
          description={
            user.role === "EMPLOYER"
              ? "You'll be notified when someone applies to one of your jobs."
              : "You'll be notified when an employer moves your application forward."
          }
        />
      ) : (
        <NotificationList notifications={notifications} />
      )}
    </div>
  );
}
