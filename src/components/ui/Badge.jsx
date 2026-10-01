// src/components/ui/Badge.jsx
// ─── Badge ────────────────────────────────────────────────────

const TONES = {
  slate: "bg-ink/5 text-ink/80 border-ink/10",
  sky: "bg-brand-500/10 text-brand-700 border-brand-500/20",
  violet: "bg-violet-500/10 text-violet-700 border-violet-500/20",
  amber: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  emerald: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  green: "bg-green-500/15 text-green-700 border-green-500/30",
  red: "bg-red-500/10 text-red-700 border-red-500/20",
};

export default function Badge({ tone = "slate", className = "", ...props }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-medium whitespace-nowrap ${TONES[tone] || TONES.slate} ${className}`}
      {...props}
    />
  );
}
