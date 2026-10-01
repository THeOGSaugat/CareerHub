// src/components/TopBar.jsx
// ─── Announcement Bar ─────────────────────────────────────────
// Slim navy strip above the navbar. Scrolls away; the navbar stays.

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

const linkClass =
  "inline-flex items-center gap-1 text-white/80 hover:text-white transition-colors duration-300";

export default function TopBar({ user }) {
  return (
    <div className="bg-ink text-white text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-center sm:justify-between gap-4">
        <p className="flex items-center gap-2 truncate">
          <Sparkles className="w-3.5 h-3.5 text-brand-300 shrink-0" aria-hidden="true" />
          <span className="truncate">
            Free for job seekers —{" "}
            <span className="text-brand-300">
              build your profile once, apply everywhere.
            </span>
          </span>
        </p>

        <div className="hidden sm:flex items-center gap-5 shrink-0">
          <Link href="/jobs" className={linkClass}>
            Browse jobs
          </Link>
          {user?.role !== "SEEKER" && (
            <Link
              href={user?.role === "EMPLOYER" ? "/dashboard/new" : "/auth/register"}
              className={`${linkClass} group`}
            >
              Post a job
              <ArrowRight
                className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
