// src/components/ui/Logo.jsx
// ─── Brand Mark ───────────────────────────────────────────────

import Link from "next/link";
import { BriefcaseBusiness } from "lucide-react";

// tone="light" is for dark (navy) backgrounds such as the footer
export default function Logo({ className = "", tone = "dark" }) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 group ${className}`}>
      <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-500 text-white shadow-md shadow-brand-500/25 transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-6">
        <BriefcaseBusiness className="w-5 h-5" aria-hidden="true" />
      </span>
      <span
        className={`text-xl font-bold tracking-tight ${tone === "light" ? "text-white" : "text-ink"}`}
      >
        Career
        <span className={tone === "light" ? "text-brand-300" : "text-brand-500"}>
          Hub
        </span>
      </span>
    </Link>
  );
}
