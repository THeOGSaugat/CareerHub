// src/app/applications/page.jsx
// ─── My Applications (seeker) ─────────────────────────────────

import Link from "next/link";
import { ClipboardList, FileText, MapPin } from "lucide-react";
import PipelineProgress from "@/components/jobs/PipelineProgress";
import WithdrawButton from "@/components/jobs/WithdrawButton";
import Badge from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import CompanyAvatar from "@/components/ui/CompanyAvatar";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { prisma } from "@/lib/db";
import {
  formatDate,
  formatJobType,
  getStatusMeta,
  getTypeTone,
} from "@/lib/jobStyles";
import { requireRole } from "@/lib/session";

export const metadata = { title: "My Applications" };

const ACTIVE = ["REVIEWED", "SHORTLISTED", "INTERVIEW", "OFFER"];

export default async function ApplicationsPage() {
  const user = await requireRole("SEEKER");

  // `note` is the employer's private note: never select it here
  const applications = await prisma.application.findMany({
    where: { seekerId: user.id },
    select: {
      id: true,
      status: true,
      cvUrl: true,
      yearsOfExperience: true,
      createdAt: true,
      updatedAt: true,
      jobId: true,
      job: {
        select: { title: true, company: true, location: true, type: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const count = (statuses) =>
    applications.filter((a) => statuses.includes(a.status)).length;

  const stats = [
    { label: "Total", value: applications.length, className: "text-ink" },
    { label: "Awaiting review", value: count(["PENDING"]), className: "text-ink/80" },
    { label: "In progress", value: count(ACTIVE), className: "text-brand-500" },
    { label: "Hired", value: count(["APPROVED"]), className: "text-green-600" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <PageHeader
        title="My applications"
        description="Follow each application from review to offer."
      >
        <ButtonLink href="/jobs">Browse jobs</ButtonLink>
      </PageHeader>

      {applications.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No applications yet"
          description="When you apply to a job, it shows up here with its current status."
        >
          <ButtonLink href="/jobs">Browse open jobs</ButtonLink>
        </EmptyState>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
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
            {applications.map((app) => {
              const status = getStatusMeta(app.status);
              return (
                <Card key={app.id} as="article" className="p-5 md:p-6">
                  <div className="flex items-start gap-4">
                    <CompanyAvatar name={app.job.company} />
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg font-semibold text-ink leading-snug">
                        <Link
                          href={`/jobs/${app.jobId}`}
                          className="hover:text-brand-500 transition-colors"
                        >
                          {app.job.title}
                        </Link>
                      </h2>
                      <p className="text-sm text-steel mt-0.5 flex flex-wrap items-center gap-x-2">
                        <span className="text-ink/80">{app.job.company}</span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                          {app.job.location}
                        </span>
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                      <Badge tone={getTypeTone(app.job.type)}>
                        {formatJobType(app.job.type)}
                      </Badge>
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </div>
                  </div>

                  <div className="mt-5">
                    {app.status === "DECLINED" ? (
                      <p className="text-sm text-steel">
                        The employer decided not to move forward with this
                        application.
                      </p>
                    ) : (
                      <PipelineProgress status={app.status} />
                    )}
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-3 pt-4 mt-5 border-t border-line">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                      <span>Applied {formatDate(app.createdAt)}</span>
                      <span>
                        {app.yearsOfExperience} yr
                        {app.yearsOfExperience === "1" ? "" : "s"} experience
                      </span>
                      <a
                        href={app.cvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-brand-500 hover:text-brand-700 font-medium"
                      >
                        <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                        View CV
                      </a>
                    </div>
                    {app.status !== "APPROVED" && (
                      <WithdrawButton jobId={app.jobId} />
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
