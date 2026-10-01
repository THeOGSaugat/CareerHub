"use client";
// src/components/profile/CvCard.jsx
// ─── Profile CV ───────────────────────────────────────────────
// Upload a CV once; the apply form reuses it.

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Upload } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { uploadCv, validateCvFile } from "@/lib/uploadCv";

export default function CvCard({ cvUrl }) {
  const router = useRouter();
  const toast = useToast();
  const fileInput = useRef(null);
  const [busy, setBusy] = useState(false);

  const saveCvUrl = async (value) => {
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cvUrl: value }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error saving CV");
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;

    const problem = validateCvFile(file);
    if (problem) {
      toast.error(problem);
      return;
    }

    setBusy(true);
    try {
      await saveCvUrl(await uploadCv(file));
      toast.success("CV saved to your profile");
      router.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm("Remove the CV from your profile?")) return;

    setBusy(true);
    try {
      await saveCvUrl(null);
      toast.success("CV removed");
      router.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="p-5">
      <h2 className="font-semibold text-ink mb-1">CV / Resume</h2>
      <p className="text-xs text-steel mb-4">
        {cvUrl
          ? "Used automatically when you apply. Applications you already sent keep the CV they were sent with."
          : "Upload once and reuse it for every application. PDF, up to 5MB."}
      </p>

      {cvUrl && (
        <a
          href={cvUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2.5 mb-3 rounded-lg bg-white border border-line text-sm font-medium text-brand-500 hover:text-brand-700"
        >
          <FileText className="w-4 h-4" aria-hidden="true" />
          View current CV
        </a>
      )}

      <input
        ref={fileInput}
        type="file"
        accept="application/pdf"
        onChange={handleFile}
        className="hidden"
      />
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={busy}
          onClick={() => fileInput.current?.click()}
        >
          <Upload className="w-4 h-4" aria-hidden="true" />
          {busy ? "Working..." : cvUrl ? "Replace CV" : "Upload CV"}
        </Button>
        {cvUrl && (
          <Button variant="danger" size="sm" disabled={busy} onClick={handleRemove}>
            Remove
          </Button>
        )}
      </div>
    </Card>
  );
}
