// src/lib/match.js
// ─── Skill Matching ───────────────────────────────────────────
// Compares the skills a job asks for with the skills on a seeker's
// profile (case-insensitive). Safe for server and client.

const normalize = (skill) => skill.trim().toLowerCase();

export function matchSkills(jobSkills = [], userSkills = []) {
  const have = new Set(userSkills.map(normalize));
  const matched = jobSkills.filter((skill) => have.has(normalize(skill)));
  const missing = jobSkills.filter((skill) => !have.has(normalize(skill)));
  const total = jobSkills.length;

  return {
    matched,
    missing,
    total,
    percent: total ? Math.round((matched.length / total) * 100) : 0,
  };
}
