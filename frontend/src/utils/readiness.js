/**
 * Deterministic Placement Readiness calculation utility (mirrors backend/apps/students/readiness.py).
 */
export const READINESS_WEIGHTS = {
  profile_completion: { label: "Profile Completion", weight: 0.12 },
  resume_readiness: { label: "Resume Readiness", weight: 0.14 },
  technical_skills: { label: "Technical Skills", weight: 0.18 },
  dsa_and_roadmap: { label: "DSA & Roadmap Progress", weight: 0.16 },
  mock_test_performance: { label: "Mock Test Performance", weight: 0.14 },
  projects_score: { label: "Projects Portfolio", weight: 0.12 },
  applications_activity: { label: "Applications Activity", weight: 0.07 },
  interview_prep: { label: "Interview Preparation", weight: 0.07 },
};

export function calculateReadinessFromBreakdown(breakdown = {}) {
  let total = 0;
  for (const [key, meta] of Object.entries(READINESS_WEIGHTS)) {
    const val = Number(breakdown[key] ?? 0);
    total += val * meta.weight;
  }
  return Math.max(0, Math.min(100, Math.round(total)));
}
