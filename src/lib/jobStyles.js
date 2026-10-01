// src/lib/jobStyles.js
// ─── Job & Application Display Metadata ───────────────────────
// Single source of truth for labels, badge tones and formatting.
// Safe to import from both server and client components.

export const JOB_TYPES = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
};

export const WORK_MODES = {
  ONSITE: "On-site",
  REMOTE: "Remote",
  HYBRID: "Hybrid",
};

export const LEVELS = {
  ENTRY: "Entry level",
  MID: "Mid level",
  SENIOR: "Senior",
};

export const CATEGORIES = [
  "Engineering",
  "Design",
  "Marketing",
  "Sales",
  "Finance",
  "Customer Support",
  "Operations",
  "Human Resources",
  "Education",
  "Healthcare",
  "Other",
];

export const SORT_OPTIONS = {
  newest: "Newest first",
  oldest: "Oldest first",
  salary_high: "Salary: high to low",
  salary_low: "Salary: low to high",
};

// Badge tone per job type (see components/ui/Badge.jsx)
const TYPE_TONES = {
  FULL_TIME: "sky",
  PART_TIME: "violet",
  CONTRACT: "amber",
  INTERNSHIP: "emerald",
};

export function formatJobType(type) {
  return JOB_TYPES[type] || type;
}

export function getTypeTone(type) {
  return TYPE_TONES[type] || "slate";
}

// Hiring pipeline, in order. DECLINED can happen at any stage.
export const PIPELINE = [
  "PENDING",
  "REVIEWED",
  "SHORTLISTED",
  "INTERVIEW",
  "OFFER",
  "APPROVED",
];

export const APPLICATION_STATUSES = {
  PENDING: { label: "Applied", tone: "slate" },
  REVIEWED: { label: "In review", tone: "sky" },
  SHORTLISTED: { label: "Shortlisted", tone: "violet" },
  INTERVIEW: { label: "Interview", tone: "amber" },
  OFFER: { label: "Offer", tone: "emerald" },
  APPROVED: { label: "Hired", tone: "green" },
  DECLINED: { label: "Declined", tone: "red" },
};

export function getStatusMeta(status) {
  return APPLICATION_STATUSES[status] || { label: status, tone: "slate" };
}

// Fixed locale + time zone so server and client render the same text
const numberFormat = new Intl.NumberFormat("en-IN");
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatSalary(job) {
  if (!job.salary) return "Salary not disclosed";
  const min = numberFormat.format(job.salary);
  if (job.salaryMax && job.salaryMax > job.salary)
    return `Rs. ${min} – ${numberFormat.format(job.salaryMax)}`;
  return `Rs. ${min}`;
}

export function formatDate(date) {
  return dateFormat.format(new Date(date));
}

export function timeAgo(date) {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

// A job accepts applications while it is OPEN and its deadline hasn't passed
export function isJobOpen(job) {
  if (job.status !== "OPEN") return false;
  return !job.deadline || new Date(job.deadline).getTime() >= Date.now();
}
