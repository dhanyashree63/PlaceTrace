import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit3, Trash2, ExternalLink } from "lucide-react";
import { AppLayout } from "../../layouts/AppLayout";
import {
  Card,
  Button,
  Badge,
  SkillChip,
  Modal,
  EmptyState,
  LoadingState,
  ErrorState,
} from "../../components/ui";
import { api } from "../../services/api";
import { useToast } from "../../hooks/useToast";

export default function ProjectsPage() {
  const { addToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    technologies_str: "React, Django, PostgreSQL, Docker",
    github_url: "",
    live_url: "",
    role: "Full Stack Developer",
    status: "COMPLETED",
    start_date: "2026-08-01",
    completion_date: "2026-11-10",
  });

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.projects.list();
      setProjects(Array.isArray(data) ? data : data?.results || []);
    } catch (err) {
      setError(err.message || "Failed to load projects.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      title: "",
      description: "",
      technologies_str: "React, Django, PostgreSQL",
      github_url: "",
      live_url: "",
      role: "Full Stack Developer",
      status: "COMPLETED",
      start_date: "2026-08-01",
      completion_date: "2026-11-10",
    });
    setShowModal(true);
  };

  const openEditModal = (proj) => {
    setEditingId(proj.id);
    setForm({
      title: proj.title || "",
      description: proj.description || "",
      technologies_str: (proj.technologies || []).join(", "),
      github_url: proj.github_url || "",
      live_url: proj.live_url || "",
      role: proj.role || "Full Stack Developer",
      status: proj.status || "COMPLETED",
      start_date: proj.start_date || "2026-08-01",
      completion_date: proj.completion_date || "2026-11-10",
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      description: form.description,
      technologies: form.technologies_str
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      github_url: form.github_url,
      live_url: form.live_url,
      role: form.role,
      status: form.status,
      start_date: form.start_date || null,
      completion_date: form.completion_date || null,
    };

    try {
      if (editingId) {
        await api.projects.update(editingId, payload);
        addToast("Project updated!", "success");
      } else {
        await api.projects.create(payload);
        addToast("Project added to your portfolio!", "success");
      }
      setShowModal(false);
      loadProjects();
    } catch (err) {
      addToast(err.message || "Could not save project.", "error");
    }
  };

  const handleDelete = async (id, title) => {
    try {
      await api.projects.delete(id);
      addToast(`Deleted project: ${title}`, "success");
      loadProjects();
    } catch (err) {
      addToast(err.message || "Could not delete project.", "error");
    }
  };

  if (loading) {
    return (
      <AppLayout title="My Projects">
        <LoadingState message="Loading your project portfolio..." />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="My Projects">
        <ErrorState message={error} onRetry={loadProjects} />
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Projects Portfolio"
      subtitle="Showcase your technical projects, architecture, GitHub repositories, and live deployments"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Badge variant="purple">{projects.length} Portfolio Projects</Badge>
          <Button onClick={openCreateModal}>
            <Plus className="w-4 h-4" /> Add Project
          </Button>
        </div>

        {projects.length === 0 ? (
          <EmptyState
            title="No projects added yet"
            description="Add your full-stack, ML, or systems projects to boost your Placement Readiness score."
            action={<Button onClick={openCreateModal}>+ Add First Project</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {projects.map((proj) => (
              <Card key={proj.id} className="flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-[#182044]">
                        {proj.title}
                      </h3>
                      <p className="text-xs font-medium text-[#6555F5]">
                        {proj.role}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant={
                          proj.status === "COMPLETED" ? "success" : "purple"
                        }
                      >
                        {proj.status}
                      </Badge>
                      <button
                        type="button"
                        aria-label={`Edit ${proj.title}`}
                        onClick={() => openEditModal(proj)}
                        className="p-1.5 rounded-lg text-[#66708F] hover:bg-slate-100"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${proj.title}`}
                        onClick={() => handleDelete(proj.id, proj.title)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#E55353]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[#66708F] mt-2.5 leading-relaxed">
                    {proj.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-3.5">
                    {(proj.technologies || []).map((t) => (
                      <SkillChip key={t} name={t} />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs font-semibold">
                  <div className="flex items-center gap-4">
                    {proj.github_url && (
                      <a
                        href={proj.github_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[#6555F5] hover:underline"
                      >
                        GitHub → <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {proj.live_url && (
                      <a
                        href={proj.live_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[#32B67A] hover:underline"
                      >
                        Live Demo → <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Project Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? "Edit Project" : "Add New Project"}
      >
        <form onSubmit={handleSave} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-[#182044] mb-1">
              Project Name
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="PlaceTrace"
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>
          <div>
            <label className="block font-semibold text-[#182044] mb-1">
              Description
            </label>
            <textarea
              rows={3}
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the problem solved, architecture, and measurable impact..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>
          <div>
            <label className="block font-semibold text-[#182044] mb-1">
              Technologies (comma-separated)
            </label>
            <input
              type="text"
              required
              value={form.technologies_str}
              onChange={(e) =>
                setForm({ ...form, technologies_str: e.target.value })
              }
              placeholder="React, Django, PostgreSQL, FastAPI, Docker"
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#182044] mb-1">
                Role
              </label>
              <input
                type="text"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#182044] mb-1">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                <option value="COMPLETED">Completed</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="PLANNED">Planned</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#182044] mb-1">
                GitHub URL
              </label>
              <input
                type="url"
                value={form.github_url}
                onChange={(e) =>
                  setForm({ ...form, github_url: e.target.value })
                }
                placeholder="https://github.com/..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#182044] mb-1">
                Live Demo URL
              </label>
              <input
                type="url"
                value={form.live_url}
                onChange={(e) => setForm({ ...form, live_url: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Project</Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
