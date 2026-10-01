// src/components/jobs/SkillChips.jsx
// ─── Skill Chips ──────────────────────────────────────────────
// Skills in `matched` (the ones the viewer has) are highlighted.

import { Check } from "lucide-react";

export default function SkillChips({ skills, matched, limit }) {
  const matchedSet = new Set(matched || []);
  const shown = limit ? skills.slice(0, limit) : skills;
  const hidden = skills.length - shown.length;

  return (
    <ul className="flex flex-wrap gap-1.5">
      {shown.map((skill) => (
        <li
          key={skill}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border ${
            matchedSet.has(skill)
              ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/25"
              : "bg-ink/5 text-ink/80 border-line"
          }`}
        >
          {matchedSet.has(skill) && (
            <Check className="w-3 h-3" aria-hidden="true" />
          )}
          {skill}
        </li>
      ))}
      {hidden > 0 && (
        <li className="px-2.5 py-1 text-xs text-muted">+{hidden} more</li>
      )}
    </ul>
  );
}
