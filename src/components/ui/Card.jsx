// src/components/ui/Card.jsx
// ─── Surface Card ─────────────────────────────────────────────

export const cardClass =
  "bg-white border border-line rounded-2xl";

export default function Card({ className = "", as: Tag = "div", ...props }) {
  return <Tag className={`${cardClass} ${className}`} {...props} />;
}
