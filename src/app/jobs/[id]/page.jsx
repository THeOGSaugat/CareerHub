// src/app/jobs/[id]/page.jsx
// ─── Job Detail ───────────────────────────────────────────────
// Public and server-rendered, with its own title and share preview.

import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  CalendarClock,
  CircleCheck,
  Clock,
  Layers,
  MapPin,
  Pencil,
  Users,
} from "lucide-react";
import ApplyButton from "@/components/jobs/ApplyButton";
import SaveButton from "@/components/jobs/SaveButton";
import SkillChips from "@/components/jobs/SkillChips";
import WithdrawButton from "@/components/jobs/WithdrawButton";
import Badge from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import CompanyAvatar from "@/components/ui/CompanyAvatar";
import { prisma } from "@/lib/db";
import { getViewerContext } from "@/lib/jobs";
import {
  LEVELS,
  WORK_MODES,
  formatDate,
  formatJobType,
  formatSalary,
  getTypeTone,
  isJobOpen,
  timeAgo,
} from "@/lib/jobStyles";
import { matchSkills } from "@/lib/match";
import { getSessionUser } from "@/lib/session";

// cache(): generateMetadata and the page share one query per request
const getJob = cache(async (id) => {
  const jobId = Number(id);
  if (!Number.isInteger(jobId) || jobId <= 0) return null;

  return prisma.job.findUnique({
    where: { id: jobId },
    include: {
      employer: { select: { name: true } },
      _count: { select: { applications: true } },
    },
  });
});

export async function generateMetadata({ params }) {
  const { id } = await params;
  const job = await getJob(id);
  if (!job) return { title: "Job not found" };

  const title = `${job.title} at ${job.company}`;
  const description = `${formatJobType(job.type)} · ${WORK_MODES[job.workMode]} · ${job.location}. ${job.description.slice(0, 140)}`;

  return {
    title,
    description,
    openGraph: { title, description, type: "article" },
  };
}

export default async function JobDetailPage({ params }) {
  const { id } = await params;
  const [job, user] = await Promise.all([getJob(id), getSessionUser()]);
  if (!job) notFound();

  const viewer = await getViewerContext(user);
  const isSeeker = viewer.role === "SEEKER";
  const isOwner = viewer.role === "EMPLOYER" && job.employerId === viewer.userId;
  const applied = viewer.appliedIds.has(job.id);
  const open = isJobOpen(job);
  const match =
    isSeeker && job.skills.length > 0 ? matchSkills(job.skills, viewer.skills) : null;

  const facts = [
    { icon: Banknote, label: "Salary", value: formatSalary(job) },
    { icon: MapPin, label: "Location", value: `${job.location} · ${WORK_MODES[job.workMode]}` },
    { icon: Layers, label: "Level", value: job.level ? LEVELS[job.level] : "Not specified" },
    { icon: Clock, label: "Posted", value: timeAgo(job.createdAt) },
    {
      icon: CalendarClock,
      label: "Apply by",
      value: job.deadline ? formatDate(job.deadline) : "No deadline",
    },
    {
      icon: Users,
      label: "Applicants",
      value: String(job._count.applications),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-steel hover:text-ink mb-5"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        All jobs
      </Link>

      <Card className="p-6 md:p-8">
        {/* ── Header ───────────────────────────────────────── */}
        <div className="flex items-start gap-4">
          <CompanyAvatar name={job.company} size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-ink leading-tight">
              {job.title}
            </h1>
            <p className="text-ink/80 mt-1">{job.company}</p>
            {job.employer?.name && (
              <p className="text-muted text-xs mt-1">
                Posted by {job.employer.name}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-5">
          <Badge tone={getTypeTone(job.type)}>{formatJobType(job.type)}</Badge>
          <Badge>{WORK_MODES[job.workMode]}</Badge>
          <Badge>{job.category}</Badge>
          {!open && <Badge tone="red">Closed</Badge>}
        </div>

        {/* ── Key facts ────────────────────────────────────── */}
        <dl className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 p-4 rounded-xl bg-mist border border-line">
          {facts.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-2.5">
              <Icon className="w-4 h-4 mt-0.5 text-brand-500 shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <dt className="text-xs text-muted">{label}</dt>
                <dd className="text-sm font-medium text-ink">{value}</dd>
              </div>
            </div>
          ))}
        </dl>

        {/* ── Actions ──────────────────────────────────────── */}
        <div className="flex items-center gap-3 flex-wrap mt-6">
          {isOwner ? (
            <ButtonLink href={`/dashboard/edit/${job.id}`} variant="secondary">
              <Pencil className="w-4 h-4" aria-hidden="true" />
              Edit this job
            </ButtonLink>
          ) : viewer.role === "EMPLOYER" ? (
            <p className="text-muted text-sm">
              Employer accounts can&apos;t apply to jobs.
            </p>
          ) : applied ? (
            <>
              <Badge tone="green" className="py-1.5 px-3 text-sm">
                <CircleCheck className="w-4 h-4" aria-hidden="true" />
                You&apos;ve applied
              </Badge>
              <ButtonLink href="/applications" variant="secondary">
                Track application
              </ButtonLink>
              <WithdrawButton jobId={job.id} size="md" />
            </>
          ) : !open ? (
            <p className="text-steel text-sm">
              This job is no longer accepting applications.
            </p>
          ) : isSeeker ? (
            <ApplyButton
              job={{ id: job.id, title: job.title, company: job.company }}
              profileCvUrl={viewer.cvUrl}
            >
              Apply now
            </ApplyButton>
          ) : (
            <ButtonLink href="/auth/login">Sign in to apply</ButtonLink>
          )}

          {isSeeker && (
            <SaveButton
              jobId={job.id}
              saved={viewer.savedIds.has(job.id)}
              withLabel
            />
          )}
        </div>

        {/* ── Skills ───────────────────────────────────────── */}
        {job.skills.length > 0 && (
          <section className="mt-8">
            <h2 className="text-sm font-semibold text-steel uppercase tracking-wide mb-3">
              Skills
            </h2>
            <SkillChips skills={job.skills} matched={match?.matched} />

            {match && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-ink/80">
                    You match {match.matched.length} of {match.total} skills
                  </span>
                  <span className="font-semibold text-emerald-600">
                    {match.percent}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-ink/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-emerald-500 to-teal-400"
                    style={{ width: `${match.percent}%` }}
                  />
                </div>
                {viewer.skills.length === 0 && (
                  <p className="text-xs text-muted mt-2">
                    <Link href="/profile" className="text-brand-500 hover:text-brand-700">
                      Add skills to your profile
                    </Link>{" "}
                    to see your match.
                  </p>
                )}
              </div>
            )}
          </section>
        )}

        {/* ── Description ──────────────────────────────────── */}
        <section className="mt-8">
          <h2 className="text-sm font-semibold text-steel uppercase tracking-wide mb-3">
            About the role
          </h2>
          <p className="text-ink/80 whitespace-pre-line leading-relaxed">
            {job.description}
          </p>
        </section>
      </Card>
    </div>
  );
}
