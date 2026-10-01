"use client";
// src/components/jobs/JobFilters.jsx
// ─── Job Search & Filters ─────────────────────────────────────
// Filters live in the URL (?search=…&type=…) so results can be
// shared, bookmarked and reached with the back button.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import {
  CATEGORIES,
  JOB_TYPES,
  LEVELS,
  SORT_OPTIONS,
  WORK_MODES,
} from "@/lib/jobStyles";

const FILTER_KEYS = ["search", "type", "workMode", "level", "category", "sort"];

export default function JobFilters({ filters }) {
  const router = useRouter();
  const [search, setSearch] = useState(filters.search);

  // Any filter change goes back to page 1
  const apply = (changes) => {
    const next = { ...filters, search, ...changes };
    const params = new URLSearchParams();
    for (const key of FILTER_KEYS) {
      if (next[key] && !(key === "sort" && next[key] === "newest"))
        params.set(key, next[key]);
    }
    const query = params.toString();
    router.push(query ? `/jobs?${query}` : "/jobs");
  };

  const hasFilters = FILTER_KEYS.some(
    (key) => filters[key] && !(key === "sort" && filters[key] === "newest"),
  );

  const clear = () => {
    setSearch("");
    router.push("/jobs");
  };

  const selects = [
    { key: "type", label: "Job type", all: "All types", options: Object.entries(JOB_TYPES) },
    { key: "workMode", label: "Work mode", all: "Any work mode", options: Object.entries(WORK_MODES) },
    { key: "level", label: "Experience level", all: "Any level", options: Object.entries(LEVELS) },
    { key: "category", label: "Category", all: "All categories", options: CATEGORIES.map((c) => [c, c]) },
  ];

  return (
    <div className="bg-white border border-line rounded-2xl p-4 mb-6">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          apply({});
        }}
        className="flex gap-2 mb-3"
      >
        <div className="relative flex-1">
          <Search
            className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Job title, company or location"
            aria-label="Search jobs"
            className="pl-10"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
        {selects.map(({ key, label, all, options }) => (
          <Select
            key={key}
            aria-label={label}
            value={filters[key]}
            onChange={(e) => apply({ [key]: e.target.value })}
            className="text-sm py-2"
          >
            <option value="">{all}</option>
            {options.map(([value, text]) => (
              <option key={value} value={value}>
                {text}
              </option>
            ))}
          </Select>
        ))}
        <Select
          aria-label="Sort by"
          value={filters.sort}
          onChange={(e) => apply({ sort: e.target.value })}
          className="text-sm py-2 col-span-2 lg:col-span-1"
        >
          {Object.entries(SORT_OPTIONS).map(([value, text]) => (
            <option key={value} value={value}>
              {text}
            </option>
          ))}
        </Select>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={clear}
          className="inline-flex items-center gap-1 mt-3 text-sm text-steel hover:text-ink cursor-pointer"
        >
          <X className="w-3.5 h-3.5" aria-hidden="true" />
          Clear all filters
        </button>
      )}
    </div>
  );
}
