// src/components/ui/Field.jsx
// ─── Form Controls ────────────────────────────────────────────
// Label + control + optional hint, with one shared input style.

export const inputClass =
  "w-full px-3.5 py-2.5 rounded-lg bg-white border border-line text-ink placeholder-cool focus:border-brand-500 transition-colors disabled:opacity-60";

export function Field({ label, htmlFor, hint, required, className = "", children }) {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-sm font-medium text-ink/80 mb-1.5"
        >
          {label}
          {required && <span className="text-brand-500"> *</span>}
        </label>
      )}
      {children}
      {hint && <p className="text-xs text-muted mt-1.5">{hint}</p>}
    </div>
  );
}

export function Input({ className = "", ...props }) {
  return <input className={`${inputClass} ${className}`} {...props} />;
}

export function Textarea({ className = "", ...props }) {
  return <textarea className={`${inputClass} ${className}`} {...props} />;
}

export function Select({ className = "", ...props }) {
  return <select className={`${inputClass} ${className}`} {...props} />;
}
