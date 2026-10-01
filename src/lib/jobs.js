// src/lib/jobs.js
// ─── Job Queries & Validation (server only) ───────────────────
// Shared by the API routes and the server-rendered pages so both
// always apply the same filters, visibility rules and validation.

import { prisma } from "@/lib/db";
import { matchSkills } from "@/lib/match";
import {
  CATEGORIES,
  JOB_TYPES,
  LEVELS,
  SORT_OPTIONS,
  WORK_MODES,
} from "@/lib/jobStyles";

export const PAGE_SIZE = 10;

const MAX_INT = 2147483647;
const MAX_SKILLS = 15;

const ORDER_BY = {
  newest: { createdAt: "desc" },
  oldest: { createdAt: "asc" },
  salary_high: { salary: "desc" },
  salary_low: { salary: "asc" },
};

// Fields a job card needs. Applicants are exposed only as a count.
export const jobCardSelect = {
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
  createdAt: true,
  employerId: true,
  _count: { select: { applications: true } },
};

// Jobs visible to the public: open and not past their deadline
export function openJobsWhere() {
  return {
    status: "OPEN",
    OR: [{ deadline: null }, { deadline: { gte: new Date() } }],
  };
}

const first = (value) => (Array.isArray(value) ? value[0] : value) || "";

/** Turn raw query params into a validated filter object. */
export function parseJobFilters(params = {}) {
  const type = first(params.type);
  const workMode = first(params.workMode);
  const level = first(params.level);
  const category = first(params.category);
  const sort = first(params.sort);
  const page = parseInt(first(params.page), 10);

  return {
    search: first(params.search).trim().slice(0, 100),
    type: type in JOB_TYPES ? type : "",
    workMode: workMode in WORK_MODES ? workMode : "",
    level: level in LEVELS ? level : "",
    category: CATEGORIES.includes(category) ? category : "",
    sort: sort in SORT_OPTIONS ? sort : "newest",
    page: page > 0 ? page : 1,
  };
}

/** Paginated list of open jobs matching the filters. */
export async function listJobs(filters) {
  const { search, type, workMode, level, category, sort, page } = filters;

  const where = {
    AND: [
      openJobsWhere(),
      ...(search
        ? [
            {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { company: { contains: search, mode: "insensitive" } },
                { location: { contains: search, mode: "insensitive" } },
                { category: { contains: search, mode: "insensitive" } },
              ],
            },
          ]
        : []),
      ...(type ? [{ type }] : []),
      ...(workMode ? [{ workMode }] : []),
      ...(level ? [{ level }] : []),
      ...(category ? [{ category }] : []),
    ],
  };

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      select: jobCardSelect,
      orderBy: [ORDER_BY[sort], { id: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.job.count({ where }),
  ]);

  return {
    jobs,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

/**
 * What the current visitor has saved / applied to, plus their skills.
 * Returns empty sets for visitors and employers.
 */
export async function getViewerContext(user) {
  const viewer = {
    userId: user?.id ?? null,
    role: user?.role ?? null,
    savedIds: new Set(),
    appliedIds: new Set(),
    skills: [],
    cvUrl: null,
  };

  if (user?.role !== "SEEKER") return viewer;

  const [saved, applied, profile] = await Promise.all([
    prisma.savedJob.findMany({
      where: { seekerId: user.id },
      select: { jobId: true },
    }),
    prisma.application.findMany({
      where: { seekerId: user.id },
      select: { jobId: true },
    }),
    prisma.user.findUnique({
      where: { id: user.id },
      select: { cvUrl: true, skills: { select: { name: true } } },
    }),
  ]);

  viewer.savedIds = new Set(saved.map((s) => s.jobId));
  viewer.appliedIds = new Set(applied.map((a) => a.jobId));
  viewer.skills = profile?.skills.map((s) => s.name) ?? [];
  viewer.cvUrl = profile?.cvUrl ?? null;
  return viewer;
}

/** Open jobs the seeker hasn't applied to, ranked by skill match. */
export async function getRecommendedJobs(viewer, limit = 3) {
  if (viewer.role !== "SEEKER" || viewer.skills.length === 0) return [];

  const jobs = await prisma.job.findMany({
    where: {
      AND: [
        openJobsWhere(),
        { skills: { isEmpty: false } },
        { id: { notIn: [...viewer.appliedIds] } },
      ],
    },
    select: jobCardSelect,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return jobs
    .map((job) => ({ job, match: matchSkills(job.skills, viewer.skills) }))
    .filter(({ match }) => match.matched.length > 0)
    .sort(
      (a, b) =>
        b.match.percent - a.match.percent ||
        b.match.matched.length - a.match.matched.length,
    )
    .slice(0, limit)
    .map(({ job }) => job);
}

const clean = (value) => (typeof value === "string" ? value.trim() : "");

function toInt(value) {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  return Number.isInteger(number) ? number : NaN;
}

/** Accepts an array or a comma-separated string; trims and de-duplicates. */
export function normalizeSkills(input) {
  const list = Array.isArray(input)
    ? input
    : typeof input === "string"
      ? input.split(",")
      : [];

  const seen = new Set();
  const skills = [];
  for (const item of list) {
    const skill = clean(item).slice(0, 40);
    const key = skill.toLowerCase();
    if (!skill || seen.has(key)) continue;
    seen.add(key);
    skills.push(skill);
  }
  return skills.slice(0, MAX_SKILLS);
}

/**
 * Validate a job create/update body.
 * Returns { data } with only the allowed fields, or { error }.
 */
export function parseJobInput(body = {}) {
  const title = clean(body.title);
  const description = clean(body.description);
  const company = clean(body.company);
  const location = clean(body.location);

  if (!title || !description || !company || !location)
    return { error: "Title, company, location and description are required" };

  const salary = toInt(body.salary);
  if (salary === null || Number.isNaN(salary) || salary < 0 || salary > MAX_INT)
    return { error: "Salary must be a valid number" };

  const salaryMax = toInt(body.salaryMax);
  if (salaryMax !== null) {
    if (Number.isNaN(salaryMax) || salaryMax > MAX_INT)
      return { error: "Maximum salary must be a valid number" };
    if (salaryMax < salary)
      return { error: "Maximum salary can't be lower than the minimum" };
  }

  const type = body.type || "FULL_TIME";
  if (!(type in JOB_TYPES)) return { error: "Invalid job type" };

  const workMode = body.workMode || "ONSITE";
  if (!(workMode in WORK_MODES)) return { error: "Invalid work mode" };

  const level = body.level || null;
  if (level && !(level in LEVELS)) return { error: "Invalid experience level" };

  let deadline = null;
  if (body.deadline) {
    // A date-only value means "until the end of that day"
    const value = /^\d{4}-\d{2}-\d{2}$/.test(body.deadline)
      ? `${body.deadline}T23:59:59.999Z`
      : body.deadline;
    deadline = new Date(value);
    if (Number.isNaN(deadline.getTime()))
      return { error: "Invalid application deadline" };
  }

  return {
    data: {
      title,
      description,
      company,
      location,
      salary,
      salaryMax,
      type,
      workMode,
      level,
      category: CATEGORIES.includes(body.category) ? body.category : "Other",
      skills: normalizeSkills(body.skills),
      deadline,
      status: body.status === "CLOSED" ? "CLOSED" : "OPEN",
    },
  };
}
