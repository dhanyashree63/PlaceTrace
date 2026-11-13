import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Target,
  ArrowDown,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Plus,
} from "lucide-react";
import { AppLayout } from "../../layouts/AppLayout";
import {
  Card,
  Button,
  Badge,
  SkillChip,
  ProgressBar,
  LoadingState,
  ErrorState,
} from "../../components/ui";
import { api } from "../../services/api";
import { useToast } from "../../hooks/useToast";

export default function SkillGapPage() {
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(
    searchParams.get("job_id") || ""
  );
  const [gapResult, setGapResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const runSkillGapAnalysis = useCallback(async (jobId) => {
    setAnalyzing(true);
    setError("");
    try {
      const data = await api.ml.skillGap(jobId || undefined);
      setGapResult(data);
      if (data?.job?.id) {
        setSelectedJobId(String(data.job.id));
      }
    } catch (err) {
      setError(err.message || "Failed to run skill-gap analysis.");
    } finally {
      setAnalyzing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    api.jobs
      .list()
      .then((res) => {
        if (!mounted) return;
        const list = Array.isArray(res) ? res : res?.results || [];
        setJobs(list);
        const initialId = searchParams.get("job_id") || list[0]?.id || "";
        runSkillGapAnalysis(initialId);
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message || "Failed to load jobs for skill gap.");
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, [searchParams, runSkillGapAnalysis]);

  const handleAddSkillToProfile = async (skillName) => {
    try {
      await api.students.addSkill({
        skill_name: skillName,
        category: "PROGRAMMING",
        proficiency: "INTERMEDIATE",
      });
      addToast(`Added ${skillName} to your profile! Re-analyzing...`, "success");
      runSkillGapAnalysis(selectedJobId);
    } catch (err) {
      addToast(err.message || "Could not add skill.", "error");
    }
  };

  if (loading) {
    return (
      <AppLayout title="Skill Gap Analysis">
        <LoadingState message="Running ML skill-gap analysis..." />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Skill Gap Analysis">
        <ErrorState
          message={error}
          onRetry={() => runSkillGapAnalysis(selectedJobId)}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Skill Gap Analysis"
      subtitle="Select a target role, compare required skills against your profile, and close high-priority gaps"
    >
      <div className="space-y-6">
        {/* Step 1: Select a Job -> Analyze */}
        <Card className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex-1">
              <label
                htmlFor="skill-gap-job-select"
                className="block text-xs font-bold text-[#182044] mb-1.5"
              >
                Select a Job Opportunity to Analyze
              </label>
              <select
                id="skill-gap-job-select"
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:border-[#6555F5]"
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.company_name} — {j.title} ({j.location}, ₹{j.ctc_lpa} LPA)
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={() => runSkillGapAnalysis(selectedJobId)}
              disabled={analyzing}
            >
              <Target className="w-4 h-4" />
              <span>{analyzing ? "Analyzing..." : "Analyze Skill Gap"}</span>
            </Button>
          </div>
        </Card>

        {gapResult && (
          <>
            {/* Visual Flow Summary Bar */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-[#66708F] bg-white p-3.5 rounded-2xl shadow-card border border-slate-100">
              <span className="px-3 py-1 rounded-lg bg-[#F4F5FF] text-[#182044]">
                1. Selected: {gapResult.job?.company_name} ({gapResult.job?.title})
              </span>
              <ArrowDown className="w-3.5 h-3.5 text-[#6555F5] sm:-rotate-90" />
              <span className="px-3 py-1 rounded-lg bg-[#EEEAFE] text-[#6555F5]">
                2. Match Score: {gapResult.match_percentage}%
              </span>
              <ArrowDown className="w-3.5 h-3.5 text-[#6555F5] sm:-rotate-90" />
              <span className="px-3 py-1 rounded-lg bg-emerald-50 text-[#32B67A]">
                3. You Have: {gapResult.you_have?.length || 0} Skills
              </span>
              <ArrowDown className="w-3.5 h-3.5 text-[#6555F5] sm:-rotate-90" />
              <span className="px-3 py-1 rounded-lg bg-amber-50 text-amber-800">
                4. Missing: {gapResult.you_need?.length || 0} Skills
              </span>
            </div>

            {/* Required Skills & Your Skills Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Card className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#182044]">
                    Required Skills ({gapResult.job?.company_name})
                  </h3>
                  <Badge variant="purple">
                    {gapResult.required_skills?.length || 0} Core Skills
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(gapResult.required_skills || []).map((sk) => (
                    <SkillChip key={sk} name={sk} />
                  ))}
                </div>
              </Card>

              <Card className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#182044]">
                    Your Current Profile Skills
                  </h3>
                  <Badge variant="neutral">
                    {gapResult.your_skills?.length || 0} Total Skills
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(gapResult.your_skills || []).map((sk) => (
                    <SkillChip key={sk} name={sk} />
                  ))}
                </div>
              </Card>
            </div>

            {/* Visual Categories: You Have (Green), You Need (Purple), High Priority (Highlighted) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* You Have */}
              <Card className="space-y-3 border-emerald-200/80">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#182044] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#32B67A]" />
                    <span>You Have</span>
                  </h3>
                  <Badge variant="success">
                    {gapResult.you_have?.length || 0} Matched
                  </Badge>
                </div>
                <p className="text-xs text-[#66708F]">
                  Verified skills on your profile matching this job
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {(gapResult.you_have || []).length === 0 ? (
                    <p className="text-xs text-[#66708F]">
                      No matching skills found yet.
                    </p>
                  ) : (
                    gapResult.you_have.map((sk) => (
                      <SkillChip key={sk} name={sk} variant="have" />
                    ))
                  )}
                </div>
              </Card>

              {/* You Need */}
              <Card className="space-y-3 border-indigo-200/80">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#182044] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#6555F5]" />
                    <span>You Need</span>
                  </h3>
                  <Badge variant="purple">
                    {gapResult.you_need?.length || 0} Missing
                  </Badge>
                </div>
                <p className="text-xs text-[#66708F]">
                  Click any skill below once learned to add it to your profile
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {(gapResult.you_need || []).length === 0 ? (
                    <p className="text-xs text-[#32B67A] font-semibold">
                      ✓ Zero missing skills! You are 100% matched.
                    </p>
                  ) : (
                    gapResult.you_need.map((sk) => (
                      <button
                        key={sk}
                        type="button"
                        onClick={() => handleAddSkillToProfile(sk)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#EEEAFE] text-[#6555F5] hover:bg-[#6555F5] hover:text-white pt-transition"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{sk}</span>
                      </button>
                    ))
                  )}
                </div>
              </Card>

              {/* High Priority */}
              <Card className="space-y-3 border-amber-300/80 bg-amber-50/20">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#182044] flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-[#F4B942]" />
                    <span>High Priority</span>
                  </h3>
                  <Badge variant="warning">
                    {gapResult.high_priority?.length || 0} Mandatory
                  </Badge>
                </div>
                <p className="text-xs text-[#66708F]">
                  Mandatory role skills to prioritize in your Study Planner
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {(gapResult.high_priority || []).length === 0 ? (
                    <p className="text-xs text-[#32B67A] font-semibold">
                      ✓ All mandatory skills satisfied!
                    </p>
                  ) : (
                    gapResult.high_priority.map((sk) => (
                      <SkillChip key={sk} name={sk} variant="priority" />
                    ))
                  )}
                </div>
              </Card>
            </div>

            {/* Actionable Upskilling Recommendations */}
            {gapResult.action_plan?.length > 0 && (
              <Card className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#182044]">
                    Recommended Action Plan to Reach 95%+ Match
                  </h3>
                  <span className="text-xs font-bold text-[#6555F5]">
                    Current Match: {gapResult.match_percentage}%
                  </span>
                </div>
                <ProgressBar value={gapResult.match_percentage} />
                <ul className="space-y-2 pt-1">
                  {gapResult.action_plan.map((step, i) => (
                    <li
                      key={i}
                      className="p-3 rounded-xl bg-[#F4F5FF] text-xs font-medium text-[#182044]"
                    >
                      {i + 1}. {step}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
