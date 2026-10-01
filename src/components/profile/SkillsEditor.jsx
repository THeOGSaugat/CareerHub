"use client";
// src/components/profile/SkillsEditor.jsx
// ─── Skills Editor ────────────────────────────────────────────

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";

export default function SkillsEditor({ skills }) {
  const router = useRouter();
  const toast = useToast();
  const [newSkill, setNewSkill] = useState("");
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;

    setAdding(true);
    try {
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSkill }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error adding skill");

      setNewSkill("");
      router.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (id) => {
    setRemovingId(id);
    try {
      const res = await fetch("/api/skills", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error removing skill");

      router.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <Card className="p-5">
      <h2 className="font-semibold text-ink mb-1">Skills</h2>
      <p className="text-xs text-steel mb-4">
        Used to match you with jobs and shown to employers when you apply.
      </p>

      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <Input
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          maxLength={40}
          aria-label="New skill"
          placeholder="e.g. React"
          className="py-2 text-sm"
        />
        <Button type="submit" size="sm" disabled={adding}>
          {adding ? "Adding..." : "Add"}
        </Button>
      </form>

      {skills.length === 0 ? (
        <p className="text-sm text-muted">No skills added yet.</p>
      ) : (
        <ul className="flex gap-2 flex-wrap">
          {skills.map((skill) => (
            <li
              key={skill.id}
              className={`flex items-center gap-1.5 bg-brand-500/10 border border-brand-500/20 text-brand-700 pl-3 pr-1.5 py-1 rounded-full text-sm font-medium ${
                removingId === skill.id ? "opacity-50" : ""
              }`}
            >
              {skill.name}
              <button
                type="button"
                onClick={() => handleRemove(skill.id)}
                disabled={removingId === skill.id}
                className="p-0.5 rounded-full text-brand-500 hover:text-red-600 hover:bg-red-500/10 cursor-pointer"
                aria-label={`Remove ${skill.name}`}
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
