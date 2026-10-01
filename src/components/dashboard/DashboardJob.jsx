"use client";
// src/components/dashboard/DashboardJob.jsx
// ─── Dashboard Job Row ────────────────────────────────────────
// One of the employer's jobs with its actions and applicants.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, MapPin } from "lucide-react";
import ApplicantCard from "@/components/dashboard/ApplicantCard";
import Badge from "@/components/ui/Badge";
import Button, { ButtonLink } from "@/components/ui/Button";
import { cardClass } from "@/components/ui/Card";
import { Select } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import {
  APPLICATION_STATUSES,
  WORK_MODES,
  formatDate,
  formatJobType,
  formatSalary,
  getTypeTone,
} from "@/lib/jobStyles";

export default function DashboardJob({ job, open, defaultExpanded }) {
  const router = useRouter();
  const toast = useToast();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [statusFilter, setStatusFilter] = useState("");
  const [busy, setBusy] = useState(false);

  const applicants = statusFilter
    ? job.applications.filter((app) => app.status === statusFilter)
    : job.applications;
  const toReview = job.applications.filter((app) => app.status === "PENDING").length;

  const request = async (options, successMessage) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}`, options);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      toast.success(successMessage);
      router.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleToggleStatus = () => {
    const status = job.status === "OPEN" ? "CLOSED" : "OPEN";
    request(
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      },
      status === "OPEN" ? "Job reopened" : "Job closed",
    );
  };

  const handleDelete = () => {
    if (
      !confirm(
        "Delete this job permanently? Its applications are deleted too. This can't be undone.",
      )
    )
      return;
    request({ method: "DELETE" }, "Job deleted");
  };

  return (
    <article className={`${cardClass} overflow-hidden`}>
      <div className="p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-ink leading-snug">
              <Link
                href={`/jobs/${job.id}`}
                className="hover:text-brand-500 transition-colors"
              >
                {job.title}
              </Link>
            </h2>
            <p className="text-sm text-steel mt-0.5 flex flex-wrap items-center gap-x-2">
              <span className="text-ink/80">{job.company}</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                {job.location} · {WORK_MODES[job.workMode]}
              </span>
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge tone={open ? "green" : "red"}>
                {open ? "Open" : job.status === "OPEN" ? "Deadline passed" : "Closed"}
              </Badge>
              <Badge tone={getTypeTone(job.type)}>{formatJobType(job.type)}</Badge>
              <span className="text-xs text-muted">
                {formatSalary(job)} · Posted {formatDate(job.createdAt)}
                {job.deadline && ` · Apply by ${formatDate(job.deadline)}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <ButtonLink href={`/dashboard/edit/${job.id}`} variant="secondary" size="sm">
              Edit
            </ButtonLink>
            <Button variant="secondary" size="sm" disabled={busy} onClick={handleToggleStatus}>
              {job.status === "OPEN" ? "Close" : "Reopen"}
            </Button>
            <Button variant="danger" size="sm" disabled={busy} onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-brand-500 hover:text-brand-700 cursor-pointer"
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
          {job.applications.length} applicant
          {job.applications.length === 1 ? "" : "s"}
          {toReview > 0 && (
            <Badge tone="amber" className="ml-1">
              {toReview} to review
            </Badge>
          )}
        </button>
      </div>

      {/* Applicants */}
      {expanded && (
        <div className="border-t border-line bg-mist p-5 md:p-6">
          {job.applications.length === 0 ? (
            <p className="text-steel text-sm text-center py-4">
              No applications yet. They&apos;ll appear here as candidates apply.
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="font-medium text-ink">Applicants</h3>
                <Select
                  aria-label="Filter applicants by stage"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-auto text-sm py-1.5"
                >
                  <option value="">All stages</option>
                  {Object.entries(APPLICATION_STATUSES).map(([value, { label }]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>

              {applicants.length === 0 ? (
                <p className="text-steel text-sm text-center py-4">
                  No applicants at this stage.
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {applicants.map((app) => (
                    <ApplicantCard key={app.id} app={app} jobSkills={job.skills} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </article>
  );
}
