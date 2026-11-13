import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Eye, CheckCircle2 } from "lucide-react";
import { AppLayout } from "../../layouts/AppLayout";
import {
  Card,
  Badge,
  Button,
  Timeline,
  Modal,
  ProgressBar,
  EmptyState,
  LoadingState,
  ErrorState,
} from "../../components/ui";
import { api } from "../../services/api";
import { useToast } from "../../hooks/useToast";
import { formatDate, getInitials } from "../../utils/formatters";

const STAGE_PROGRESS_MAP = {
  APPLIED: 20,
  ASSESSMENT: 40,
  TECHNICAL_INTERVIEW: 65,
  HR_INTERVIEW: 85,
  SELECTED: 100,
  REJECTED: 100,
};

const STAGE_BADGE_MAP = {
  APPLIED: "neutral",
  ASSESSMENT: "purple",
  TECHNICAL_INTERVIEW: "purple",
  HR_INTERVIEW: "warning",
  SELECTED: "success",
  REJECTED: "error",
};

export default function ApplicationsPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [notesInput, setNotesInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.applications.list();
      const list = Array.isArray(data) ? data : data?.results || [];
      setApplications(list);
    } catch (err) {
      setError(err.message || "Failed to load applications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const openApplicationDetail = (app) => {
    setSelectedApp(app);
    setNotesInput(app.notes || "");
  };

  const handleSaveNotes = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;
    try {
      const updated = await api.applications.update(selectedApp.id, {
        notes: notesInput,
      });
      setSelectedApp(updated);
      addToast("Application notes saved!", "success");
      loadApplications();
    } catch (err) {
      addToast(err.message || "Could not save notes.", "error");
    }
  };

  if (loading) {
    return (
      <AppLayout title="My Applications">
        <LoadingState message="Loading your application tracker..." />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="My Applications">
        <ErrorState message={error} onRetry={loadApplications} />
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Application Tracker"
      subtitle="Monitor your campus placement applications across every interview stage"
    >
      <div className="space-y-6">
        {applications.length === 0 ? (
          <EmptyState
            title="You haven't applied to any jobs yet"
            description="Explore open placement opportunities and apply to start tracking interview stages."
            action={
              <Button onClick={() => navigate("/jobs")}>
                Explore Job Opportunities
              </Button>
            }
          />
        ) : (
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F4F5FF] text-[#66708F] text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                    <th className="py-3.5 px-4">Company</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Applied Date</th>
                    <th className="py-3.5 px-4">Current Stage</th>
                    <th className="py-3.5 px-4">Match %</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {applications.map((app) => {
                    const progressVal = STAGE_PROGRESS_MAP[app.stage] || 20;
                    return (
                      <tr
                        key={app.id}
                        onClick={() => openApplicationDetail(app)}
                        className="hover:bg-[#F4F5FF]/60 cursor-pointer pt-transition"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div
                              style={{
                                backgroundColor:
                                  app.company_logo_color || "#6555F5",
                              }}
                              className="w-8 h-8 rounded-lg text-white font-bold text-xs flex items-center justify-center shrink-0"
                            >
                              {getInitials(app.company_name)}
                            </div>
                            <span className="font-bold text-[#182044]">
                              {app.company_name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-[#182044]">
                          {app.job_title}
                        </td>
                        <td className="py-3.5 px-4 text-[#66708F]">
                          {formatDate(app.applied_at)}
                        </td>
                        <td className="py-3.5 px-4 w-44">
                          <div className="space-y-1">
                            <span className="text-[11px] font-semibold text-[#182044]">
                              {app.status_label}
                            </span>
                            <ProgressBar
                              value={progressVal}
                              color={
                                app.stage === "SELECTED"
                                  ? "#32B67A"
                                  : app.stage === "REJECTED"
                                  ? "#E55353"
                                  : "#6555F5"
                              }
                              height="h-1.5"
                            />
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant="purple">{app.match_score}%</Badge>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge
                            variant={STAGE_BADGE_MAP[app.stage] || "purple"}
                          >
                            {app.status_label}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              openApplicationDetail(app);
                            }}
                          >
                            <Eye className="w-3.5 h-3.5" /> View
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Application Detail Modal */}
      <Modal
        isOpen={Boolean(selectedApp)}
        onClose={() => setSelectedApp(null)}
        title={
          selectedApp
            ? `${selectedApp.company_name} — ${selectedApp.job_title}`
            : "Application Details"
        }
        maxWidth="max-w-xl"
      >
        {selectedApp && (
          <div className="space-y-5 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-[#F4F5FF]">
              <div>
                <p className="text-[11px] text-[#66708F]">Application Date</p>
                <p className="font-bold text-[#182044] mt-0.5">
                  {formatDate(selectedApp.applied_at)}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#66708F]">Eligibility</p>
                <p className="font-bold text-[#32B67A] mt-0.5 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#66708F]">Match Score</p>
                <p className="font-bold text-[#6555F5] mt-0.5">
                  {selectedApp.match_score}%
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#66708F]">Current Stage</p>
                <Badge variant={STAGE_BADGE_MAP[selectedApp.stage] || "purple"}>
                  {selectedApp.status_label}
                </Badge>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-[#182044] mb-3">
                Interview & Selection Timeline
              </h4>
              <Timeline steps={selectedApp.timeline || []} />
            </div>

            <form onSubmit={handleSaveNotes} className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block font-bold text-[#182044]">
                Preparation & Interview Notes
              </label>
              <textarea
                rows={3}
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Add interview feedback, coding questions asked, or follow-up notes..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedApp(null)}
                >
                  Close
                </Button>
                <Button type="submit">Save Notes</Button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
