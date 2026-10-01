// src/components/ui/CompanyAvatar.jsx
// ─── Company Initial Avatar ───────────────────────────────────
// Until companies can upload logos, show their initial on a colour
// picked from the name, so the same company always looks the same.

const COLORS = [
  "from-brand-500 to-brand-700",
  "from-[#0f2b44] to-ink",
  "from-teal-500 to-emerald-700",
  "from-amber-500 to-orange-600",
  "from-slate-500 to-slate-700",
  "from-cyan-600 to-teal-700",
];

const SIZES = {
  md: "w-11 h-11 text-base rounded-xl",
  lg: "w-14 h-14 text-xl rounded-2xl",
  xl: "w-16 h-16 text-2xl rounded-2xl",
};

export default function CompanyAvatar({ name = "", size = "md", className = "" }) {
  const hash = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return (
    <span
      aria-hidden="true"
      className={`flex items-center justify-center shrink-0 font-bold text-white bg-linear-to-br ${COLORS[hash % COLORS.length]} ${SIZES[size]} ${className}`}
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}
