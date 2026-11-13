import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  CheckCircle2,
  Award,
  Briefcase,
  Trophy,
  Sparkles,
  Info,
} from "lucide-react";
import { AppLayout } from "../../layouts/AppLayout";
import {
  Card,
  KpiCard,
  Roadmap,
  TaskCard,
  JobCard,
  LoadingState,
  ErrorState,
  Modal,
  ProgressBar,
  Button,
} from "../../components/ui";
import { api } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { READINESS_WEIGHTS } from "../../utils/readiness";

export default function DashboardPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showReadinessModal, setShowReadinessModal] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.analytics.studentDashboard();
      setDashboardData(data);
    } catch (err) {
      setError(err.message || "Failed to load student dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleToggleRoadmapTopic = async (progressId, nextStatus) => {
    try {
      await api.study.updateRoadmapTopic(progressId, nextStatus);
      addToast("Roadmap progress updated!", "success");
      loadDashboard();
    } catch (err) {
      addToast(err.message || "Failed to update topic status.", "error");
    }
  };

  const handleToggleTask = async (taskId, nextStatus) => {
    try {
      await api.study.updateTask(taskId, { status: nextStatus });
      addToast(
        nextStatus === "COMPLETED" ? "Study task completed!" : "Task reopened.",
        "success"
      );
      loadDashboard();
    } catch (err) {
      addToast(err.message || "Failed to update task.", "error");
    }
  };

  const handleApplyJob = async (job) => {
    try {
      await api.applications.apply({ job: job.id });
      addToast(`Successfully applied to ${job.company_name}!`, "success");
      loadDashboard();
    } catch (err) {
      addToast(err.message || "Could not submit application.", "error");
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <LoadingState message="Loading your personalized placement dashboard..." />
      </AppLayout>
    );
  }

  if (error || !dashboardData) {
    return (
      <AppLayout>
        <ErrorState message={error} onRetry={loadDashboard} />
      </AppLayout>
    );
  }

  const { profile, roadmap = [], upcoming_tasks = [], recommended_jobs = [] } = dashboardData;
  const kpis = profile?.kpis || {};
  const studentName = profile?.full_name || user?.full_name || "Student";
  const breakdown = profile?.readiness_breakdown || {};

  return (
    <AppLayout
      title={`Welcome back, ${studentName}! 👋`}
      subtitle="Keep going! You're closer to your dream job."
    >
      <div className="space-y-6">
        {/* Top Compact KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={TrendingUp}
            label="Placement Readiness"
            value={`${kpis.readiness_score ?? profile.readiness_score ?? 0}%`}
            trend={`${kpis.readiness_trend >= 0 ? "+" : ""}${kpis.readiness_trend ?? 5}%`}
            sublabel="Click to view formula breakdown"
            accent="purple"
            onClick={() => setShowReadinessModal(true)}
          />
          <KpiCard
            icon={CheckCircle2}
            label="Topics Completed"
            value={`${kpis.topics_completed ?? 0} / ${kpis.total_topics ?? 8}`}
            sublabel="Roadmap & curriculum milestones"
            accent="green"
            onClick={() => navigate("/study-planner")}
          />
          <KpiCard
            icon={Award}
            label="Mock Tests"
            value={kpis.mock_tests_count ?? 0}
            trend={kpis.mock_tests_trend ?? 1}
            sublabel="Practice & mock assessments"
            accent="amber"
            onClick={() => navigate("/practice")}
          />
          <KpiCard
            icon={Briefcase}
            label="Applications"
            value={kpis.applications_count ?? 0}
            sublabel={`${kpis.projects_count ?? 0} portfolio projects active`}
            accent="blue"
            onClick={() => navigate("/applications")}
          />
        </div>

        {/* Main Two-Column Grid: Placement Roadmap (Left) + Upcoming Tasks & Motivation Card (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <Roadmap
              items={roadmap.slice(0, 5)}
              onToggleStatus={handleToggleRoadmapTopic}
              onViewAll={() => navigate("/study-planner")}
            />
          </div>

          <div className="lg:col-span-5 space-y-5">
            {/* Upcoming Tasks Card */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-[#182044]">
                    Upcoming Tasks
                  </h3>
                  <p className="text-xs text-[#66708F]">
                    Scheduled in your Study Planner
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/study-planner")}
                  className="text-xs font-semibold text-[#6555F5] hover:text-[#7C5CFF]"
                >
                  View All →
                </button>
              </div>

              {upcoming_tasks.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-xs text-[#66708F] mb-3">
                    All study tasks completed! Plan your next session.
                  </p>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => navigate("/study-planner")}
                  >
                    + Add Study Task
                  </Button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {upcoming_tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggleComplete={handleToggleTask}
                    />
                  ))}
                </div>
              )}
            </Card>

            {/* Motivation Card */}
            <Card className="bg-gradient-to-r from-[#EEEAFE] to-[#F4F5FF] border border-[#6555F5]/20">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#6555F5] text-white flex items-center justify-center shrink-0 shadow-nav">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#182044]">
                    🏆 You're doing great!
                  </h4>
                  <p className="text-xs text-[#66708F] mt-0.5">
                    Keep learning and improving. Check your skill gap to unlock
                    higher job match scores.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Recommended Jobs Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#182044] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#6555F5]" />
                <span>Recommended Job Opportunities</span>
              </h3>
              <p className="text-xs text-[#66708F]">
                Matched using your CGPA ({profile.cgpa}), branch ({profile.branch}),
                and verified skills
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/jobs")}
              className="text-xs font-semibold text-[#6555F5] hover:text-[#7C5CFF]"
            >
              Explore All Jobs →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommended_jobs.map((job) => (
              <div key={job.id} className="space-y-1.5">
                <JobCard
                  job={job}
                  onViewDetail={(j) => navigate(`/jobs/${j.id}`)}
                  onApply={handleApplyJob}
                />
                {job.recommendation_reasons?.length > 0 && (
                  <div className="px-3 py-1.5 rounded-xl bg-white/80 border border-indigo-100 text-[11px] text-[#66708F] flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-[#6555F5] shrink-0" />
                    <span className="truncate">
                      <strong>Why recommended:</strong>{" "}
                      {job.recommendation_reasons[0]}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deterministic Placement Readiness Breakdown Modal */}
      <Modal
        isOpen={showReadinessModal}
        onClose={() => setShowReadinessModal(false)}
        title="Placement Readiness Calculation Breakdown"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-[#F4F5FF] flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#66708F]">
                Overall Readiness Score
              </p>
              <p className="text-2xl font-extrabold text-[#6555F5]">
                {kpis.readiness_score ?? profile.readiness_score ?? 0}%
              </p>
            </div>
            <p className="text-[11px] text-[#66708F] max-w-[220px] text-right">
              Deterministic weighted average of 8 real placement preparation
              factors.
            </p>
          </div>

          <div className="space-y-3">
            {Object.entries(READINESS_WEIGHTS).map(([key, meta]) => {
              const factorVal = breakdown[key] ?? 0;
              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#182044]">
                      {meta.label}{" "}
                      <span className="text-[#66708F] font-normal">
                        ({Math.round(meta.weight * 100)}% weight)
                      </span>
                    </span>
                    <span className="font-bold text-[#6555F5]">{factorVal}%</span>
                  </div>
                  <ProgressBar value={factorVal} />
                </div>
              );
            })}
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
