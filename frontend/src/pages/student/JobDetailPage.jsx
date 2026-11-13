import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Calendar,
  Bookmark,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Building2,
  Sparkles,
  Target,
} from "lucide-react";
import { AppLayout } from "../../layouts/AppLayout";
import {
  Card,
  Button,
  Badge,
  SkillChip,
  LoadingState,
  ErrorState,
  Modal,
  ProgressBar,
} from "../../components/ui";
import { api } from "../../services/api";
import { useToast } from "../../hooks/useToast";
import { getInitials, formatDate } from "../../utils/formatters";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "eligibility", label: "Eligibility" },
  { key: "syllabus", label: "Syllabus" },
  { key: "tips", label: "Tips" },
];

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [job, setJob] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applying, setApplying] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);

  const loadJob = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.jobs.detail(id);
      setJob(data);
    } catch (err) {
      setError(err.message || "Failed to load job details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadJob();
  }, [loadJob]);

  const handleApply = async () => {
    if (!job) return;
    setApplying(true);
    try {
      await api.applications.apply({ job: job.id });
      addToast(`Application submitted for ${job.title} at ${job.company_name}!`, "success");
      loadJob();
    } catch (err) {
      addToast(err.message || "Could not submit application.", "error");
    } finally {
      setApplying(false);
    }
  };

  const handleBookmark = async () => {
    if (!job) return;
    try {
      const res = await api.jobs.bookmark(job.id);
      addToast(res.detail, "success");
      loadJob();
    } catch (err) {
      addToast(err.message || "Failed to bookmark job.", "error");
    }
  };

  if (loading) {
    return (
      <AppLayout title="Job Details">
        <LoadingState message="Loading job details and skill match..." />
      </AppLayout>
    );
  }

  if (error || !job) {
    return (
      <AppLayout title="Job Details">
        <ErrorState message={error || "Job not found"} onRetry={loadJob} />
      </AppLayout>
    );
  }

  const eligibility = job.eligibility || { is_eligible: true, checks: [] };
  const matchData = job.match_data || {
    match_percentage: 82,
    matching_skills: [],
    missing_skills: [],
    required_skills: [],
    preferred_skills: [],
  };

  return (
    <AppLayout
      title={`${job.company_name} — ${job.title}`}
      subtitle="Review role details, eligibility checks, syllabus, and your live skill match"
    >
      <div className="space-y-6">
        {/* Back Button */}
        <div>
          <button
            type="button"
            onClick={() => navigate("/jobs")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6555F5] hover:text-[#7C5CFF]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Jobs</span>
          </button>
        </div>

        {/* Job Header Card */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                style={{ backgroundColor: job.company_logo_color || "#6555F5" }}
                className="w-14 h-14 rounded-2xl text-white font-extrabold text-xl flex items-center justify-center shrink-0 shadow-md"
              >
                {getInitials(job.company_name)}
              </div>
              <div>
                <p className="text-xs font-semibold text-[#66708F]">
                  {job.company_name}
                </p>
                <h2 className="text-xl font-extrabold text-[#182044] mt-0.5">
                  {job.title}
                </h2>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-[#66708F]">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#6555F5]" />
                    📍 {job.location}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-[#6555F5]" />
                    💼 {job.employment_type}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#6555F5]" />
                    Deadline: {formatDate(job.deadline)}
                  </span>
                  <span className="font-bold text-[#182044]">
                    CTC: ₹{job.ctc_lpa} LPA
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                onClick={handleBookmark}
                aria-label="Save Job"
              >
                <Bookmark
                  className={`w-4 h-4 ${
                    job.is_saved ? "text-[#6555F5] fill-[#6555F5]" : ""
                  }`}
                />
                <span>{job.is_saved ? "Saved" : "Save"}</span>
              </Button>
              <Button
                variant={job.has_applied ? "secondary" : "primary"}
                disabled={job.has_applied || !eligibility.is_eligible || applying}
                onClick={handleApply}
              >
                {job.has_applied
                  ? "Applied ✓"
                  : applying
                  ? "Submitting..."
                  : "Apply Now"}
              </Button>
            </div>
          </div>

          {/* Detail Tabs */}
          <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold pt-transition ${
                  activeTab === t.key
                    ? "bg-[#6555F5] text-white shadow-nav"
                    : "text-[#66708F] hover:bg-[#F4F5FF] hover:text-[#182044]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Main Content Grid: Left Tab Content (8 cols) + Right Matching & Quick Links Panel (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            {activeTab === "overview" && (
              <Card className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-[#182044] mb-2">
                    About the Role
                  </h3>
                  <p className="text-xs text-[#66708F] leading-relaxed">
                    {job.about_role}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#182044] mb-2.5">
                    Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(matchData.required_skills?.length
                      ? matchData.required_skills
                      : ["Java", "DSA", "Problem Solving", "System Design"]
                    ).map((sk) => (
                      <SkillChip key={sk} name={sk} />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#182044] mb-2">
                    Eligibility Summary
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {eligibility.checks?.map((chk) => (
                      <div
                        key={chk.key}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F4F5FF] text-xs font-medium text-[#182044]"
                      >
                        {chk.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-[#32B67A] shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-[#E55353] shrink-0" />
                        )}
                        <span>{chk.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#182044] mb-2">
                    Job Description
                  </h3>
                  <p className="text-xs text-[#66708F] leading-relaxed">
                    {job.description}
                  </p>
                </div>

                {job.responsibilities?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-[#182044] mb-2">
                      Responsibilities
                    </h3>
                    <ul className="list-disc list-inside space-y-1.5 text-xs text-[#66708F]">
                      {job.responsibilities.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {matchData.preferred_skills?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-[#182044] mb-2">
                      Preferred Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {matchData.preferred_skills.map((sk) => (
                        <SkillChip key={sk} name={sk} />
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#66708F]">
                    Application Deadline
                  </span>
                  <span className="font-bold text-[#182044]">
                    {formatDate(job.deadline)}
                  </span>
                </div>
              </Card>
            )}

            {activeTab === "eligibility" && (
              <Card className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#182044]">
                      Job Eligibility Criteria
                    </h3>
                    <p className="text-xs text-[#66708F]">
                      Automatically verified against your academic profile
                    </p>
                  </div>
                  <Badge variant={eligibility.is_eligible ? "success" : "error"}>
                    {eligibility.is_eligible ? "✓ Eligible to Apply" : "Criteria Not Met"}
                  </Badge>
                </div>

                <div className="space-y-3 pt-2">
                  {eligibility.checks?.map((chk) => (
                    <div
                      key={chk.key}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-[#F4F5FF] border border-indigo-100/80"
                    >
                      <div className="flex items-center gap-3">
                        {chk.passed ? (
                          <CheckCircle2 className="w-5 h-5 text-[#32B67A]" />
                        ) : (
                          <XCircle className="w-5 h-5 text-[#E55353]" />
                        )}
                        <span className="text-sm font-semibold text-[#182044]">
                          {chk.label}
                        </span>
                      </div>
                      {chk.student_value && (
                        <span className="text-xs font-medium text-[#66708F]">
                          Your profile: <strong>{chk.student_value}</strong>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {activeTab === "syllabus" && (
              <Card className="space-y-4">
                <h3 className="text-base font-bold text-[#182044]">
                  Assessment & Interview Syllabus
                </h3>
                <div className="space-y-3">
                  {(job.syllabus?.length
                    ? job.syllabus
                    : [
                        "Round 1: Online Assessment (DSA, Aptitude & Core CS MCQs)",
                        "Round 2: Technical Interview (Data Structures, Projects & SQL)",
                        "Round 3: System Design & Managerial Round",
                        "Round 4: HR Discussion",
                      ]
                  ).map((round, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[#F4F5FF] flex items-start gap-3"
                    >
                      <span className="w-6 h-6 rounded-full bg-[#6555F5] text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-xs font-semibold text-[#182044] mt-1">
                        {round}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {activeTab === "tips" && (
              <Card className="space-y-4">
                <h3 className="text-base font-bold text-[#182044]">
                  Preparation & Interview Tips
                </h3>
                <div className="space-y-2.5">
                  {(job.interview_tips?.length
                    ? job.interview_tips
                    : [
                        "Review core data structures, time complexity, and SQL joins.",
                        "Be ready to explain architectural decisions in your portfolio projects.",
                        "Practice mock tests in the PlaceTrace Practice & Quizzes module.",
                      ]
                  ).map((tip, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[#EEEAFE]/50 border border-[#6555F5]/20 text-xs text-[#182044] flex items-start gap-2.5"
                    >
                      <Sparkles className="w-4 h-4 text-[#6555F5] shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column: Job Matching Panel & Quick Links */}
          <div className="lg:col-span-4 space-y-5">
            {/* Your Match Panel */}
            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#66708F]">
                    Your Match
                  </p>
                  <p className="text-3xl font-extrabold text-[#6555F5]">
                    {matchData.match_percentage}%
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#EEEAFE] text-[#6555F5] flex items-center justify-center">
                  <Target className="w-6 h-6" />
                </div>
              </div>

              <ProgressBar value={matchData.match_percentage} />

              <div>
                <p className="text-xs font-bold text-[#182044] mb-2">
                  Matching Skills
                </p>
                {matchData.matching_skills?.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {matchData.matching_skills.map((sk) => (
                      <SkillChip key={sk} name={sk} variant="have" />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#66708F]">
                    Add matching skills to your profile to increase your score.
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs font-bold text-[#182044] mb-2">
                  Missing Skills
                </p>
                {matchData.missing_skills?.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {matchData.missing_skills.map((sk) => (
                      <SkillChip key={sk} name={sk} variant="need" />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#32B67A] font-medium">
                    ✓ You have all required and preferred skills!
                  </p>
                )}
              </div>

              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => navigate(`/skill-gap?job_id=${job.id}`)}
              >
                Open Full Skill Gap Analysis →
              </Button>
            </Card>

            {/* Quick Links Card */}
            <Card className="space-y-3">
              <h4 className="text-sm font-bold text-[#182044]">Quick Links</h4>
              <div className="space-y-2">
                {job.company_website && (
                  <a
                    href={job.company_website}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#F4F5FF] hover:bg-[#EEEAFE] text-xs font-semibold text-[#182044] pt-transition"
                  >
                    <span>Official Website</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#6555F5]" />
                  </a>
                )}
                {job.apply_link && (
                  <a
                    href={job.apply_link}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#F4F5FF] hover:bg-[#EEEAFE] text-xs font-semibold text-[#182044] pt-transition"
                  >
                    <span>Apply Online</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#6555F5]" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setShowCompanyModal(true)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#F4F5FF] hover:bg-[#EEEAFE] text-xs font-semibold text-[#182044] pt-transition"
                >
                  <span>Company Profile</span>
                  <Building2 className="w-3.5 h-3.5 text-[#6555F5]" />
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Company Profile Modal */}
      <Modal
        isOpen={showCompanyModal}
        onClose={() => setShowCompanyModal(false)}
        title={`${job.company_name} — Company Profile`}
      >
        <div className="space-y-3 text-xs">
          <div className="flex items-center gap-3">
            <div
              style={{ backgroundColor: job.company_logo_color || "#6555F5" }}
              className="w-12 h-12 rounded-xl text-white font-bold text-base flex items-center justify-center"
            >
              {getInitials(job.company_name)}
            </div>
            <div>
              <h4 className="text-base font-bold text-[#182044]">
                {job.company_name}
              </h4>
              <p className="text-[#66708F]">{job.company_industry}</p>
            </div>
          </div>
          <p className="text-[#66708F] leading-relaxed">
            {job.company_description ||
              `${job.company_name} is an active campus recruitment partner on PlaceTrace.`}
          </p>
        </div>
      </Modal>
    </AppLayout>
  );
}
