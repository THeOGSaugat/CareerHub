// src/components/jobs/Pagination.jsx
// ─── Pagination Links ─────────────────────────────────────────

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const linkClass =
  "inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-line text-sm font-medium text-ink hover:border-cool hover:bg-ink/5 transition-colors";
const disabledClass =
  "inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-line text-sm font-medium text-cool";

export default function Pagination({ page, totalPages, filters }) {
  if (totalPages <= 1) return null;

  const hrefFor = (target) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (key === "page" || !value) continue;
      if (key === "sort" && value === "newest") continue;
      params.set(key, value);
    }
    if (target > 1) params.set("page", String(target));
    const query = params.toString();
    return query ? `/jobs?${query}` : "/jobs";
  };

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between gap-4 mt-8"
    >
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={linkClass}>
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          Previous
        </Link>
      ) : (
        <span className={disabledClass}>
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          Previous
        </span>
      )}

      <span className="text-sm text-steel">
        Page {page} of {totalPages}
      </span>

      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className={linkClass}>
          Next
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      ) : (
        <span className={disabledClass}>
          Next
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </span>
      )}
    </nav>
  );
}
