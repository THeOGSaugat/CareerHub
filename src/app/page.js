// src/app/page.js
// ─── Landing Page ─────────────────────────────────────────────
// Rendered on the server so visitors and search engines get real content.

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  ClipboardCheck,
  Search,
  Send,
  Sparkles,
  UserRoundPen,
} from "lucide-react";
import FeaturedJobCard from "@/components/jobs/FeaturedJobCard";
import { ButtonLink, buttonClass } from "@/components/ui/Button";
import CompanyAvatar from "@/components/ui/CompanyAvatar";
import {
  CurvedArrow,
  DashBurst,
  LoopArrow,
  Underline,
} from "@/components/ui/Doodles";
import EmptyState from "@/components/ui/EmptyState";
import { prisma } from "@/lib/db";
import { getViewerContext, jobCardSelect, openJobsWhere } from "@/lib/jobs";
import { JOB_TYPES } from "@/lib/jobStyles";
import { getSessionUser } from "@/lib/session";

const STEPS = [
  {
    icon: UserRoundPen,
    title: "Build your profile",
    text: "Add your skills, experience and CV once. We reuse them every time you apply.",
  },
  {
    icon: Search,
    title: "Find jobs that fit",
    text: "Filter by type, work mode and level, and see how well your skills match each role.",
  },
  {
    icon: Send,
    title: "Apply and track",
    text: "Apply in a minute, then follow every application from review to offer.",
  },
];

const plural = (count, one, many) => (count === 1 ? one : many);

export default async function HomePage({ searchParams }) {
  const params = await searchParams;
  const typeParam = Array.isArray(params.type) ? params.type[0] : params.type;
  // The job-type tabs filter the grid through the URL (?type=…), so they work without JS
  const activeType = typeParam in JOB_TYPES ? typeParam : "";

  const user = await getSessionUser();
  const where = openJobsWhere();

  const [viewer, featuredJobs, totalJobs, companies] = await Promise.all([
    getViewerContext(user),
    prisma.job.findMany({
      where: activeType ? { AND: [where, { type: activeType }] } : where,
      select: jobCardSelect,
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.job.count({ where }),
    prisma.job.groupBy({
      by: ["company"],
      where,
      _count: { company: true },
      orderBy: { _count: { company: "desc" } },
    }),
  ]);

  const topCompanies = companies.slice(0, 6);
  const tabs = [["", "All jobs"], ...Object.entries(JOB_TYPES)];

  return (
    <div className="animate-fade-in">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-brand-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-6 items-center pt-12 lg:pt-10">
          {/* Copy */}
          <div className="relative text-center lg:text-left lg:pb-14">
            <DashBurst className="hidden lg:block absolute -left-10 -top-14 w-14 h-14" />

            <p className="text-brand-500 font-semibold mb-4">
              Start your next chapter
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-ink leading-[1.15] tracking-tight">
              Now find jobs from anywhere, and build your{" "}
              <span className="relative inline-block text-brand-500">
                bright career.
                <Underline />
              </span>
            </h1>
            <p className="text-steel text-base sm:text-lg leading-relaxed mt-7 max-w-xl mx-auto lg:mx-0">
              Browse {totalJobs} open {plural(totalJobs, "role", "roles")} from{" "}
              {companies.length} {plural(companies.length, "company", "companies")},
              see how well your skills match, and apply in minutes.
            </p>

            {/* Plain GET form: works without JavaScript */}
            <form
              action="/jobs"
              role="search"
              className="flex items-center gap-2 mt-8 max-w-xl mx-auto lg:mx-0 p-1.5 rounded-2xl bg-white border border-line shadow-xl shadow-brand-500/10 transition-shadow duration-300 focus-within:shadow-2xl focus-within:shadow-brand-500/20 focus-within:border-brand-500/50"
            >
              <Search
                className="w-5 h-5 text-cool ml-3 shrink-0"
                aria-hidden="true"
              />
              <input
                type="search"
                name="search"
                aria-label="Search jobs"
                placeholder="Job title, company or location"
                className="flex-1 min-w-0 bg-transparent py-2.5 text-ink placeholder-cool focus:shadow-none!"
              />
              <button type="submit" className={buttonClass({ size: "lg", className: "px-5 sm:px-6" })}>
                <span className="hidden sm:inline">Search jobs</span>
                <span className="sm:hidden">Search</span>
              </button>
            </form>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-6">
              {!user && (
                <>
                  <ButtonLink href="/auth/register" variant="secondary" className="group">
                    Create a free account
                    <ArrowRight
                      className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </ButtonLink>
                  <ButtonLink href="/jobs" variant="ghost">
                    Browse all jobs
                  </ButtonLink>
                </>
              )}
              {user?.role === "SEEKER" && (
                <>
                  <ButtonLink href="/applications" variant="secondary">
                    My applications
                  </ButtonLink>
                  <ButtonLink href="/profile" variant="ghost">
                    Update my profile
                  </ButtonLink>
                </>
              )}
              {user?.role === "EMPLOYER" && (
                <>
                  <ButtonLink href="/dashboard" variant="secondary">
                    Go to dashboard
                  </ButtonLink>
                  <ButtonLink href="/dashboard/new" variant="ghost">
                    Post a job
                  </ButtonLink>
                </>
              )}
            </div>
          </div>

          {/* Photo */}
          <div className="relative mx-auto w-full max-w-76 sm:max-w-sm lg:max-w-md aspect-4/5">
            {/* soft arch behind the photo */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 top-[12%] rounded-t-full bg-brand-500/15"
            />
            <div className="absolute inset-x-[7%] bottom-0 top-0 rounded-t-full overflow-hidden ring-8 ring-white/70 shadow-2xl shadow-brand-500/20">
              <Image
                src="/images/hero-professional.jpg"
                alt="Smiling professional standing in a bright office"
                fill
                priority
                sizes="(min-width: 1024px) 26rem, (min-width: 640px) 22rem, 17rem"
                className="object-cover object-[76%_center] transition-transform duration-700 ease-out hover:scale-105"
              />
            </div>

            <LoopArrow className="hidden sm:block absolute left-[12%] -top-2 w-12 h-10 rotate-12" />

            {/* open jobs */}
            <div className="animate-float absolute -left-1 sm:-left-8 top-[30%] flex flex-col items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-brand-500 text-white ring-8 ring-brand-50 shadow-xl shadow-brand-500/30">
              <BriefcaseBusiness className="w-5 h-5 mb-0.5" aria-hidden="true" />
              <span className="text-xl sm:text-2xl font-bold leading-none">
                {totalJobs}
              </span>
              <span className="text-[11px] opacity-90">
                open {plural(totalJobs, "job", "jobs")}
              </span>
            </div>

            {/* companies hiring */}
            <div className="animate-float-slow absolute -right-1 sm:-right-6 top-[8%] flex items-center gap-2.5 pl-2.5 pr-4 py-2.5 rounded-2xl bg-white shadow-xl shadow-ink/10">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-50 text-brand-500">
                <Building2 className="w-4.5 h-4.5" aria-hidden="true" />
              </span>
              <span className="leading-tight">
                <span className="block text-base font-bold text-ink">
                  {companies.length}
                </span>
                <span className="block text-[11px] text-muted">
                  {plural(companies.length, "company", "companies")} hiring
                </span>
              </span>
            </div>

            {/* skill match */}
            <div className="animate-float absolute -right-1 sm:-right-10 bottom-[14%] flex items-center gap-2.5 pl-2.5 pr-4 py-2.5 rounded-2xl bg-white shadow-xl shadow-ink/10">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-50 text-amber-500">
                <Sparkles className="w-4.5 h-4.5" aria-hidden="true" />
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-bold text-ink">Skill match</span>
                <span className="block text-[11px] text-muted">
                  See how you fit each role
                </span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Jobs ─────────────────────────────────────────────── */}
      <section id="jobs" className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-7">
          <h2 className="text-2xl sm:text-3xl font-bold text-ink">
            All{" "}
            <span className="relative inline-block text-brand-500">
              Jobs
              <Underline />
            </span>{" "}
            of CareerHub
          </h2>

          <form
            action="/jobs"
            role="search"
            className="flex items-center w-full md:w-80 p-1 rounded-xl bg-white border border-line transition-all duration-300 focus-within:border-brand-500/50 focus-within:shadow-lg focus-within:shadow-brand-500/10"
          >
            <input
              type="search"
              name="search"
              aria-label="Search your job"
              placeholder="Search your job"
              className="flex-1 min-w-0 bg-transparent px-3 py-2 text-sm text-ink placeholder-cool focus:shadow-none!"
            />
            <button
              type="submit"
              aria-label="Search"
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-50 text-brand-500 transition-colors duration-300 hover:bg-brand-500 hover:text-white cursor-pointer"
            >
              <Search className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>
        </div>

        {/* Job-type tabs */}
        <div className="no-scrollbar flex gap-3 overflow-x-auto p-3.5 mb-8 rounded-2xl bg-brand-50">
          {tabs.map(([value, label]) => {
            const active = value === activeType;
            return (
              <Link
                key={value || "all"}
                href={value ? `/?type=${value}#jobs` : "/#jobs"}
                scroll={false}
                aria-current={active ? "true" : undefined}
                className={`flex-1 min-w-fit text-center px-5 py-2.5 rounded-xl border text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                  active
                    ? "bg-white border-brand-500 text-brand-600 shadow-md shadow-brand-500/10"
                    : "bg-white border-transparent text-ink/80 hover:border-brand-500/40 hover:text-brand-600 hover:-translate-y-0.5 hover:shadow-md hover:shadow-brand-500/10"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {featuredJobs.length === 0 ? (
          <EmptyState
            icon={ClipboardCheck}
            title={
              activeType
                ? `No ${JOB_TYPES[activeType].toLowerCase()} jobs right now`
                : "No jobs posted yet"
            }
            description="New roles show up here as soon as employers post them."
          >
            {activeType ? (
              <ButtonLink href="/#jobs" scroll={false} variant="secondary">
                Show all jobs
              </ButtonLink>
            ) : (
              !user && (
                <ButtonLink href="/auth/register">Be the first to join</ButtonLink>
              )
            )}
          </EmptyState>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredJobs.map((job) => (
              <FeaturedJobCard key={job.id} job={job} viewer={viewer} />
            ))}
          </div>
        )}

        <div className="flex justify-center mt-10">
          <ButtonLink
            href={activeType ? `/jobs?type=${activeType}` : "/jobs"}
            variant="secondary"
            size="lg"
            className="group"
          >
            View all jobs
            <ArrowRight
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </ButtonLink>
        </div>
      </section>

      {/* ── Call to action ───────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16">
        <div className="relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 px-6 py-9 sm:px-12 sm:py-11 rounded-3xl bg-brand-50">
          <DashBurst className="absolute left-3 bottom-2 w-10 h-10 opacity-70" />
          <DashBurst className="hidden sm:block absolute right-6 top-3 w-9 h-9 rotate-180 opacity-70" />

          {user?.role === "SEEKER" ? (
            <>
              <div className="relative">
                <p className="text-brand-500 font-semibold mb-2">Stand out</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-ink leading-snug">
                  Complete your profile and get
                  <br className="hidden sm:block" /> matched with{" "}
                  <span className="relative inline-block text-brand-500">
                    better jobs.
                    <Underline />
                  </span>
                </h2>
              </div>
              <CurvedArrow className="hidden lg:block w-28 h-14 shrink-0" />
              <ButtonLink href="/profile" size="lg" className="relative shrink-0">
                Update my profile
              </ButtonLink>
            </>
          ) : (
            <>
              <div className="relative">
                <p className="text-brand-500 font-semibold mb-2">Become an employer</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-ink leading-snug">
                  You can hire with CareerHub
                  <br className="hidden sm:block" /> as{" "}
                  <span className="relative inline-block text-brand-500">
                    an employer.
                    <Underline />
                  </span>
                </h2>
              </div>
              <CurvedArrow className="hidden lg:block w-28 h-14 shrink-0" />
              <ButtonLink
                href={user?.role === "EMPLOYER" ? "/dashboard/new" : "/auth/register"}
                size="lg"
                className="relative shrink-0"
              >
                Post a job
              </ButtonLink>
            </>
          )}
        </div>
      </section>

      {/* ── Top companies ────────────────────────────────────── */}
      {topCompanies.length > 1 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-7">
            <span className="relative inline-block text-brand-500">
              Companies
              <Underline />
            </span>{" "}
            hiring now
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {topCompanies.map(({ company, _count }) => (
              <Link
                key={company}
                href={`/jobs?search=${encodeURIComponent(company)}`}
                className="group flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white border border-line transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-xl hover:shadow-brand-500/10"
              >
                <CompanyAvatar
                  name={company}
                  className="transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3"
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-ink truncate transition-colors duration-300 group-hover:text-brand-500">
                    {company}
                  </span>
                  <span className="block text-xs text-muted">
                    {_count.company} open {plural(_count.company, "role", "roles")}
                  </span>
                </span>
                <ArrowRight
                  className="w-4 h-4 text-brand-500 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-7">
          How it{" "}
          <span className="relative inline-block text-brand-500">
            works
            <Underline />
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {STEPS.map(({ icon: Icon, title, text }, index) => (
            <div
              key={title}
              className="group p-6 rounded-2xl bg-white border border-line transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-xl hover:shadow-brand-500/10"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-brand-50 text-brand-500 transition-all duration-300 group-hover:bg-brand-500 group-hover:text-white group-hover:scale-105">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </span>
                <span className="text-3xl font-bold text-brand-100 transition-colors duration-300 group-hover:text-brand-200">
                  0{index + 1}
                </span>
              </div>
              <h3 className="font-bold text-ink mb-1.5">{title}</h3>
              <p className="text-sm text-steel leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
