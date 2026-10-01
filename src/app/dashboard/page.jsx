// src/app/dashboard/page.jsx
// ─── Employer Dashboard ───────────────────────────────────────

import { BriefcaseBusiness, Plus } from "lucide-react";
import DashboardJob from "@/components/dashboard/DashboardJob";
import { ButtonLink } from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { prisma } from "@/lib/db";
import { isJobOpen } from "@/lib/jobStyles";
import { requireRole } from "@/lib/session";

export const metadata = { title: "Employer Dashboard" };

const IN_PROGRESS = ["REVIEWED", "SHORTLISTED", "INTERVIEW", "OFFER"];

export default async function DashboardPage({ searchParams }) {
  const user = await requireRole("EMPLOYER");
  const { job: jobParam } = await searchParams;

  const jobs = await prisma.job.findMany({
    where: { employerId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      applications: {
        orderBy: { createdAt: "desc" },
        include: {
          seeker: {
            select: {
              name: true,
              email: true,
              headline: true,
              location: true,
              bio: true,
              experience: true,
              education: true,
              skills: { select: { name: true }, orderBy: { id: "asc" } },
            },
          },
        },
      },
    },
  });

  const applications = jobs.flatMap((job) => job.applications);
  const count = (statuses) =>
    applications.filter((a) => statuses.includes(a.status)).length;

  const stats = [
    { label: "Open jobs", value: jobs.filter(isJobOpen).length, className: "text-ink" },
    { label: "Total applicants", value: applications.length, className: "text-ink" },
    { label: "To review", value: count(["PENDING"]), className: "text-amber-600" },
    { label: "In progress", value: count(IN_PROGRESS), className: "text-brand-500" },
    { label: "Hired", value: count(["APPROVED"]), className: "text-green-600" },
  ];

  // Notifications link here with ?job=<id> to open that job's applicants
  const openJobId = Number(Array.isArray(jobParam) ? jobParam[0] : jobParam);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <PageHeader
        title="Employer dashboard"
        description="Manage your job posts and move applicants through your hiring pipeline."
      >
        <ButtonLink href="/dashboard/new">
          <Plus className="w-4 h-4" aria-hidden="true" />
          Post a job
        </ButtonLink>
      </PageHeader>

      {jobs.length === 0 ? (
        <EmptyState
          icon={BriefcaseBusiness}
          title="You haven't posted any jobs yet"
          description="Post your first job to start receiving applications."
        >
          <ButtonLink href="/dashboard/new">Post a job</ButtonLink>
        </EmptyState>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            {stats.map((stat) => (
              <Card key={stat.label} className="px-4 py-3.5">
                <p className="text-xs text-muted">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.className}`}>
                  {stat.value}
                </p>
              </Card>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            {jobs.map((job) => (
              <DashboardJob
                key={job.id}
                job={job}
                open={isJobOpen(job)}
                defaultExpanded={job.id === openJobId}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
