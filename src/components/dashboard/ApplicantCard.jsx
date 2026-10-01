"use client";
// src/components/dashboard/ApplicantCard.jsx
// ─── Applicant Card ───────────────────────────────────────────
// One application as the employer sees it: profile, skill match,
// pipeline stage and a private note.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Mail, MapPin } from "lucide-react";
import SkillChips from "@/components/jobs/SkillChips";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Select, Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { APPLICATION_STATUSES, formatDate, getStatusMeta } from "@/lib/jobStyles";
import { matchSkills } from "@/lib/match";

export default function ApplicantCard({ app, jobSkills }) {
  const router = useRouter();
  const toast = useToast();
  const [note, setNote] = useState(app.note || "");
  const [showMore, setShowMore] = useState(false);
  const [busy, setBusy] = useState(false);

  const { seeker } = app;
  const seekerSkills = seeker.skills.map((skill) => skill.name);
  const match = jobSkills.length > 0 ? matchSkills(jobSkills, seekerSkills) : null;
  const status = getStatusMeta(app.status);
  const hasProfile = seeker.bio || seeker.experience || seeker.education;

  const update = async (changes, successMessage) => {
    setBusy(true);
    try {
      const res = await fetch("/api/dashboard/application", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appId: app.id, ...changes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      toast.success(successMessage);
      router.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-line p-4 md:p-5">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-ink">{seeker.name}</p>
          {seeker.headline && (
            <p className="text-sm text-ink/80">{seeker.headline}</p>
          )}
          <p className="text-xs text-steel mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <a
              href={`mailto:${seeker.email}`}
              className="inline-flex items-center gap-1 hover:text-brand-500"
            >
              <Mail className="w-3.5 h-3.5" aria-hidden="true" />
              {seeker.email}
            </a>
            {seeker.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                {seeker.location}
              </span>
            )}
            <span>
              {app.yearsOfExperience} yr
              {app.yearsOfExperience === "1" ? "" : "s"} experience
            </span>
            <span>Applied {formatDate(app.createdAt)}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {match && (
            <Badge tone={match.percent >= 50 ? "emerald" : "slate"}>
              {match.matched.length}/{match.total} skills
            </Badge>
          )}
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>
      </div>

      {(match ? jobSkills.length > 0 : seekerSkills.length > 0) && (
        <div className="mt-3">
          {/* With required skills: show those, highlighting the ones the applicant has */}
          <SkillChips
            skills={match ? jobSkills : seekerSkills}
            matched={match?.matched}
            limit={10}
          />
        </div>
      )}

      <div className="mt-4">
        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">
          Cover letter
        </p>
        <p
          className={`text-sm text-ink/80 whitespace-pre-line leading-relaxed ${showMore ? "" : "line-clamp-3"}`}
        >
          {app.coverLetter}
        </p>
      </div>

      {showMore && hasProfile && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            ["About", seeker.bio],
            ["Experience", seeker.experience],
            ["Education", seeker.education],
          ].map(
            ([label, text]) =>
              text && (
                <div key={label}>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">
                    {label}
                  </p>
                  <p className="text-sm text-ink/80 whitespace-pre-line leading-relaxed">
                    {text}
                  </p>
                </div>
              ),
          )}
        </div>
      )}

      <div className="flex items-center gap-4 mt-3">
        <a
          href={app.cvUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-brand-500 hover:text-brand-700 font-medium"
        >
          <FileText className="w-4 h-4" aria-hidden="true" />
          View CV
        </a>
        <button
          type="button"
          onClick={() => setShowMore(!showMore)}
          aria-expanded={showMore}
          className="text-sm text-steel hover:text-ink cursor-pointer"
        >
          {showMore ? "Show less" : "Show full application"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-line">
        <div>
          <label
            htmlFor={`stage-${app.id}`}
            className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5"
          >
            Stage
          </label>
          <Select
            id={`stage-${app.id}`}
            value={app.status}
            disabled={busy}
            onChange={(e) =>
              update(
                { status: e.target.value },
                `Moved to ${getStatusMeta(e.target.value).label} — ${seeker.name} has been notified`,
              )
            }
            className="text-sm py-2"
          >
            {Object.entries(APPLICATION_STATUSES).map(([value, { label }]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor={`note-${app.id}`}
            className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5"
          >
            Private note (only you can see this)
          </label>
          <div className="flex items-start gap-2">
            <Textarea
              id={`note-${app.id}`}
              rows="1"
              maxLength={2000}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Strong portfolio, schedule a call"
              className="text-sm py-2"
            />
            <Button
              variant="secondary"
              size="md"
              disabled={busy || note === (app.note || "")}
              onClick={() => update({ note }, "Note saved")}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
