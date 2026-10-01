// src/app/layout.js
// ─── Root Layout ──────────────────────────────────────────────
// Wraps all pages with the shared Navbar, Footer, global styles, and metadata.

import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TopBar from "@/components/TopBar";
import { ToastProvider } from "@/components/ui/Toast";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

// Exposed as --font-jakarta and picked up by --font-sans in globals.css
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata = {
  title: {
    default: "CareerHub — Find Your Next Opportunity",
    template: "%s — CareerHub",
  },
  description:
    "CareerHub is a job board connecting employers with talented job seekers. Browse open roles, apply in minutes, and track every application in one place.",
  openGraph: {
    siteName: "CareerHub",
    type: "website",
  },
};

export default async function RootLayout({ children }) {
  // Read the session on the server so the navbar always matches the auth cookie
  const session = await getSessionUser();
  const user = session ? { id: session.id, role: session.role } : null;

  const unreadCount = user
    ? await prisma.notification
        .count({ where: { userId: user.id, read: false } })
        .catch(() => 0)
    : 0;

  return (
    <html lang="en" className={jakarta.variable}>
      <body className="antialiased flex flex-col min-h-screen">
        <ToastProvider>
          <TopBar user={user} />
          <Navbar user={user} unreadCount={unreadCount} />
          <main className="flex-1">{children}</main>
          <Footer user={user} />
        </ToastProvider>
      </body>
    </html>
  );
}
