// src/app/saved-jobs/page.jsx
// ─── Saved Jobs (seeker) ──────────────────────────────────────

import { Bookmark } from "lucide-react";
import JobCard from "@/components/jobs/JobCard";
import { ButtonLink } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { prisma } from "@/lib/db";
import { getViewerContext, jobCardSelect } from "@/lib/jobs";
import { requireRole } from "@/lib/session";

export const metadata = { title: "Saved Jobs" };

export default async function SavedJobsPage() {
  const user = await requireRole("SEEKER");

  const [viewer, savedJobs] = await Promise.all([
    getViewerContext(user),
    prisma.savedJob.findMany({
      where: { seekerId: user.id },
      select: { jobId: true, job: { select: jobCardSelect } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <PageHeader
        title="Saved jobs"
        description={`${savedJobs.length} saved ${savedJobs.length === 1 ? "job" : "jobs"}`}
      >
        <ButtonLink href="/jobs">Browse jobs</ButtonLink>
      </PageHeader>

      {savedJobs.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved jobs yet"
          description="Bookmark jobs while browsing and they'll be waiting for you here."
        >
          <ButtonLink href="/jobs">Browse open jobs</ButtonLink>
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-4">
          {savedJobs.map(({ jobId, job }) => (
            <JobCard key={jobId} job={job} viewer={viewer} />
          ))}
        </div>
      )}
    </div>
  );
}
