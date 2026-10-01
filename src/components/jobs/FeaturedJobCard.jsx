// src/components/jobs/FeaturedJobCard.jsx
// ─── Featured Job Card (landing page grid) ────────────────────
// Vertical card: cover, company row, title, meta, salary strip.
// The whole card is clickable through the title's stretched link.

import Link from "next/link";
import { ArrowUpRight, Clock, MapPin, Users } from "lucide-react";
import SaveButton from "@/components/jobs/SaveButton";
import Badge from "@/components/ui/Badge";
import CompanyAvatar from "@/components/ui/CompanyAvatar";
import {
  WORK_MODES,
  formatJobType,
  formatSalary,
  timeAgo,
} from "@/lib/jobStyles";

export default function FeaturedJobCard({ job, viewer }) {
  const isSeeker = viewer?.role === "SEEKER";
  const applicants = job._count.applications;

  return (
    <article className="group relative flex flex-col bg-white border border-line rounded-2xl p-3.5 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-brand-500/40 hover:shadow-2xl hover:shadow-brand-500/10">
      {/* Cover */}
      <div className="relative h-36 rounded-xl overflow-hidden bg-linear-to-br from-brand-50 via-brand-100 to-brand-200/70">
        <span
          aria-hidden="true"
          className="absolute -right-8 -top-10 w-36 h-36 rounded-full bg-white/50 transition-transform duration-500 ease-out group-hover:scale-125"
        />
        <span
          aria-hidden="true"
          className="absolute -left-6 -bottom-12 w-28 h-28 rounded-full bg-brand-500/10 transition-transform duration-500 ease-out group-hover:scale-125"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <CompanyAvatar
            name={job.company}
            size="xl"
            className="shadow-lg shadow-ink/10 transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-3"
          />
        </div>
        <Badge tone="sky" className="absolute left-3 top-3 bg-white! border-transparent!">
          {formatJobType(job.type)}
        </Badge>
        {isSeeker && (
          <div className="absolute right-3 top-3 z-10 bg-white rounded-lg">
            <SaveButton jobId={job.id} saved={viewer.savedIds.has(job.id)} />
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 px-1.5 pt-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-steel truncate">{job.company}</p>
          <span className="px-2.5 py-0.5 rounded-md bg-brand-50 text-brand-600 text-xs font-medium whitespace-nowrap">
            {job.category === "Other" ? WORK_MODES[job.workMode] : job.category}
          </span>
        </div>

        <h3 className="mt-2 font-bold text-ink leading-snug line-clamp-2">
          <Link
            href={`/jobs/${job.id}`}
            className="transition-colors duration-300 group-hover:text-brand-500 after:absolute after:inset-0 after:rounded-2xl"
          >
            {job.title}
          </Link>
        </h3>

        <div className="flex items-center justify-between gap-3 mt-3 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-brand-500 shrink-0" aria-hidden="true" />
            <span className="truncate">{job.location}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 shrink-0">
            <Clock className="w-3.5 h-3.5 text-brand-500" aria-hidden="true" />
            {timeAgo(job.createdAt)}
          </span>
        </div>

        {/* Salary strip */}
        <div className="flex items-center justify-between gap-3 mt-4 px-3.5 py-2.5 rounded-xl bg-brand-50 transition-colors duration-300 group-hover:bg-brand-100">
          <span className="font-bold text-brand-600 text-sm">{formatSalary(job)}</span>
          <span className="inline-flex items-center gap-1.5 text-xs text-steel">
            <Users className="w-3.5 h-3.5" aria-hidden="true" />
            {applicants} applicant{applicants === 1 ? "" : "s"}
            <ArrowUpRight
              className="w-4 h-4 text-brand-500 -ml-1 opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
              aria-hidden="true"
            />
          </span>
        </div>
      </div>
    </article>
  );
}
