import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, CheckCircle2, Clock } from "lucide-react";
import { AppLayout } from "../../layouts/AppLayout";
import {
  Card,
  Button,
  Badge,
  Roadmap,
  TaskCard,
  Modal,
  LoadingState,
  ErrorState,
} from "../../components/ui";
import { api } from "../../services/api";
import { useToast } from "../../hooks/useToast";

const TASK_CATEGORIES = [
  "Study Tasks",
  "Revision Tasks",
  "Coding Practice",
  "Mock Tests",
  "Interview Preparation",
  "Project Work",
];

export default function StudyPlannerPage() {
  const { addToast } = useToast();
  const [roadmap, setRoadmap] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    title: "",
    category: "Coding Practice",
    scheduled_date: todayStr,
    scheduled_time: "7:00 PM",
    priority: "HIGH",
    status: "PENDING",
  });

  const loadStudyData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [roadmapRes, tasksRes] = await Promise.all([
        api.study.roadmap(),
        api.study.tasks(),
      ]);
      setRoadmap(Array.isArray(roadmapRes) ? roadmapRes : []);
      setTasks(Array.isArray(tasksRes) ? tasksRes : tasksRes?.results || []);
    } catch (err) {
      setError(err.message || "Failed to load study planner.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudyData();
  }, [loadStudyData]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.study.createTask(form);
      addToast("Study task scheduled!", "success");
      setShowCreateModal(false);
      setForm({
        title: "",
        category: "Coding Practice",
        scheduled_date: todayStr,
        scheduled_time: "7:00 PM",
        priority: "HIGH",
        status: "PENDING",
      });
      loadStudyData();
    } catch (err) {
      addToast(err.message || "Could not create task.", "error");
    }
  };

  const handleToggleTask = async (taskId, nextStatus) => {
    try {
      await api.study.updateTask(taskId, { status: nextStatus });
      addToast("Task status updated!", "success");
      loadStudyData();
    } catch (err) {
      addToast(err.message || "Failed to update task.", "error");
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.study.deleteTask(taskId);
      addToast("Study task deleted.", "success");
      loadStudyData();
    } catch (err) {
      addToast(err.message || "Failed to delete task.", "error");
    }
  };

  const handleUpdateRoadmap = async (progressId, nextStatus) => {
    try {
      await api.study.updateRoadmapTopic(progressId, nextStatus);
      addToast("Roadmap topic updated!", "success");
      loadStudyData();
    } catch (err) {
      addToast(err.message || "Failed to update topic.", "error");
    }
  };

  if (loading) {
    return (
      <AppLayout title="Study Planner">
        <LoadingState message="Loading your study planner and placement roadmap..." />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Study Planner">
        <ErrorState message={error} onRetry={loadStudyData} />
      </AppLayout>
    );
  }

  const todaysTasks = tasks.filter(
    (t) => t.scheduled_date === todayStr && t.status !== "COMPLETED"
  );
  const upcomingTasks = tasks.filter(
    (t) => t.scheduled_date !== todayStr && t.status !== "COMPLETED"
  );
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED");

  return (
    <AppLayout
      title="Study Planner & Placement Roadmap"
      subtitle="Plan your daily DSA practice, revisions, mock tests, and track curriculum milestones"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="purple">{todaysTasks.length} Today</Badge>
            <Badge variant="warning">{upcomingTasks.length} Upcoming</Badge>
            <Badge variant="success">{completedTasks.length} Completed</Badge>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4" /> Create Study Task
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Today's, Upcoming, and Completed Tasks */}
          <div className="lg:col-span-7 space-y-5">
            <Card className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#6555F5]" />
                <h3 className="text-base font-bold text-[#182044]">
                  Today's Tasks
                </h3>
              </div>
              {todaysTasks.length === 0 ? (
                <p className="text-xs text-[#66708F] py-3">
                  No pending tasks for today. Schedule one or review upcoming tasks!
                </p>
              ) : (
                <div className="space-y-2.5">
                  {todaysTasks.map((t) => (
                    <div key={t.id} className="flex items-center gap-2">
                      <div className="flex-1">
                        <TaskCard
                          task={t}
                          onToggleComplete={handleToggleTask}
                        />
                      </div>
                      <button
                        type="button"
                        aria-label="Delete task"
                        onClick={() => handleDeleteTask(t.id)}
                        className="p-2 text-slate-400 hover:text-[#E55353]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="space-y-3">
              <h3 className="text-base font-bold text-[#182044]">
                Upcoming Tasks
              </h3>
              {upcomingTasks.length === 0 ? (
                <p className="text-xs text-[#66708F] py-3">
                  No upcoming study tasks scheduled.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {upcomingTasks.map((t) => (
                    <div key={t.id} className="flex items-center gap-2">
                      <div className="flex-1">
                        <TaskCard
                          task={t}
                          onToggleComplete={handleToggleTask}
                        />
                      </div>
                      <button
                        type="button"
                        aria-label="Delete task"
                        onClick={() => handleDeleteTask(t.id)}
                        className="p-2 text-slate-400 hover:text-[#E55353]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#32B67A]" />
                <h3 className="text-base font-bold text-[#182044]">
                  Completed Tasks
                </h3>
              </div>
              {completedTasks.length === 0 ? (
                <p className="text-xs text-[#66708F] py-3">
                  No tasks marked completed yet.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {completedTasks.map((t) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      onToggleComplete={handleToggleTask}
                    />
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Right: Complete Interactive Placement Roadmap */}
          <div className="lg:col-span-5">
            <Roadmap items={roadmap} onToggleStatus={handleUpdateRoadmap} />
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Schedule Study Task"
      >
        <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-[#182044] mb-1">
              Task Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dynamic Programming Practice, System Design Notes"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#182044] mb-1">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                {TASK_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#182044] mb-1">
                Priority
              </label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#182044] mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={form.scheduled_date}
                onChange={(e) =>
                  setForm({ ...form, scheduled_date: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#182044] mb-1">
                Time
              </label>
              <input
                type="text"
                required
                placeholder="7:00 PM"
                value={form.scheduled_time}
                onChange={(e) =>
                  setForm({ ...form, scheduled_time: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Task</Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
