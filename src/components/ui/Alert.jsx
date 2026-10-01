// src/components/ui/Alert.jsx
// ─── Inline Error Banner ──────────────────────────────────────

import { CircleAlert } from "lucide-react";

export default function Alert({ children, className = "" }) {
  if (!children) return null;
  return (
    <div
      role="alert"
      className={`flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-700 text-sm ${className}`}
    >
      <CircleAlert className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}
