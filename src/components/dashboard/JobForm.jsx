"use client";
// src/components/dashboard/JobForm.jsx
// ─── Job Form ─────────────────────────────────────────────────
// Used by both "Post a job" and "Edit job". Pass `job` to edit.

import { useState } from "react";
import { useRouter } from "next/navigation";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { CATEGORIES, JOB_TYPES, LEVELS, WORK_MODES } from "@/lib/jobStyles";

export default function JobForm({ job }) {
  const router = useRouter();
  const toast = useToast();
  const isEdit = !!job;

  const [formData, setFormData] = useState({
    title: job?.title ?? "",
    company: job?.company ?? "",
    location: job?.location ?? "",
    workMode: job?.workMode ?? "ONSITE",
    type: job?.type ?? "FULL_TIME",
    level: job?.level ?? "",
    category: job?.category ?? "Engineering",
    salary: job?.salary ?? "",
    salaryMax: job?.salaryMax ?? "",
    deadline: job?.deadline ? new Date(job.deadline).toISOString().slice(0, 10) : "",
    skills: job?.skills?.join(", ") ?? "",
    description: job?.description ?? "",
    status: job?.status ?? "OPEN",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch(isEdit ? `/api/jobs/${job.id}` : "/api/jobs", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      toast.success(isEdit ? "Job updated" : "Job posted");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <Card className="p-6 md:p-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Alert>{error}</Alert>

        <Field label="Job title" htmlFor="title" required>
          <Input
            id="title"
            name="title"
            required
            maxLength={120}
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. React Developer"
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Company" htmlFor="company" required>
            <Input
              id="company"
              name="company"
              required
              maxLength={80}
              value={formData.company}
              onChange={handleChange}
              placeholder="e.g. Acme Ltd"
            />
          </Field>
          <Field label="Location" htmlFor="location" required>
            <Input
              id="location"
              name="location"
              required
              maxLength={80}
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Kathmandu"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <Field label="Job type" htmlFor="type">
            <Select id="type" name="type" value={formData.type} onChange={handleChange}>
              {Object.entries(JOB_TYPES).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Work mode" htmlFor="workMode">
            <Select
              id="workMode"
              name="workMode"
              value={formData.workMode}
              onChange={handleChange}
            >
              {Object.entries(WORK_MODES).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Experience level" htmlFor="level">
            <Select id="level" name="level" value={formData.level} onChange={handleChange}>
              <option value="">Not specified</option>
              {Object.entries(LEVELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Category" htmlFor="category">
            <Select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Field label="Salary (Rs.)" htmlFor="salary" required>
            <Input
              id="salary"
              type="number"
              name="salary"
              required
              min="0"
              value={formData.salary}
              onChange={handleChange}
              placeholder="e.g. 600000"
            />
          </Field>
          <Field
            label="Up to (Rs.)"
            htmlFor="salaryMax"
            hint="Optional: shows a salary range."
          >
            <Input
              id="salaryMax"
              type="number"
              name="salaryMax"
              min="0"
              value={formData.salaryMax}
              onChange={handleChange}
              placeholder="e.g. 900000"
            />
          </Field>
          <Field
            label="Apply by"
            htmlFor="deadline"
            hint="Optional: closes automatically after this date."
          >
            <Input
              id="deadline"
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
            />
          </Field>
        </div>

        <Field
          label="Required skills"
          htmlFor="skills"
          hint="Separate with commas. Candidates see how many they match."
        >
          <Input
            id="skills"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            placeholder="e.g. React, Node.js, SQL"
          />
        </Field>

        <Field label="Description" htmlFor="description" required>
          <Textarea
            id="description"
            name="description"
            required
            rows="8"
            maxLength={10000}
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the role, responsibilities and what you're looking for..."
          />
        </Field>

        {isEdit && (
          <Field
            label="Status"
            htmlFor="status"
            hint="Closed jobs are hidden from the job list and can't be applied to."
            className="sm:max-w-xs"
          >
            <Select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
            </Select>
          </Field>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-line">
          <Button variant="ghost" onClick={() => router.push("/dashboard")}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving
              ? isEdit
                ? "Saving..."
                : "Posting..."
              : isEdit
                ? "Save changes"
                : "Post job"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
