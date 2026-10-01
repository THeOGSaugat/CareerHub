// src/app/dashboard/edit/[id]/page.jsx
// ─── Edit Job (employer) ──────────────────────────────────────

import { notFound } from "next/navigation";
import JobForm from "@/components/dashboard/JobForm";
import PageHeader from "@/components/ui/PageHeader";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/session";

export const metadata = { title: "Edit Job" };

export default async function EditJobPage({ params }) {
  const user = await requireRole("EMPLOYER");
  const { id } = await params;

  const jobId = Number(id);
  if (!Number.isInteger(jobId) || jobId <= 0) notFound();

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      title: true,
      description: true,
      company: true,
      location: true,
      salary: true,
      salaryMax: true,
      type: true,
      workMode: true,
      level: true,
      category: true,
      skills: true,
      deadline: true,
      status: true,
      employerId: true,
    },
  });

  // Employers can only edit their own jobs
  if (!job || job.employerId !== user.id) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <PageHeader title="Edit job" description={`${job.title} at ${job.company}`} />
      <JobForm job={job} />
    </div>
  );
}
