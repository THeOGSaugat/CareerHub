// src/app/dashboard/new/page.jsx
// ─── Post a Job (employer) ────────────────────────────────────

import JobForm from "@/components/dashboard/JobForm";
import PageHeader from "@/components/ui/PageHeader";
import { requireRole } from "@/lib/session";

export const metadata = { title: "Post a Job" };

export default async function NewJobPage() {
  await requireRole("EMPLOYER");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <PageHeader
        title="Post a job"
        description="The more detail you add, the better your applicants will match."
      />
      <JobForm />
    </div>
  );
}
