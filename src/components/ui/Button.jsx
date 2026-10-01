// src/components/ui/Button.jsx
// ─── Button & ButtonLink ──────────────────────────────────────
// One set of button styles for the whole app.

import Link from "next/link";

const BASE =
  "inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap transition-all duration-300 ease-out cursor-pointer active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-offset-2";

const VARIANTS = {
  primary:
    "bg-brand-500 text-white shadow-md shadow-brand-500/20 hover:bg-brand-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-500/30",
  secondary:
    "border border-brand-500/40 bg-white text-brand-700 hover:bg-brand-500 hover:border-brand-500 hover:text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-500/20",
  ghost: "text-ink/80 hover:text-brand-600 hover:bg-brand-50",
  danger: "text-red-600 hover:text-red-700 hover:bg-red-500/10",
};

const SIZES = {
  sm: "px-3.5 py-1.5 text-sm rounded-lg",
  md: "px-4 py-2 text-sm rounded-lg",
  lg: "px-6 py-3 text-base rounded-xl",
};

export function buttonClass({ variant = "primary", size = "md", className = "" } = {}) {
  return `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`;
}

export default function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={buttonClass({ variant, size, className })}
      {...props}
    />
  );
}

export function ButtonLink({ variant, size, className, ...props }) {
  return <Link className={buttonClass({ variant, size, className })} {...props} />;
}
