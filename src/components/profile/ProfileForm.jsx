"use client";
// src/components/profile/ProfileForm.jsx
// ─── Profile Details Form ─────────────────────────────────────

import { useState } from "react";
import { useRouter } from "next/navigation";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";

export default function ProfileForm({ profile }) {
  const router = useRouter();
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: profile.name || "",
    headline: profile.headline || "",
    location: profile.location || "",
    bio: profile.bio || "",
    experience: profile.experience || "",
    education: profile.education || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error saving profile");

      toast.success("Profile saved");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Alert>{error}</Alert>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Full name" htmlFor="name" required>
            <Input
              id="name"
              name="name"
              required
              maxLength={80}
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
            />
          </Field>
          <Field label="Email" htmlFor="email" hint="Email can't be changed.">
            <Input id="email" value={profile.email} disabled readOnly />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Headline" htmlFor="headline">
            <Input
              id="headline"
              name="headline"
              maxLength={120}
              value={formData.headline}
              onChange={handleChange}
              placeholder="e.g. Frontend developer with 3 years of React"
            />
          </Field>
          <Field label="Location" htmlFor="location">
            <Input
              id="location"
              name="location"
              maxLength={80}
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Kathmandu"
            />
          </Field>
        </div>

        <Field label="About you" htmlFor="bio">
          <Textarea
            id="bio"
            name="bio"
            rows="4"
            maxLength={1000}
            value={formData.bio}
            onChange={handleChange}
            placeholder="A short introduction: what you do and what you're looking for."
          />
        </Field>

        <Field
          label="Experience"
          htmlFor="experience"
          hint="One role per line, most recent first."
        >
          <Textarea
            id="experience"
            name="experience"
            rows="5"
            maxLength={3000}
            value={formData.experience}
            onChange={handleChange}
            placeholder={"Frontend Developer, Acme Ltd (2023 – present)\nIntern, Example Co (2022)"}
          />
        </Field>

        <Field label="Education" htmlFor="education">
          <Textarea
            id="education"
            name="education"
            rows="3"
            maxLength={3000}
            value={formData.education}
            onChange={handleChange}
            placeholder="BSc Computer Science, Tribhuvan University (2022)"
          />
        </Field>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save profile"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
