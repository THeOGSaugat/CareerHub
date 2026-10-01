"use client";
// src/components/jobs/ApplyButton.jsx
// ─── Apply Button + Application Form ──────────────────────────
// The one and only apply form. Reuses the CV stored on the seeker's
// profile when there is one, so it doesn't have to be uploaded again.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import { Field, Input, Textarea, inputClass } from "@/components/ui/Field";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { uploadCv, validateCvFile } from "@/lib/uploadCv";

export default function ApplyButton({ job, profileCvUrl, size = "md", children }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size={size} onClick={() => setOpen(true)}>
        {children || "Apply"}
      </Button>
      {open && (
        <ApplyModal
          job={job}
          profileCvUrl={profileCvUrl}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function ApplyModal({ job, profileCvUrl, onClose }) {
  const router = useRouter();
  const toast = useToast();

  const [formData, setFormData] = useState({
    coverLetter: "",
    yearsOfExperience: "",
  });
  const [useSavedCv, setUseSavedCv] = useState(!!profileCvUrl);
  const [saveToProfile, setSaveToProfile] = useState(!profileCvUrl);
  const [file, setFile] = useState(null);
  const [stage, setStage] = useState(""); // "" | "uploading" | "applying"
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const selected = e.target.files[0] || null;
    const problem = selected ? validateCvFile(selected) : "";
    setError(problem);
    if (problem) e.target.value = "";
    setFile(problem ? null : selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!useSavedCv && !file) {
      setError("Please select your CV (PDF)");
      return;
    }

    try {
      let cvUrl = profileCvUrl;

      if (!useSavedCv) {
        // Step 1: upload the file to Cloudinary via our own API route
        setStage("uploading");
        cvUrl = await uploadCv(file);

        if (saveToProfile) {
          // Best effort: the application itself must not fail because of this
          await fetch("/api/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cvUrl }),
          }).catch(() => {});
        }
      }

      // Step 2: submit the application with the CV's URL
      setStage("applying");
      const res = await fetch(`/api/jobs/${job.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, cvUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      toast.success(`Application sent to ${job.company}`);
      onClose();
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setStage("");
    }
  };

  return (
    <Modal title={`Apply to ${job.title}`} onClose={onClose}>
      <Alert className="mb-4">{error}</Alert>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="CV / Resume" required>
          {profileCvUrl && (
            <div className="flex flex-col gap-2 mb-2">
              <label className="flex items-center gap-2.5 text-sm text-ink cursor-pointer">
                <input
                  type="radio"
                  name="cvChoice"
                  checked={useSavedCv}
                  onChange={() => setUseSavedCv(true)}
                  className="accent-brand-500"
                />
                Use the CV from my profile
                <a
                  href={profileCvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-brand-500 hover:text-brand-700"
                >
                  <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                  View
                </a>
              </label>
              <label className="flex items-center gap-2.5 text-sm text-ink cursor-pointer">
                <input
                  type="radio"
                  name="cvChoice"
                  checked={!useSavedCv}
                  onChange={() => setUseSavedCv(false)}
                  className="accent-brand-500"
                />
                Upload a different CV
              </label>
            </div>
          )}

          {!useSavedCv && (
            <>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className={`${inputClass} text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-brand-500/15 file:text-brand-700 file:cursor-pointer cursor-pointer`}
              />
              <p className="text-xs text-muted mt-1.5">
                {file
                  ? `Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`
                  : "PDF only, up to 5MB"}
              </p>
              <label className="flex items-center gap-2 text-sm text-ink/80 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveToProfile}
                  onChange={(e) => setSaveToProfile(e.target.checked)}
                  className="accent-brand-500"
                />
                Save this CV to my profile for next time
              </label>
            </>
          )}
        </Field>

        <Field label="Years of experience" htmlFor="yearsOfExperience" required>
          <Input
            id="yearsOfExperience"
            type="number"
            min="0"
            max="60"
            name="yearsOfExperience"
            required
            value={formData.yearsOfExperience}
            onChange={handleChange}
            placeholder="e.g. 2"
          />
        </Field>

        <Field label="Cover letter" htmlFor="coverLetter" required>
          <Textarea
            id="coverLetter"
            name="coverLetter"
            required
            rows="5"
            maxLength={5000}
            value={formData.coverLetter}
            onChange={handleChange}
            placeholder="Tell them why you're a good fit..."
          />
        </Field>

        <div className="flex gap-3 justify-end pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!!stage}>
            {stage === "uploading"
              ? "Uploading CV..."
              : stage === "applying"
                ? "Submitting..."
                : "Submit application"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
