// src/lib/uploadCv.js
// ─── CV Upload (client side) ──────────────────────────────────

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/** Returns an error message, or "" when the file is acceptable. */
export function validateCvFile(file) {
  if (!file) return "Please select your CV (PDF)";
  if (file.type !== "application/pdf") return "Only PDF files are allowed";
  if (file.size > MAX_FILE_SIZE) return "File too large. Max size is 5MB";
  return "";
}

/** Upload a CV through our API and return its hosted URL. */
export async function uploadCv(file) {
  const formData = new FormData();
  formData.append("file", file);

  // No Content-Type on purpose — the browser sets the multipart boundary itself
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "CV upload failed");

  return data.data.url;
}
