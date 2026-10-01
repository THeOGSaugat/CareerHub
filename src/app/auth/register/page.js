"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, Search } from "lucide-react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "SEEKER",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error);
        setLoading(false);
        return;
      }

      // The API has set the httpOnly auth cookie. New seekers start on their
      // profile so skill matching works from their first search.
      router.push(data.data.user.role === "SEEKER" ? "/profile" : "/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="hero-glow min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-ink">Create an account</h1>
          <p className="text-steel mt-2">
            Join CareerHub and start your journey
          </p>
        </div>

        <Card className="p-8 shadow-xl shadow-ink/5">
          <Alert className="mb-6">{error}</Alert>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <p className="block text-sm font-medium text-ink/80 mb-2">
                I am a...
              </p>
              <div className="grid grid-cols-2 gap-3">
                <RoleButton
                  selected={form.role === "SEEKER"}
                  onClick={() => setForm({ ...form, role: "SEEKER" })}
                  icon={Search}
                  label="Job seeker"
                />
                <RoleButton
                  selected={form.role === "EMPLOYER"}
                  onClick={() => setForm({ ...form, role: "EMPLOYER" })}
                  icon={Building2}
                  label="Employer"
                />
              </div>
            </div>

            <Field label="Full name" htmlFor="name">
              <Input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
              />
            </Field>

            <Field label="Email address" htmlFor="email">
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="john@example.com"
              />
            </Field>

            <Field label="Password" htmlFor="password">
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
              />
            </Field>

            <Button type="submit" size="lg" disabled={loading} className="w-full">
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-steel">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-brand-500 hover:text-brand-700 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}

function RoleButton({ selected, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all cursor-pointer ${
        selected
          ? "border-brand-500 bg-brand-500/10 text-brand-500 shadow-sm shadow-brand-500/10"
          : "border-line bg-mist text-steel hover:border-cool hover:text-ink/80"
      }`}
    >
      <Icon className="w-5 h-5" aria-hidden="true" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
