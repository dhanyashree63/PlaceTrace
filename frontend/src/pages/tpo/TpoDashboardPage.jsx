import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Briefcase,
  ClipboardList,
  Award,
  TrendingUp,
  Building2,
  Plus,
  Sparkles,
} from "lucide-react";
import { AppLayout } from "../../layouts/AppLayout";
import {
  Card,
  KpiCard,
  Button,
  Badge,
  SkillChip,
  SearchBar,
  Pagination,
  Modal,
  LoadingState,
  ErrorState,
} from "../../components/ui";
import { api } from "../../services/api";
import { useToast } from "../../hooks/useToast";

const TPO_TABS = [
  { key: "students", label: "Student Management" },
  { key: "companies", label: "Company Management" },
  { key: "jobs", label: "Job Management" },
  { key: "applications", label: "Applicant Stages" },
];

export default function TpoDashboardPage() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState("students");

  const [kpis, setKpis] = useState({});
  const [studentsPayload, setStudentsPayload] = useState({
    results: [],
    current_page: 1,
    total_pages: 1,
  });
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Student filters
  const [studentSearch, setStudentSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("-cgpa");
  const [studentPage, setStudentPage] = useState(1);

  // Company modal
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    name: "",
    industry: "Enterprise Software",
    headquarters: "Bengaluru",
    website: "https://",
    description: "",
    status: "ACTIVE",
  });

  // Job modal
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [jobForm, setJobForm] = useState({
    company: "",
    title: "",
    category: "SOFTWARE_DEVELOPMENT",
    location: "Bengaluru",
    employment_type: "Full Time",
    ctc_lpa: "18.00",
    min_cgpa: "7.50",
    allowed_branches_str: "CSE, ISE, ECE",
    graduation_year: 2027,
    deadline: "2026-12-15",
    about_role: "",
    description: "",
    required_skills_str: "Java, DSA, SQL, React",
    preferred_skills_str: "Docker, System Design",
    status: "PUBLISHED",
  });

  const loadTpoPortal = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const stuParams = new URLSearchParams();
      if (studentSearch.trim()) stuParams.set("search", studentSearch.trim());
      if (branchFilter) stuParams.set("branch", branchFilter);
      if (statusFilter) stuParams.set("placement_status", statusFilter);
      if (sortBy) stuParams.set("ordering", sortBy);
      stuParams.set("page", String(studentPage));

      const [analyticsRes, stuRes, compRes, jobRes, appRes] = await Promise.all([
        api.analytics.platform(),
        api.students.listAll(`?${stuParams.toString()}`),
        api.companies.list(),
        api.jobs.list(),
        api.applications.list(),
      ]);

      setKpis(analyticsRes?.kpis || {});
      if (Array.isArray(stuRes)) {
        setStudentsPayload({ results: stuRes, current_page: 1, total_pages: 1 });
      } else {
        setStudentsPayload({
          results: stuRes?.results || [],
          current_page: stuRes?.current_page || 1,
          total_pages: stuRes?.total_pages || 1,
        });
      }
      const compList = Array.isArray(compRes) ? compRes : compRes?.results || [];
      setCompanies(compList);
      setJobs(Array.isArray(jobRes) ? jobRes : jobRes?.results || []);
      setApplications(Array.isArray(appRes) ? appRes : appRes?.results || []);
      if (compList[0] && !jobForm.company) {
        setJobForm((prev) => ({ ...prev, company: compList[0].id }));
      }
    } catch (err) {
      setError(err.message || "Failed to load TPO dashboard.");
    } finally {
      setLoading(false);
    }
  }, [studentSearch, branchFilter, statusFilter, sortBy, studentPage]);

  useEffect(() => {
    loadTpoPortal();
  }, [loadTpoPortal]);

  const handleUpdateStudentStatus = async (studentId, newStatus) => {
    try {
      await api.students.updateStudentStatus(studentId, {
        placement_status: newStatus,
      });
      addToast("Updated student placement status!", "success");
      loadTpoPortal();
    } catch (err) {
      addToast(err.message || "Failed to update student status.", "error");
    }
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    try {
      await api.companies.create(companyForm);
      addToast(`Company ${companyForm.name} added!`, "success");
      setShowCompanyModal(false);
      loadTpoPortal();
    } catch (err) {
      addToast(err.message || "Could not create company.", "error");
    }
  };

  const handleParseJdSkills = async () => {
    if (!jobForm.description.trim()) return;
    try {
      const parsed = await api.ml.parseJd(jobForm.description, jobForm.title);
      if (parsed.required_skills?.length) {
        setJobForm((prev) => ({
          ...prev,
          required_skills_str: parsed.required_skills.join(", "),
          preferred_skills_str: (parsed.preferred_skills || []).join(", "),
        }));
        addToast("Extracted skills from JD using ML service!", "success");
      }
    } catch (err) {
      addToast(err.message || "JD parsing failed.", "error");
    }
  };

  const handleSaveJob = async (e) => {
    e.preventDefault();
    const payload = {
      company: Number(jobForm.company),
      title: jobForm.title,
      category: jobForm.category,
      location: jobForm.location,
      employment_type: jobForm.employment_type,
      ctc_lpa: parseFloat(jobForm.ctc_lpa || "12.0"),
      min_cgpa: parseFloat(jobForm.min_cgpa || "7.0"),
      allowed_branches: jobForm.allowed_branches_str
        .split(",")
        .map((b) => b.trim().toUpperCase())
        .filter(Boolean),
      graduation_year: Number(jobForm.graduation_year) || 2027,
      deadline: jobForm.deadline,
      about_role: jobForm.about_role || jobForm.description,
      description: jobForm.description,
      required_skill_names: jobForm.required_skills_str
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      preferred_skill_names: jobForm.preferred_skills_str
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      status: jobForm.status,
    };

    try {
      if (editingJobId) {
        await api.jobs.update(editingJobId, payload);
        addToast("Job updated successfully!", "success");
      } else {
        await api.jobs.create(payload);
        addToast("Job published!", "success");
      }
      setShowJobModal(false);
      loadTpoPortal();
    } catch (err) {
      addToast(err.message || "Could not save job.", "error");
    }
  };

  const handleToggleJobStatus = async (job, nextStatus) => {
    try {
      await api.jobs.update(job.id, { status: nextStatus });
      addToast(`Job '${job.title}' marked as ${nextStatus}!`, "success");
      loadTpoPortal();
    } catch (err) {
      addToast(err.message || "Could not update job status.", "error");
    }
  };

  const handleUpdateApplicationStage = async (appId, newStage) => {
    try {
      await api.applications.update(appId, { stage: newStage });
      addToast(`Application stage updated to ${newStage}!`, "success");
      loadTpoPortal();
    } catch (err) {
      addToast(err.message || "Could not update stage.", "error");
    }
  };

  if (loading) {
    return (
      <AppLayout title="TPO Portal">
        <LoadingState message="Loading TPO placement management portal..." />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="TPO Portal">
        <ErrorState message={error} onRetry={loadTpoPortal} />
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="TPO Placement Management Portal"
      subtitle="Manage student cohorts, partner companies, job drives, eligibility, and interview selections"
    >
      <div className="space-y-6">
        {/* TPO 6 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <KpiCard
            icon={Users}
            label="Total Students"
            value={kpis.total_students ?? 0}
            accent="purple"
          />
          <KpiCard
            icon={Briefcase}
            label="Active Jobs"
            value={kpis.active_jobs ?? 0}
            accent="blue"
          />
          <KpiCard
            icon={ClipboardList}
            label="Applications"
            value={kpis.applications ?? 0}
            accent="purple"
          />
          <KpiCard
            icon={Award}
            label="Placed Students"
            value={kpis.placed_students ?? 0}
            accent="green"
          />
          <KpiCard
            icon={TrendingUp}
            label="Placement Rate"
            value={`${kpis.placement_rate ?? 0}%`}
            accent="amber"
          />
          <KpiCard
            icon={Building2}
            label="Companies"
            value={kpis.companies ?? 0}
            accent="blue"
          />
        </div>

        {/* TPO Sub-Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            {TPO_TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap pt-transition ${
                  activeTab === t.key
                    ? "bg-[#6555F5] text-white shadow-nav"
                    : "bg-white text-[#66708F] hover:text-[#182044]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCompanyModal(true)}
            >
              <Plus className="w-3.5 h-3.5" /> Add Company
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setEditingJobId(null);
                setShowJobModal(true);
              }}
            >
              <Plus className="w-3.5 h-3.5" /> Create Job
            </Button>
          </div>
        </div>

        {/* Tab 1: TPO Student Management Table */}
        {activeTab === "students" && (
          <Card className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <SearchBar
                value={studentSearch}
                onChange={(val) => {
                  setStudentSearch(val);
                  setStudentPage(1);
                }}
                placeholder="Search student name, USN, email, or skill..."
              />
              <select
                value={branchFilter}
                onChange={(e) => {
                  setBranchFilter(e.target.value);
                  setStudentPage(1);
                }}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
              >
                <option value="">All Branches</option>
                <option value="CSE">CSE</option>
                <option value="ISE">ISE</option>
                <option value="ECE">ECE</option>
                <option value="AIML">AIML</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setStudentPage(1);
                }}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
              >
                <option value="">All Statuses</option>
                <option value="PLACED">Placed</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="UNPLACED">Unplaced</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
              >
                <option value="-cgpa">Sort: Highest CGPA</option>
                <option value="-readiness_score">Sort: Highest Readiness</option>
                <option value="user__full_name">Sort: Name (A-Z)</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F4F5FF] text-[#66708F] text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Branch</th>
                    <th className="py-3 px-4">CGPA</th>
                    <th className="py-3 px-4">Skills</th>
                    <th className="py-3 px-4">Applications</th>
                    <th className="py-3 px-4">Placement Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {studentsPayload.results.map((stu) => (
                    <tr key={stu.id} className="hover:bg-[#F4F5FF]/50">
                      <td className="py-3 px-4">
                        <p className="font-bold text-[#182044]">{stu.full_name}</p>
                        <p className="text-[11px] text-[#66708F]">{stu.usn}</p>
                      </td>
                      <td className="py-3 px-4 font-semibold">{stu.branch}</td>
                      <td className="py-3 px-4 font-bold text-[#6555F5]">
                        {stu.cgpa}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {(stu.skills || []).slice(0, 4).map((s) => (
                            <SkillChip key={s} name={s} />
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        {stu.applications_count ?? 0}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            stu.placement_status === "PLACED"
                              ? "success"
                              : stu.placement_status === "INTERNSHIP"
                              ? "purple"
                              : "warning"
                          }
                        >
                          {stu.placement_status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <select
                          aria-label={`Change status for ${stu.full_name}`}
                          value={stu.placement_status}
                          onChange={(e) =>
                            handleUpdateStudentStatus(stu.id, e.target.value)
                          }
                          className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs bg-white"
                        >
                          <option value="UNPLACED">Unplaced</option>
                          <option value="INTERNSHIP">Internship</option>
                          <option value="PLACED">Placed</option>
                          <option value="MULTIPLE_OFFERS">Multiple Offers</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={studentsPayload.current_page}
              totalPages={studentsPayload.total_pages}
              onPageChange={setStudentPage}
            />
          </Card>
        )}

        {/* Tab 2: TPO Company Management */}
        {activeTab === "companies" && (
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F4F5FF] text-[#66708F] text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                    <th className="py-3.5 px-4">Company</th>
                    <th className="py-3.5 px-4">Industry</th>
                    <th className="py-3.5 px-4">Open Jobs</th>
                    <th className="py-3.5 px-4">Applications</th>
                    <th className="py-3.5 px-4">Selections</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {companies.map((comp) => (
                    <tr key={comp.id} className="hover:bg-[#F4F5FF]/50">
                      <td className="py-3.5 px-4 font-bold text-[#182044]">
                        {comp.name}
                      </td>
                      <td className="py-3.5 px-4 text-[#66708F]">
                        {comp.industry}
                      </td>
                      <td className="py-3.5 px-4 font-semibold">
                        {comp.open_jobs_count ?? 0}
                      </td>
                      <td className="py-3.5 px-4 font-semibold">
                        {comp.applications_count ?? 0}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#32B67A]">
                        {comp.selections_count ?? 0}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            comp.status === "ACTIVE" ? "success" : "neutral"
                          }
                        >
                          {comp.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setJobForm((prev) => ({
                              ...prev,
                              company: comp.id,
                            }));
                            setEditingJobId(null);
                            setShowJobModal(true);
                          }}
                        >
                          + Post Job
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Tab 3: TPO Job Management */}
        {activeTab === "jobs" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job) => (
              <Card key={job.id} className="flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-[#66708F]">
                        {job.company_name}
                      </p>
                      <h4 className="text-base font-bold text-[#182044]">
                        {job.title}
                      </h4>
                    </div>
                    <Badge
                      variant={
                        job.status === "PUBLISHED" ? "success" : "neutral"
                      }
                    >
                      {job.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#66708F] mt-2">
                    📍 {job.location} • ₹{job.ctc_lpa} LPA • Min CGPA:{" "}
                    {job.min_cgpa} • Applicants:{" "}
                    <strong>{job.applicants_count ?? 0}</strong>
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingJobId(job.id);
                      setJobForm({
                        company: job.company,
                        title: job.title,
                        category: job.category,
                        location: job.location,
                        employment_type: job.employment_type,
                        ctc_lpa: String(job.ctc_lpa),
                        min_cgpa: String(job.min_cgpa),
                        allowed_branches_str: (
                          job.allowed_branches || ["CSE", "ISE"]
                        ).join(", "),
                        graduation_year: job.graduation_year || 2027,
                        deadline: job.deadline,
                        about_role: job.about_role,
                        description: job.description,
                        required_skills_str: (
                          job.match_data?.required_skills || []
                        ).join(", "),
                        preferred_skills_str: (
                          job.match_data?.preferred_skills || []
                        ).join(", "),
                        status: job.status,
                      });
                      setShowJobModal(true);
                    }}
                  >
                    Edit Job
                  </Button>
                  {job.status === "PUBLISHED" ? (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleToggleJobStatus(job, "CLOSED")}
                    >
                      Close Job
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleToggleJobStatus(job, "PUBLISHED")}
                    >
                      Publish Job
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setActiveTab("applications")}
                  >
                    View Applicants ({job.applicants_count ?? 0})
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Tab 4: Applicant Stage Updates */}
        {activeTab === "applications" && (
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F4F5FF] text-[#66708F] text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Branch / CGPA</th>
                    <th className="py-3.5 px-4">Company & Role</th>
                    <th className="py-3.5 px-4">Match %</th>
                    <th className="py-3.5 px-4">Current Stage</th>
                    <th className="py-3.5 px-4 text-right">Update Stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-[#F4F5FF]/50">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-[#182044]">
                          {app.student_name}
                        </p>
                        <p className="text-[11px] text-[#66708F]">
                          {app.student_usn}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        {app.student_branch} •{" "}
                        <strong>{app.student_cgpa}</strong>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-[#182044]">
                          {app.company_name}
                        </p>
                        <p className="text-[11px] text-[#66708F]">
                          {app.job_title}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="purple">{app.match_score}%</Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            app.stage === "SELECTED"
                              ? "success"
                              : app.stage === "REJECTED"
                              ? "error"
                              : "purple"
                          }
                        >
                          {app.status_label}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <select
                          aria-label={`Update stage for ${app.student_name}`}
                          value={app.stage}
                          onChange={(e) =>
                            handleUpdateApplicationStage(app.id, e.target.value)
                          }
                          className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs bg-white"
                        >
                          <option value="APPLIED">Applied</option>
                          <option value="ASSESSMENT">Assessment</option>
                          <option value="TECHNICAL_INTERVIEW">
                            Technical Interview
                          </option>
                          <option value="HR_INTERVIEW">HR Interview</option>
                          <option value="SELECTED">Selected</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Create Company Modal */}
      <Modal
        isOpen={showCompanyModal}
        onClose={() => setShowCompanyModal(false)}
        title="Add Partner Company"
      >
        <form onSubmit={handleCreateCompany} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-[#182044] mb-1">
              Company Name
            </label>
            <input
              type="text"
              required
              value={companyForm.name}
              onChange={(e) =>
                setCompanyForm({ ...companyForm, name: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#182044] mb-1">
                Industry
              </label>
              <input
                type="text"
                value={companyForm.industry}
                onChange={(e) =>
                  setCompanyForm({ ...companyForm, industry: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#182044] mb-1">
                Headquarters
              </label>
              <input
                type="text"
                value={companyForm.headquarters}
                onChange={(e) =>
                  setCompanyForm({
                    ...companyForm,
                    headquarters: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>
          <div>
            <label className="block font-semibold text-[#182044] mb-1">
              Website URL
            </label>
            <input
              type="url"
              value={companyForm.website}
              onChange={(e) =>
                setCompanyForm({ ...companyForm, website: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowCompanyModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Company</Button>
          </div>
        </form>
      </Modal>

      {/* Create / Edit Job Modal */}
      <Modal
        isOpen={showJobModal}
        onClose={() => setShowJobModal(false)}
        title={editingJobId ? "Edit Job Opportunity" : "Create Job Opportunity"}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveJob} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#182044] mb-1">
                Company
              </label>
              <select
                required
                value={jobForm.company}
                onChange={(e) =>
                  setJobForm({ ...jobForm, company: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#182044] mb-1">
                Job Title
              </label>
              <input
                type="text"
                required
                value={jobForm.title}
                onChange={(e) =>
                  setJobForm({ ...jobForm, title: e.target.value })
                }
                placeholder="Software Development Engineer"
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-[#182044] mb-1">
                Category
              </label>
              <select
                value={jobForm.category}
                onChange={(e) =>
                  setJobForm({ ...jobForm, category: e.target.value })
                }
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-white"
              >
                <option value="SOFTWARE_DEVELOPMENT">Software Dev</option>
                <option value="DATA_SCIENCE">Data Science</option>
                <option value="PRODUCT">Product</option>
                <option value="ANALYTICS">Analytics</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#182044] mb-1">
                Location
              </label>
              <input
                type="text"
                required
                value={jobForm.location}
                onChange={(e) =>
                  setJobForm({ ...jobForm, location: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#182044] mb-1">
                CTC (LPA)
              </label>
              <input
                type="number"
                step="0.5"
                value={jobForm.ctc_lpa}
                onChange={(e) =>
                  setJobForm({ ...jobForm, ctc_lpa: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#182044] mb-1">
                Min CGPA
              </label>
              <input
                type="number"
                step="0.1"
                value={jobForm.min_cgpa}
                onChange={(e) =>
                  setJobForm({ ...jobForm, min_cgpa: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-[#182044] mb-1">
                Eligible Branches
              </label>
              <input
                type="text"
                value={jobForm.allowed_branches_str}
                onChange={(e) =>
                  setJobForm({
                    ...jobForm,
                    allowed_branches_str: e.target.value,
                  })
                }
                placeholder="CSE, ISE, ECE"
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#182044] mb-1">
                Graduation Year
              </label>
              <input
                type="number"
                value={jobForm.graduation_year}
                onChange={(e) =>
                  setJobForm({
                    ...jobForm,
                    graduation_year: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#182044] mb-1">
                Application Deadline
              </label>
              <input
                type="date"
                required
                value={jobForm.deadline}
                onChange={(e) =>
                  setJobForm({ ...jobForm, deadline: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-[#182044]">
                Job Description
              </label>
              <button
                type="button"
                onClick={handleParseJdSkills}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#6555F5] hover:underline"
              >
                <Sparkles className="w-3 h-3" /> Auto-Extract Skills from JD (ML)
              </button>
            </div>
            <textarea
              rows={3}
              required
              value={jobForm.description}
              onChange={(e) =>
                setJobForm({ ...jobForm, description: e.target.value })
              }
              placeholder="Paste job description here..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#182044] mb-1">
                Required Skills (comma-separated)
              </label>
              <input
                type="text"
                value={jobForm.required_skills_str}
                onChange={(e) =>
                  setJobForm({
                    ...jobForm,
                    required_skills_str: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#182044] mb-1">
                Preferred Skills (comma-separated)
              </label>
              <input
                type="text"
                value={jobForm.preferred_skills_str}
                onChange={(e) =>
                  setJobForm({
                    ...jobForm,
                    preferred_skills_str: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowJobModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingJobId ? "Update Job" : "Publish Job"}
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
