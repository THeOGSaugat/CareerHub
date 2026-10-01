"use client";
// src/components/notifications/NotificationList.jsx
// ─── Notification List ────────────────────────────────────────

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { cardClass } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { timeAgo } from "@/lib/jobStyles";

export default function NotificationList({ notifications }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const unread = notifications.filter((n) => !n.read).length;

  const markRead = async (body) => {
    const res = await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Error updating notifications");
  };

  const handleMarkAll = async () => {
    setBusy(true);
    try {
      await markRead({ all: true });
      router.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleOpen = async (notification) => {
    try {
      if (!notification.read) await markRead({ id: notification.id });
    } catch {
      // Not worth blocking navigation: it just stays unread
    }
    if (notification.link) router.push(notification.link);
    router.refresh();
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-steel">
          {unread > 0 ? `${unread} unread` : "All caught up"}
        </p>
        {unread > 0 && (
          <Button variant="ghost" size="sm" disabled={busy} onClick={handleMarkAll}>
            Mark all as read
          </Button>
        )}
      </div>

      <ul className="flex flex-col gap-2">
        {notifications.map((notification) => (
          <li key={notification.id}>
            <button
              type="button"
              onClick={() => handleOpen(notification)}
              className={`${cardClass} w-full text-left flex items-start gap-3 px-4 py-3.5 hover:border-cool transition-colors cursor-pointer ${
                notification.read ? "opacity-70" : "border-brand-500/30"
              }`}
            >
              <span
                className={`w-2 h-2 mt-2 rounded-full shrink-0 ${
                  notification.read ? "bg-line" : "bg-brand-500"
                }`}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="font-medium text-ink">
                    {notification.title}
                    {!notification.read && <span className="sr-only"> (unread)</span>}
                  </span>
                  <span className="text-xs text-muted shrink-0">
                    {timeAgo(notification.createdAt)}
                  </span>
                </span>
                <span className="block text-sm text-steel mt-0.5">
                  {notification.body}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
