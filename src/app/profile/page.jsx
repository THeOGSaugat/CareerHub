// src/app/profile/page.jsx
// ─── My Profile (seeker) ──────────────────────────────────────

import { notFound } from "next/navigation";
import CvCard from "@/components/profile/CvCard";
import ProfileForm from "@/components/profile/ProfileForm";
import SkillsEditor from "@/components/profile/SkillsEditor";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/session";

export const metadata = { title: "My Profile" };

export default async function ProfilePage() {
  const user = await requireRole("SEEKER");

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      name: true,
      email: true,
      headline: true,
      location: true,
      bio: true,
      experience: true,
      education: true,
      cvUrl: true,
      skills: { select: { id: true, name: true }, orderBy: { id: "asc" } },
    },
  });
  if (!profile) notFound();

  // What employers look for first, used for the completeness meter
  const checklist = [
    { label: "Headline", done: !!profile.headline },
    { label: "Location", done: !!profile.location },
    { label: "About you", done: !!profile.bio },
    { label: "Experience", done: !!profile.experience },
    { label: "Education", done: !!profile.education },
    { label: "CV uploaded", done: !!profile.cvUrl },
    { label: "At least 3 skills", done: profile.skills.length >= 3 },
  ];
  const done = checklist.filter((item) => item.done).length;
  const percent = Math.round((done / checklist.length) * 100);
  const missing = checklist.filter((item) => !item.done);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <PageHeader
        title="My profile"
        description="Employers see this when you apply. A complete profile gets noticed."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <ProfileForm profile={profile} />
        </div>

        <div className="flex flex-col gap-6">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-ink">Profile strength</h2>
              <span className="text-sm font-semibold text-brand-500">
                {percent}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-ink/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-linear-to-r from-brand-500 to-brand-600"
                style={{ width: `${percent}%` }}
              />
            </div>
            {missing.length > 0 ? (
              <p className="text-xs text-steel mt-3">
                Still to add: {missing.map((item) => item.label).join(", ")}.
              </p>
            ) : (
              <p className="text-xs text-emerald-600 mt-3">
                Your profile is complete.
              </p>
            )}
          </Card>

          <CvCard cvUrl={profile.cvUrl} />
          <SkillsEditor skills={profile.skills} />
        </div>
      </div>
    </div>
  );
}
