// src/components/jobs/JobCard.jsx
// ─── Job Card ─────────────────────────────────────────────────
// Server component used on the landing page, the job list and saved jobs.
// `viewer` comes from getViewerContext() in lib/jobs.js.

import Link from "next/link";
import { Banknote, CircleCheck, Clock, MapPin, Users } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { cardClass } from "@/components/ui/Card";
import CompanyAvatar from "@/components/ui/CompanyAvatar";
import ApplyButton from "@/components/jobs/ApplyButton";
import SaveButton from "@/components/jobs/SaveButton";
import SkillChips from "@/components/jobs/SkillChips";
import {
  LEVELS,
  WORK_MODES,
  formatJobType,
  formatSalary,
  getTypeTone,
  isJobOpen,
  timeAgo,
} from "@/lib/jobStyles";
import { matchSkills } from "@/lib/match";

export default function JobCard({ job, viewer, compact = false }) {
  const isSeeker = viewer?.role === "SEEKER";
  const applied = isSeeker && viewer.appliedIds.has(job.id);
  const open = isJobOpen(job);
  const match =
    isSeeker && job.skills.length > 0 && viewer.skills.length > 0
      ? matchSkills(job.skills, viewer.skills)
      : null;

  return (
    <article
      className={`${cardClass} p-5 md:p-6 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-xl hover:shadow-brand-500/10`}
    >
      <div className="flex items-start gap-4">
        <CompanyAvatar name={job.company} />

        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-ink leading-snug">
            <Link
              href={`/jobs/${job.id}`}
              className="hover:text-brand-500 transition-colors duration-300"
            >
              {job.title}
            </Link>
          </h3>
          <p className="text-sm text-steel mt-0.5 flex flex-wrap items-center gap-x-2">
            <span className="text-ink/80">{job.company}</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
              {job.location}
            </span>
          </p>
        </div>

        {isSeeker && (
          <SaveButton jobId={job.id} saved={viewer.savedIds.has(job.id)} />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={getTypeTone(job.type)}>{formatJobType(job.type)}</Badge>
        <Badge>{WORK_MODES[job.workMode]}</Badge>
        {job.level && <Badge>{LEVELS[job.level]}</Badge>}
        {!open && <Badge tone="red">Closed</Badge>}
      </div>

      {!compact && (
        <p className="text-sm text-steel leading-relaxed line-clamp-2">
          {job.description}
        </p>
      )}

      {!compact && job.skills.length > 0 && (
        <SkillChips skills={job.skills} matched={match?.matched} limit={6} />
      )}

      {match && (
        <p className="text-xs font-medium text-emerald-600">
          You match {match.matched.length} of {match.total} skills
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-auto border-t border-line">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-steel">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
            <Banknote className="w-4 h-4" aria-hidden="true" />
            {formatSalary(job)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            {timeAgo(job.createdAt)}
          </span>
          {!compact && (
            <span className="inline-flex items-center gap-1">
              <Users className="w-3.5 h-3.5" aria-hidden="true" />
              {job._count.applications} applicant
              {job._count.applications === 1 ? "" : "s"}
            </span>
          )}
        </div>

        {!compact && (
          <div className="flex items-center gap-2">
            <Link
              href={`/jobs/${job.id}`}
              className="px-3 py-1.5 text-sm rounded-lg font-medium text-ink/80 hover:text-ink hover:bg-ink/5 transition-colors"
            >
              View details
            </Link>
            {applied ? (
              <Badge tone="green" className="py-1">
                <CircleCheck className="w-3.5 h-3.5" aria-hidden="true" />
                Applied
              </Badge>
            ) : (
              isSeeker &&
              open && (
                <ApplyButton
                  job={{ id: job.id, title: job.title, company: job.company }}
                  profileCvUrl={viewer.cvUrl}
                  size="sm"
                />
              )
            )}
          </div>
        )}
      </div>
    </article>
  );
}
