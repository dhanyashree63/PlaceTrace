import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Award,
  FolderGit2,
  Plus,
  Edit3,
  ExternalLink,
  Clock,
  FileText,
} from "lucide-react";
import { AppLayout } from "../../layouts/AppLayout";
import {
  Card,
  Avatar,
  Badge,
  Button,
  SkillChip,
  KpiCard,
  Modal,
  LoadingState,
  ErrorState,
} from "../../components/ui";
import { api } from "../../services/api";
import { useToast } from "../../hooks/useToast";
import { formatShortDate } from "../../utils/formatters";

const PROFILE_TABS = [
  { key: "skills", label: "Skills" },
  { key: "projects", label: "My Projects" },
  { key: "activity", label: "Activity" },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState("skills");
  const [skillCategoryFilter, setSkillCategoryFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modals
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    college_name: "",
    branch: "CSE",
    cgpa: "9.00",
    bio: "",
    github_url: "",
    linkedin_url: "",
  });

  const [showAddSkill, setShowAddSkill] = useState(false);
  const [skillForm, setSkillForm] = useState({
    skill_name: "",
    category: "PROGRAMMING",
    proficiency: "INTERMEDIATE",
  });

  const [editingSkill, setEditingSkill] = useState(null);

  const loadProfileData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [profData, projData] = await Promise.all([
        api.students.getMe(),
        api.projects.list(),
      ]);
      setProfile(profData);
      setProjects(Array.isArray(projData) ? projData : projData?.results || []);
      setProfileForm({
        full_name: profData.full_name || "",
        college_name: profData.college_name || "RNSIT",
        branch: profData.branch || "CSE",
        cgpa: String(profData.cgpa ?? "9.00"),
        bio: profData.bio || "",
        github_url: profData.github_url || "",
        linkedin_url: profData.linkedin_url || "",
      });
    } catch (err) {
      setError(err.message || "Failed to load student profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await api.students.updateMe({
        ...profileForm,
        cgpa: parseFloat(profileForm.cgpa || "8.5"),
      });
      addToast("Profile updated successfully!", "success");
      setShowEditProfile(false);
      loadProfileData();
    } catch (err) {
      addToast(err.message || "Could not update profile.", "error");
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!skillForm.skill_name.trim()) return;
    try {
      await api.students.addSkill(skillForm);
      addToast(`Added skill: ${skillForm.skill_name}`, "success");
      setSkillForm({
        skill_name: "",
        category: "PROGRAMMING",
        proficiency: "INTERMEDIATE",
      });
      setShowAddSkill(false);
      loadProfileData();
    } catch (err) {
      addToast(err.message || "Failed to add skill.", "error");
    }
  };

  const handleRemoveSkill = async (studentSkillId, name) => {
    try {
      await api.students.removeSkill(studentSkillId);
      addToast(`Removed skill: ${name}`, "success");
      loadProfileData();
    } catch (err) {
      addToast(err.message || "Could not remove skill.", "error");
    }
  };

  const handleUpdateSkillProficiency = async (e) => {
    e.preventDefault();
    if (!editingSkill) return;
    try {
      await api.students.updateSkill(editingSkill.id, {
        proficiency: editingSkill.proficiency,
        category: editingSkill.category,
      });
      addToast(`Updated ${editingSkill.skill_name} proficiency!`, "success");
      setEditingSkill(null);
      loadProfileData();
    } catch (err) {
      addToast(err.message || "Failed to update skill.", "error");
    }
  };

  if (loading) {
    return (
      <AppLayout title="Student Profile">
        <LoadingState message="Loading your profile, skills, and activity..." />
      </AppLayout>
    );
  }

  if (error || !profile) {
    return (
      <AppLayout title="Student Profile">
        <ErrorState message={error} onRetry={loadProfileData} />
      </AppLayout>
    );
  }

  const kpis = profile.kpis || {};
  const studentSkills = profile.student_skills || [];
  const filteredSkills =
    skillCategoryFilter === "ALL"
      ? studentSkills
      : studentSkills.filter((s) => s.category === skillCategoryFilter);

  return (
    <AppLayout
      title="My Profile"
      subtitle="Manage your academic profile, skills, projects, and career timeline"
    >
      <div className="space-y-6">
        {/* Top Profile Header Card */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar
                name={profile.full_name}
                src={profile.avatar_url}
                size="lg"
              />
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl font-extrabold text-[#182044]">
                    {profile.full_name}
                  </h2>
                  <Badge variant="purple">{profile.usn}</Badge>
                </div>
                <p className="text-sm font-semibold text-[#66708F] mt-0.5">
                  {profile.college_name}, {profile.branch} | CGPA:{" "}
                  <strong className="text-[#182044]">{profile.cgpa}</strong>
                </p>
                {profile.bio && (
                  <p className="text-xs text-[#66708F] mt-1.5 max-w-2xl">
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/resume")}
              >
                <FileText className="w-4 h-4 text-[#6555F5]" />
                <span>Resume ({profile.current_resume?.resume_score ?? 82}/100)</span>
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowEditProfile(true)}
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Profile KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard
            icon={CheckCircle2}
            label="Topics Done"
            value={kpis.topics_completed ?? 0}
            sublabel={`of ${kpis.total_topics ?? 8} roadmap topics`}
            accent="green"
          />
          <KpiCard
            icon={Award}
            label="Mock Tests"
            value={kpis.mock_tests_count ?? 0}
            sublabel="Completed assessments"
            accent="purple"
          />
          <KpiCard
            icon={FolderGit2}
            label="Projects"
            value={kpis.projects_count ?? projects.length}
            sublabel="Portfolio showcases"
            accent="blue"
          />
        </div>

        {/* Profile Tabs Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          {PROFILE_TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold pt-transition ${
                activeTab === t.key
                  ? "bg-[#6555F5] text-white shadow-nav"
                  : "bg-white text-[#66708F] hover:text-[#182044]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Skills UI */}
        {activeTab === "skills" && (
          <Card className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-[#182044]">
                  Verified & Self-Assessed Skills
                </h3>
                <p className="text-xs text-[#66708F]">
                  Click a skill chip to edit proficiency or click × to remove
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={skillCategoryFilter}
                  onChange={(e) => setSkillCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  <option value="ALL">All Categories</option>
                  <option value="PROGRAMMING">Programming</option>
                  <option value="CORE_CS">Core CS & DSA</option>
                  <option value="FRONTEND">Frontend</option>
                  <option value="BACKEND">Backend</option>
                  <option value="DATABASE">Databases</option>
                  <option value="DEVOPS">DevOps & Cloud</option>
                  <option value="TOOLS">Tools</option>
                </select>
                <Button size="sm" onClick={() => setShowAddSkill(true)}>
                  <Plus className="w-4 h-4" /> Add Skill
                </Button>
              </div>
            </div>

            {filteredSkills.length === 0 ? (
              <p className="text-xs text-[#66708F] py-6 text-center">
                No skills in this category yet. Click "Add Skill" to add one!
              </p>
            ) : (
              <div className="flex flex-wrap gap-2.5 pt-2">
                {filteredSkills.map((sk) => (
                  <SkillChip
                    key={sk.id}
                    name={sk.skill_name}
                    proficiency={sk.proficiency}
                    onClick={() => setEditingSkill({ ...sk })}
                    onRemove={() => handleRemoveSkill(sk.id, sk.skill_name)}
                  />
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Tab 2: My Projects */}
        {activeTab === "projects" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#182044]">My Projects</h3>
              <Button size="sm" onClick={() => navigate("/projects")}>
                <Plus className="w-4 h-4" /> Manage Projects
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((proj) => (
                <Card key={proj.id} className="flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-base font-bold text-[#182044]">
                        {proj.title}
                      </h4>
                      <Badge
                        variant={
                          proj.status === "COMPLETED" ? "success" : "purple"
                        }
                      >
                        {proj.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#66708F] mt-2 leading-relaxed">
                      {proj.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {(proj.technologies || []).map((tech) => (
                        <SkillChip key={tech} name={tech} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100 text-xs font-semibold">
                    {proj.github_url && (
                      <a
                        href={proj.github_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[#6555F5] hover:underline"
                      >
                        GitHub <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {proj.live_url && (
                      <a
                        href={proj.live_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[#32B67A] hover:underline"
                      >
                        Live Demo <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Activity Timeline */}
        {activeTab === "activity" && (
          <Card className="space-y-4">
            <h3 className="text-base font-bold text-[#182044]">
              Recent Placement & Learning Activity
            </h3>
            <div className="relative pl-3 space-y-4">
              <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-200" />
              {(profile.activities || []).map((act) => (
                <div
                  key={act.id}
                  className="relative flex items-start justify-between gap-4 p-2.5 rounded-xl hover:bg-[#F4F5FF]"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative z-10 w-4 h-4 rounded-full bg-[#6555F5] ring-4 ring-[#EEEAFE] mt-1 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-[#182044]">
                        {act.title}
                      </p>
                      <Badge variant="neutral" className="mt-1">
                        {act.activity_type}
                      </Badge>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#66708F] shrink-0">
                    <Clock className="w-3 h-3" />
                    {formatShortDate(act.created_at)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        title="Edit Student Profile"
      >
        <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-[#182044] mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={profileForm.full_name}
              onChange={(e) =>
                setProfileForm({ ...profileForm, full_name: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-[#182044] mb-1">
                College
              </label>
              <input
                type="text"
                value={profileForm.college_name}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    college_name: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#182044] mb-1">
                Branch
              </label>
              <select
                value={profileForm.branch}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, branch: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                <option value="CSE">CSE</option>
                <option value="ISE">ISE</option>
                <option value="ECE">ECE</option>
                <option value="AIML">AIML</option>
                <option value="EEE">EEE</option>
                <option value="MECH">MECH</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#182044] mb-1">
                CGPA
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={profileForm.cgpa}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, cgpa: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>
          <div>
            <label className="block font-semibold text-[#182044] mb-1">Bio</label>
            <textarea
              rows={3}
              value={profileForm.bio}
              onChange={(e) =>
                setProfileForm({ ...profileForm, bio: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#182044] mb-1">
                GitHub URL
              </label>
              <input
                type="url"
                value={profileForm.github_url}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, github_url: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#182044] mb-1">
                LinkedIn URL
              </label>
              <input
                type="url"
                value={profileForm.linkedin_url}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    linkedin_url: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowEditProfile(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Add Skill Modal */}
      <Modal
        isOpen={showAddSkill}
        onClose={() => setShowAddSkill(false)}
        title="Add Skill to Profile"
      >
        <form onSubmit={handleAddSkill} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-[#182044] mb-1">
              Skill Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Docker, System Design, AWS, TypeScript"
              value={skillForm.skill_name}
              onChange={(e) =>
                setSkillForm({ ...skillForm, skill_name: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#182044] mb-1">
                Category
              </label>
              <select
                value={skillForm.category}
                onChange={(e) =>
                  setSkillForm({ ...skillForm, category: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                <option value="PROGRAMMING">Programming</option>
                <option value="CORE_CS">Core CS & DSA</option>
                <option value="FRONTEND">Frontend</option>
                <option value="BACKEND">Backend</option>
                <option value="DATABASE">Databases</option>
                <option value="DEVOPS">DevOps & Cloud</option>
                <option value="TOOLS">Tools</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#182044] mb-1">
                Proficiency
              </label>
              <select
                value={skillForm.proficiency}
                onChange={(e) =>
                  setSkillForm({ ...skillForm, proficiency: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
                <option value="EXPERT">Expert</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowAddSkill(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Skill</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Skill Proficiency Modal */}
      <Modal
        isOpen={Boolean(editingSkill)}
        onClose={() => setEditingSkill(null)}
        title={`Edit Skill: ${editingSkill?.skill_name || ""}`}
      >
        {editingSkill && (
          <form onSubmit={handleUpdateSkillProficiency} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-[#182044] mb-1">
                Proficiency Level
              </label>
              <select
                value={editingSkill.proficiency}
                onChange={(e) =>
                  setEditingSkill({
                    ...editingSkill,
                    proficiency: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
                <option value="EXPERT">Expert</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#182044] mb-1">
                Category
              </label>
              <select
                value={editingSkill.category}
                onChange={(e) =>
                  setEditingSkill({ ...editingSkill, category: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                <option value="PROGRAMMING">Programming</option>
                <option value="CORE_CS">Core CS & DSA</option>
                <option value="FRONTEND">Frontend</option>
                <option value="BACKEND">Backend</option>
                <option value="DATABASE">Databases</option>
                <option value="DEVOPS">DevOps & Cloud</option>
                <option value="TOOLS">Tools</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditingSkill(null)}>
                Cancel
              </Button>
              <Button type="submit">Update Skill</Button>
            </div>
          </form>
        )}
      </Modal>
    </AppLayout>
  );
}
