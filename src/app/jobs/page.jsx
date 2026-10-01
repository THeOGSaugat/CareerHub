// src/app/jobs/page.jsx
// ─── Job Listings ─────────────────────────────────────────────
// Public and server-rendered. Filters and the page number live in the URL.

import { SearchX, Sparkles } from "lucide-react";
import JobCard from "@/components/jobs/JobCard";
import JobFilters from "@/components/jobs/JobFilters";
import Pagination from "@/components/jobs/Pagination";
import { ButtonLink } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import {
  getRecommendedJobs,
  getViewerContext,
  listJobs,
  parseJobFilters,
} from "@/lib/jobs";
import { getSessionUser } from "@/lib/session";

export const metadata = {
  title: "Browse Jobs",
  description:
    "Search open jobs by title, company, location, type, work mode and experience level.",
};

export default async function JobsPage({ searchParams }) {
  const filters = parseJobFilters(await searchParams);
  const user = await getSessionUser();

  const [viewer, { jobs, total, page, totalPages }] = await Promise.all([
    getViewerContext(user),
    listJobs(filters),
  ]);

  const isFiltered = !!(
    filters.search ||
    filters.type ||
    filters.workMode ||
    filters.level ||
    filters.category
  );

  // Recommendations only on the unfiltered first page
  const recommended =
    !isFiltered && page === 1 ? await getRecommendedJobs(viewer) : [];

  const needsSkills =
    viewer.role === "SEEKER" && viewer.skills.length === 0 && !isFiltered;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <PageHeader
        title="Browse jobs"
        description={`${total} open ${total === 1 ? "job" : "jobs"}${isFiltered ? " matching your search" : ""}`}
      />

      {/* key: remount so the search box follows the URL */}
      <JobFilters key={JSON.stringify(filters)} filters={filters} />

      {needsSkills && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 mb-6 rounded-2xl border border-brand-500/20 bg-brand-500/5">
          <p className="text-sm text-ink/80">
            Add your skills to see how well you match each job and get
            recommendations.
          </p>
          <ButtonLink href="/profile" variant="secondary" size="sm">
            Add skills
          </ButtonLink>
        </div>
      )}

      {recommended.length > 0 && (
        <section className="mb-10">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-ink mb-4">
            <Sparkles className="w-5 h-5 text-brand-500" aria-hidden="true" />
            Recommended for your skills
          </h2>
          <div className="flex flex-col gap-4">
            {recommended.map((job) => (
              <JobCard key={job.id} job={job} viewer={viewer} />
            ))}
          </div>
          <h2 className="text-lg font-semibold text-ink mt-10">All jobs</h2>
        </section>
      )}

      {jobs.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={isFiltered ? "No jobs match your search" : "No open jobs right now"}
          description={
            isFiltered
              ? "Try a different keyword or remove some filters."
              : "Check back soon — new roles are posted regularly."
          }
        >
          {isFiltered && (
            <ButtonLink href="/jobs" variant="secondary">
              Clear filters
            </ButtonLink>
          )}
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} viewer={viewer} />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} filters={filters} />
    </div>
  );
}
