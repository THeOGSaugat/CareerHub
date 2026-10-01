"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LogOut, Menu, X } from "lucide-react";
import { logoutHandler } from "@/app/actions/auth";
import { ButtonLink } from "@/components/ui/Button";
import Logo from "@/components/ui/Logo";
import { useToast } from "@/components/ui/Toast";

const GUEST_LINKS = [{ href: "/jobs", label: "Browse Jobs" }];

const SEEKER_LINKS = [
  { href: "/jobs", label: "Browse Jobs" },
  { href: "/applications", label: "My Applications" },
  { href: "/saved-jobs", label: "Saved Jobs" },
  { href: "/profile", label: "Profile" },
];

const EMPLOYER_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/new", label: "Post Job" },
  { href: "/jobs", label: "Browse Jobs" },
];

// `user` and `unreadCount` come from the root layout, which reads the auth cookie
export default function Navbar({ user, unreadCount = 0 }) {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const links =
    user?.role === "SEEKER"
      ? SEEKER_LINKS
      : user?.role === "EMPLOYER"
        ? EMPLOYER_LINKS
        : GUEST_LINKS;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auth now lives in an httpOnly cookie: clear what older versions stored
  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const result = await logoutHandler();
      setMenuOpen(false);
      router.push(result.redirectTo);
      router.refresh();
    } catch {
      toast.error("Error logging out");
    } finally {
      setLoggingOut(false);
    }
  };

  const isActive = (path) => pathname === path;

  const navLinkClass = (path) =>
    `relative px-3 py-2 text-sm rounded-lg font-semibold transition-colors duration-300 after:absolute after:left-3 after:right-3 after:bottom-0.5 after:h-0.5 after:rounded-full after:bg-brand-500 after:origin-left after:transition-transform after:duration-300 ${
      isActive(path)
        ? "text-brand-600 after:scale-x-100"
        : "text-ink/80 hover:text-brand-600 after:scale-x-0 hover:after:scale-x-100"
    }`;

  return (
    <nav
      className={`sticky top-0 z-40 border-b transition-all duration-300 ${
        scrolled
          ? "bg-white/85 backdrop-blur-xl border-line shadow-lg shadow-ink/5"
          : "bg-white border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <Logo />

          {/* Role-based nav links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={navLinkClass(link.href)}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link
                  href="/notifications"
                  aria-label={
                    unreadCount > 0
                      ? `Notifications, ${unreadCount} unread`
                      : "Notifications"
                  }
                  className={`relative p-2 rounded-lg transition-colors ${
                    isActive("/notifications")
                      ? "bg-brand-50 text-brand-600"
                      : "text-ink/80 hover:text-brand-600 hover:bg-brand-50"
                  }`}
                >
                  <Bell className="w-5 h-5" aria-hidden="true" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 px-1 flex items-center justify-center rounded-full bg-brand-500 text-white text-[10px] font-bold">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg font-medium text-ink/80 hover:text-brand-600 hover:bg-brand-50 transition-colors duration-300 cursor-pointer disabled:opacity-60"
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  {loggingOut ? "Logging out..." : "Log out"}
                </button>
              </>
            ) : (
              <>
                <ButtonLink
                  href="/auth/login"
                  variant="ghost"
                  size="sm"
                  className="hidden sm:inline-flex"
                >
                  Sign in
                </ButtonLink>
                <ButtonLink href="/auth/register" variant="secondary" size="sm">
                  Sign up
                </ButtonLink>
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="md:hidden p-2 rounded-lg text-ink/80 hover:text-ink hover:bg-ink/5 cursor-pointer"
            >
              {menuOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile nav links */}
        {menuOpen && (
          <div className="md:hidden flex flex-col gap-1 pb-4 animate-fade-in">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`${navLinkClass(link.href)} py-2.5`}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg font-medium text-ink/80 hover:text-ink hover:bg-ink/5 text-left cursor-pointer disabled:opacity-60"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                {loggingOut ? "Logging out..." : "Log out"}
              </button>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setMenuOpen(false)}
                className={`${navLinkClass("/auth/login")} py-2.5 sm:hidden`}
              >
                Log in
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
