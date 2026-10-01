// src/components/Footer.jsx
// ─── Site Footer ──────────────────────────────────────────────

import Link from "next/link";
import Logo from "@/components/ui/Logo";

const linkClass =
  "inline-block text-sm text-white/60 hover:text-brand-300 hover:translate-x-1 transition-all duration-300";

export default function Footer({ user }) {
  const seekerLinks = [
    { href: "/jobs", label: "Browse jobs" },
    ...(user?.role === "SEEKER"
      ? [
          { href: "/applications", label: "My applications" },
          { href: "/saved-jobs", label: "Saved jobs" },
          { href: "/profile", label: "My profile" },
        ]
      : !user
        ? [{ href: "/auth/register", label: "Create an account" }]
        : []),
  ];

  const employerLinks =
    user?.role === "EMPLOYER"
      ? [
          { href: "/dashboard", label: "Dashboard" },
          { href: "/dashboard/new", label: "Post a job" },
        ]
      : !user
        ? [
            { href: "/auth/register", label: "Post a job" },
            { href: "/auth/login", label: "Employer log in" },
          ]
        : [];

  return (
    <footer className="bg-ink mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Logo tone="light" className="mb-4" />
            <p className="text-sm text-white/60 leading-relaxed max-w-xs">
              Connecting talented professionals with their next career
              opportunity. Find jobs, hire talent, and grow your career.
            </p>
          </div>

          <FooterColumn title="For job seekers" links={seekerLinks} />
          {employerLinks.length > 0 && (
            <FooterColumn title="For employers" links={employerLinks} />
          )}
        </div>

        <div className="mt-10 pt-8 border-t border-white/10">
          <p className="text-sm text-white/50">
            © {new Date().getFullYear()} CareerHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
        {title}
      </h4>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className={linkClass}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
