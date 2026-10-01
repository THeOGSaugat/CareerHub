// src/components/ui/PageHeader.jsx
// ─── Page Title Row ───────────────────────────────────────────

export default function PageHeader({ title, description, children }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-ink">{title}</h1>
        {description && <p className="text-steel mt-2">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}
