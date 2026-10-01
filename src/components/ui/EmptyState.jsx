// src/components/ui/EmptyState.jsx
// ─── Empty State ──────────────────────────────────────────────

import Card from "@/components/ui/Card";

export default function EmptyState({ icon: Icon, title, description, children }) {
  return (
    <Card className="px-6 py-14 text-center">
      {Icon && (
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-500 mb-4">
          <Icon className="w-6 h-6" aria-hidden="true" />
        </div>
      )}
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      {description && (
        <p className="text-steel text-sm mt-1.5 max-w-md mx-auto">
          {description}
        </p>
      )}
      {children && <div className="mt-5 flex justify-center gap-3">{children}</div>}
    </Card>
  );
}
