"use client";
// src/components/jobs/WithdrawButton.jsx
// ─── Withdraw Application ─────────────────────────────────────

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export default function WithdrawButton({ jobId, size = "sm" }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const handleWithdraw = async () => {
    if (!confirm("Withdraw this application?")) return;

    setBusy(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/apply`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error withdrawing application");

      toast.success("Application withdrawn");
      router.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button variant="danger" size={size} onClick={handleWithdraw} disabled={busy}>
      {busy ? "Withdrawing..." : "Withdraw"}
    </Button>
  );
}
