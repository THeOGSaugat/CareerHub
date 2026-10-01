// src/components/ui/Doodles.jsx
// ─── Hand-drawn Decorations ───────────────────────────────────
// Purely decorative SVG accents for the landing page.

/** Swoosh drawn under a highlighted word. Parent must be `relative`. */
export function Underline({ className = "" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 14"
      preserveAspectRatio="none"
      fill="none"
      className={`absolute left-0 -bottom-2 w-full h-2.5 text-brand-500 ${className}`}
    >
      <path
        d="M2 9C40 3 92 2 198 6M22 12c40-4 86-5 150-2"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Burst of short dashes. */
export function DashBurst({ className = "" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 60 60"
      fill="none"
      className={`text-amber-400 ${className}`}
    >
      <g stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <path d="M6 30l7-3M9 44l6-5M20 54l4-7M34 57l1-8M8 16l7 2M16 5l5 6M30 2l2 7" />
        <path d="M22 26l5-2M24 38l5-4M34 43l2-6M21 16l5 2" opacity=".6" />
      </g>
    </svg>
  );
}

/** Loose curved arrow pointing right. */
export function CurvedArrow({ className = "" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 60"
      fill="none"
      className={`text-brand-500 ${className}`}
    >
      <path
        d="M4 52C26 44 62 30 110 10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M92 6l19 3-9 17"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Small looping arrow, used beside the hero photo. */
export function LoopArrow({ className = "" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 64 48"
      fill="none"
      className={`text-amber-400 ${className}`}
    >
      <path
        d="M60 8C44 2 20 6 10 26"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M4 14l5 14 13-6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
