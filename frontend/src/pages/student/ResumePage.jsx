import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
} from "lucide-react";
import { AppLayout } from "../../layouts/AppLayout";
import {
  Card,
  Button,
  Badge,
  SkillChip,
  ProgressBar,
  Modal,
  LoadingState,
  ErrorState,
} from "../../components/ui";
import { api } from "../../services/api";
import { useToast } from "../../hooks/useToast";
import { formatDate } from "../../utils/formatters";

export default function ResumePage() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [resumeData, setResumeData] = useState(null);
  const [compatibility, setCompatibility] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [resumeTextInput, setResumeTextInput] = useState("");
  const [fileNameInput, setFileNameInput] = useState("Updated_Resume_2026.pdf");

  const loadResumeAndCompatibility = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [resPayload, compatPayload] = await Promise.all([
        api.students.getResume(),
        api.ml.jobCompatibility(),
      ]);
      setResumeData(resPayload?.current_resume || null);
      setCompatibility(Array.isArray(compatPayload) ? compatPayload : []);
      if (resPayload?.current_resume?.raw_text) {
        setResumeTextInput(resPayload.current_resume.raw_text);
      }
    } catch (err) {
      setError(err.message || "Failed to load resume analysis.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResumeAndCompatibility();
  }, [loadResumeAndCompatibility]);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setAnalyzing(true);
    try {
      let res;
      if (selectedFile) {
        const fd = new FormData();
        fd.append("file", selectedFile);
        if (resumeTextInput.trim()) {
          fd.append("raw_text", resumeTextInput.trim());
        }
        res = await api.students.uploadResume(fd, true);
      } else {
        res = await api.students.uploadResume({
          file_name: fileNameInput || "Resume.pdf",
          raw_text: resumeTextInput,
          mime_type: "application/pdf",
          file_size: Math.max(resumeTextInput.length * 10, 24500),
        });
      }
      setResumeData(res);
      setShowUploadModal(false);
      addToast(`Resume analyzed! Score: ${res.resume_score} / 100`, "success");
      loadResumeAndCompatibility();
    } catch (err) {
      addToast(err.message || "Resume upload failed.", "error");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReanalyze = async () => {
    setAnalyzing(true);
    try {
      const raw = resumeData?.raw_text || resumeTextInput;
      const res = await api.students.uploadResume({
        file_name: resumeData?.file_name || "Resume.pdf",
        raw_text: raw,
        mime_type: "application/pdf",
        file_size: resumeData?.file_size || 120000,
      });
      setResumeData(res);
      addToast(`Re-analyzed resume! Score: ${res.resume_score} / 100`, "success");
      loadResumeAndCompatibility();
    } catch (err) {
      addToast(err.message || "Could not analyze resume.", "error");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <AppLayout title="Resume Management & ML Analysis">
        <LoadingState message="Loading resume analysis and job compatibility..." />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Resume Management & ML Analysis">
        <ErrorState message={error} onRetry={loadResumeAndCompatibility} />
      </AppLayout>
    );
  }

  const extractedSkills = resumeData?.extracted_skills || [];
  const sectionScores = resumeData?.section_scores || {};

  return (
    <AppLayout
      title="Resume & ML Analysis Dashboard"
      subtitle="Upload your resume, extract verified technical skills, and measure compatibility against active jobs"
    >
      <div className="space-y-6">
        {/* Current Resume Header Card */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EEEAFE] text-[#6555F5] flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-lg font-extrabold text-[#182044]">
                    {resumeData?.file_name || "No Resume Uploaded"}
                  </h2>
                  <Badge
                    variant={
                      resumeData?.status === "ANALYZED" ? "success" : "purple"
                    }
                  >
                    Resume Status: {resumeData?.status || "Not Uploaded"}
                  </Badge>
                </div>
                <p className="text-xs text-[#66708F] mt-1">
                  Uploaded on:{" "}
                  <strong>
                    {resumeData?.uploaded_at
                      ? formatDate(resumeData.uploaded_at)
                      : "—"}
                  </strong>
                </p>
                {extractedSkills.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-[#182044] mb-1.5">
                      Skills Extracted:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {extractedSkills.map((sk) => (
                        <SkillChip
                          key={sk.id || sk.skill_name}
                          name={sk.skill_name}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                variant="outline"
                onClick={handleReanalyze}
                disabled={analyzing || !resumeData}
              >
                <Sparkles className="w-4 h-4 text-[#6555F5]" />
                <span>{analyzing ? "Analyzing..." : "Analyze Resume"}</span>
              </Button>
              <Button onClick={() => setShowUploadModal(true)}>
                <Upload className="w-4 h-4" />
                <span>Upload New Resume</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Resume Analysis UI Grid */}
        {resumeData && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Resume Score & Section Breakdown (5 cols) */}
            <Card className="lg:col-span-5 space-y-5">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F4F5FF] border border-indigo-100">
                <div>
                  <p className="text-xs font-semibold text-[#66708F]">
                    Resume Score
                  </p>
                  <p className="text-3xl font-extrabold text-[#6555F5] mt-1">
                    {resumeData.resume_score} / 100
                  </p>
                </div>
                <Badge
                  variant={resumeData.resume_score >= 75 ? "success" : "purple"}
                >
                  {resumeData.resume_score >= 80
                    ? "Placement Ready"
                    : "Good Foundation"}
                </Badge>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#66708F]">
                  Section Score Breakdown
                </h4>
                {Object.entries(sectionScores).map(([secKey, val]) => (
                  <div key={secKey} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="capitalize font-semibold text-[#182044]">
                        {secKey}
                      </span>
                      <span className="font-bold text-[#6555F5]">{val}%</span>
                    </div>
                    <ProgressBar value={val} />
                  </div>
                ))}
              </div>
            </Card>

            {/* Strengths & Improvement Areas (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              <Card className="space-y-3">
                <h3 className="text-sm font-bold text-[#182044] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#32B67A]" />
                  <span>Strengths</span>
                </h3>
                <ul className="space-y-2">
                  {(resumeData.strengths || []).map((st, idx) => (
                    <li
                      key={idx}
                      className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-xs font-medium text-[#182044] flex items-center gap-2"
                    >
                      <span className="text-[#32B67A] font-bold">✓</span>
                      <span>{st}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="space-y-3">
                <h3 className="text-sm font-bold text-[#182044] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#F4B942]" />
                  <span>Improvement Areas</span>
                </h3>
                <ul className="space-y-2">
                  {(resumeData.improvement_areas || []).map((imp, idx) => (
                    <li
                      key={idx}
                      className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs font-medium text-[#182044] flex items-center gap-2"
                    >
                      <span className="text-[#D99B1E] font-bold">•</span>
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        )}

        {/* Job Compatibility Section */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#182044] flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#6555F5]" />
                <span>Job Compatibility Against Selected Jobs</span>
              </h3>
              <p className="text-xs text-[#66708F]">
                Live compatibility computed from your extracted skills and academic
                eligibility
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {compatibility.map((item) => (
              <div
                key={item.job_id}
                className="p-4 rounded-2xl bg-[#F4F5FF] border border-indigo-100/80 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#66708F]">
                      {item.company_name}
                    </span>
                    <Badge
                      variant={
                        item.match_percentage >= 80 ? "success" : "purple"
                      }
                    >
                      {item.match_percentage}% Compatible
                    </Badge>
                  </div>
                  <h4 className="text-sm font-bold text-[#182044] mt-1">
                    {item.job_title}
                  </h4>
                  <div className="mt-2">
                    <ProgressBar value={item.match_percentage} />
                  </div>
                  {item.missing_skills?.length > 0 && (
                    <p className="text-[11px] text-[#66708F] mt-2">
                      Missing: {item.missing_skills.slice(0, 3).join(", ")}
                    </p>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/skill-gap?job_id=${item.job_id}`)}
                >
                  Inspect Skill Gap →
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Upload / Paste Resume Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload & Analyze New Resume"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#182044] mb-1">
              Upload Resume File (.pdf, .docx, .txt — max 5 MB)
            </label>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setSelectedFile(f);
                if (f) setFileNameInput(f.name);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#F4F5FF]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#182044] mb-1">
              Filename
            </label>
            <input
              type="text"
              required
              value={fileNameInput}
              onChange={(e) => setFileNameInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#182044] mb-1">
              Resume Content (for instant NLP skill extraction & impact analysis)
            </label>
            <textarea
              rows={6}
              value={resumeTextInput}
              onChange={(e) => setResumeTextInput(e.target.value)}
              placeholder="Paste your resume text (Education, Skills, Projects, Quantifiable impact)..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowUploadModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={analyzing}>
              {analyzing ? "Analyzing..." : "Upload & Analyze"}
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
