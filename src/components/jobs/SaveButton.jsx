"use client";
// src/components/jobs/SaveButton.jsx
// ─── Bookmark Toggle ──────────────────────────────────────────

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function SaveButton({ jobId, saved: initialSaved, withLabel = false }) {
  const router = useRouter();
  const toast = useToast();
  const [saved, setSaved] = useState(initialSaved);
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/saved-jobs", {
        method: saved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error updating saved jobs");

      setSaved(!saved);
      toast.success(saved ? "Removed from saved jobs" : "Job saved");
      router.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const label = saved ? "Unsave job" : "Save job";

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-label={label}
      aria-pressed={saved}
      title={label}
      className={`inline-flex items-center gap-2 shrink-0 rounded-lg border text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 ${
        withLabel ? "px-4 py-2" : "p-2"
      } ${
        saved
          ? "border-brand-500/40 bg-brand-500/10 text-brand-500"
          : "border-line text-steel hover:text-brand-500 hover:border-cool"
      }`}
    >
      <Bookmark
        className="w-4 h-4"
        fill={saved ? "currentColor" : "none"}
        aria-hidden="true"
      />
      {withLabel && (saved ? "Saved" : "Save")}
    </button>
  );
}
