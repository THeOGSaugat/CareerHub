// src/components/jobs/PipelineProgress.jsx
// ─── Hiring Pipeline Progress ─────────────────────────────────
// Shows a seeker how far their application has moved.

import { PIPELINE, getStatusMeta } from "@/lib/jobStyles";

export default function PipelineProgress({ status }) {
  if (status === "DECLINED") return null;

  const current = PIPELINE.indexOf(status);

  return (
    <ol className="flex items-center gap-1.5" aria-label="Application progress">
      {PIPELINE.map((stage, index) => {
        const reached = index <= current;
        return (
          <li key={stage} className="flex-1 min-w-0">
            <div
              className={`h-1.5 rounded-full ${reached ? "bg-brand-500" : "bg-ink/5"}`}
            />
            <span
              className={`hidden sm:block mt-1.5 text-[11px] truncate ${
                index === current
                  ? "text-brand-700 font-semibold"
                  : reached
                    ? "text-steel"
                    : "text-cool"
              }`}
              aria-current={index === current ? "step" : undefined}
            >
              {getStatusMeta(stage).label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
