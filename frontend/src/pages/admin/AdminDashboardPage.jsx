import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  Users,
  KeyRound,
  Activity,
  Lock,
  Plus,
} from "lucide-react";
import { AppLayout } from "../../layouts/AppLayout";
import {
  Card,
  KpiCard,
  Button,
  Badge,
  Modal,
  LoadingState,
  ErrorState,
} from "../../components/ui";
import { api } from "../../services/api";
import { useToast } from "../../hooks/useToast";
import { formatShortDate } from "../../utils/formatters";

const ADMIN_TABS = [
  { key: "users", label: "Users & Role Management" },
  { key: "invites", label: "Invite Codes" },
  { key: "audit", label: "Security & Audit Logs" },
];

export default function AdminDashboardPage() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState("users");

  const [adminStats, setAdminStats] = useState({});
  const [users, setUsers] = useState([]);
  const [inviteCodes, setInviteCodes] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Invite modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    role: "TPO",
    department: "Placement Cell",
    expires_at: "2027-06-30T23:59:59Z",
  });

  const loadAdminPortal = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [analyticsRes, usersRes, invitesRes, auditRes] = await Promise.all([
        api.analytics.platform(),
        api.auth.adminUsers(),
        api.auth.adminInviteCodes(),
        api.auth.adminAuditLogs(),
      ]);
      setAdminStats(analyticsRes?.admin_stats || {});
      setUsers(Array.isArray(usersRes) ? usersRes : usersRes?.results || []);
      setInviteCodes(
        Array.isArray(invitesRes) ? invitesRes : invitesRes?.results || []
      );
      setAuditLogs(
        Array.isArray(auditRes) ? auditRes : auditRes?.results || []
      );
    } catch (err) {
      setError(err.message || "Failed to load Admin portal.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminPortal();
  }, [loadAdminPortal]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.auth.adminUpdateUser(userId, { role: newRole });
      addToast(`Updated user role to ${newRole}!`, "success");
      loadAdminPortal();
    } catch (err) {
      addToast(err.message || "Failed to update role.", "error");
    }
  };

  const handleToggleUserActive = async (userObj) => {
    try {
      await api.auth.adminUpdateUser(userObj.id, {
        is_active: !userObj.is_active,
      });
      addToast("Updated account status!", "success");
      loadAdminPortal();
    } catch (err) {
      addToast(err.message || "Could not update user status.", "error");
    }
  };

  const handleCreateInvite = async (e) => {
    e.preventDefault();
    try {
      const created = await api.auth.adminCreateInviteCode(inviteForm);
      addToast(`Created invite code: ${created.code}`, "success");
      setShowInviteModal(false);
      loadAdminPortal();
    } catch (err) {
      addToast(err.message || "Could not generate invite code.", "error");
    }
  };

  if (loading) {
    return (
      <AppLayout title="Admin System Portal">
        <LoadingState message="Loading system administration and security monitoring..." />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Admin System Portal">
        <ErrorState message={error} onRetry={loadAdminPortal} />
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="System Administration & Security Portal"
      subtitle="Manage user roles, permissions, TPO invite codes, system statistics, and security audit logs"
    >
      <div className="space-y-6">
        {/* Admin KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={Users}
            label="Total Users"
            value={adminStats.total_users ?? users.length}
            sublabel={`${adminStats.students_count ?? 0} Students • ${
              adminStats.tpos_count ?? 0
            } TPOs`}
            accent="purple"
          />
          <KpiCard
            icon={KeyRound}
            label="Active Invite Codes"
            value={adminStats.active_invite_codes ?? inviteCodes.length}
            sublabel="For TPO & Admin onboarding"
            accent="green"
          />
          <KpiCard
            icon={Activity}
            label="Audit Events"
            value={adminStats.audit_events_count ?? auditLogs.length}
            sublabel="Recorded security actions"
            accent="blue"
          />
          <KpiCard
            icon={Lock}
            label="Locked Accounts"
            value={adminStats.locked_accounts ?? 0}
            sublabel="Brute-force protection active"
            accent="amber"
          />
        </div>

        {/* Admin Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            {ADMIN_TABS.map((t) => (
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
          <Button size="sm" onClick={() => setShowInviteModal(true)}>
            <Plus className="w-4 h-4" /> Generate Invite Code
          </Button>
        </div>

        {/* Tab 1: Users & Role Management */}
        {activeTab === "users" && (
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F4F5FF] text-[#66708F] text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Current Role</th>
                    <th className="py-3.5 px-4">Verified</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Role & Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-[#F4F5FF]/50">
                      <td className="py-3.5 px-4 font-bold text-[#182044]">
                        {u.full_name}
                      </td>
                      <td className="py-3.5 px-4 text-[#66708F]">{u.email}</td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            u.role === "ADMIN"
                              ? "navy"
                              : u.role === "TPO"
                              ? "purple"
                              : "neutral"
                          }
                        >
                          {u.role}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={u.is_email_verified ? "success" : "warning"}
                        >
                          {u.is_email_verified ? "Verified" : "Unverified"}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={u.is_active ? "success" : "error"}>
                          {u.is_active ? "Active" : "Suspended"}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right flex items-center justify-end gap-2">
                        <select
                          aria-label={`Change role for ${u.full_name}`}
                          value={u.role}
                          onChange={(e) =>
                            handleRoleChange(u.id, e.target.value)
                          }
                          className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs bg-white"
                        >
                          <option value="STUDENT">STUDENT</option>
                          <option value="TPO">TPO</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleUserActive(u)}
                        >
                          {u.is_active ? "Deactivate" : "Activate"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Tab 2: Invite Codes */}
        {activeTab === "invites" && (
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F4F5FF] text-[#66708F] text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                    <th className="py-3.5 px-4">Invite Code</th>
                    <th className="py-3.5 px-4">Target Role</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Expires</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {inviteCodes.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#F4F5FF]/50">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#6555F5]">
                        {inv.code}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="purple">{inv.role}</Badge>
                      </td>
                      <td className="py-3.5 px-4 text-[#66708F]">
                        {inv.department || "General"}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={inv.is_used ? "neutral" : "success"}>
                          {inv.is_used
                            ? `Used (${inv.used_by_email})`
                            : "Available"}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-[#66708F]">
                        {formatShortDate(inv.expires_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Tab 3: Audit Logs */}
        {activeTab === "audit" && (
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F4F5FF] text-[#66708F] text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                    <th className="py-3.5 px-4">Action</th>
                    <th className="py-3.5 px-4">Actor</th>
                    <th className="py-3.5 px-4">Target Model</th>
                    <th className="py-3.5 px-4">Details</th>
                    <th className="py-3.5 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#F4F5FF]/50">
                      <td className="py-3.5 px-4 font-bold text-[#182044] flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#6555F5]" />
                        <span>{log.action}</span>
                      </td>
                      <td className="py-3.5 px-4 text-[#66708F]">
                        {log.actor_email}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="neutral">
                          {log.target_model || "System"}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#66708F]">
                        {JSON.stringify(log.details || {})}
                      </td>
                      <td className="py-3.5 px-4 text-[#66708F]">
                        {formatShortDate(log.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Generate Invite Code Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Generate Role Invite Code"
      >
        <form onSubmit={handleCreateInvite} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-[#182044] mb-1">
              Target Role
            </label>
            <select
              value={inviteForm.role}
              onChange={(e) =>
                setInviteForm({ ...inviteForm, role: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
            >
              <option value="TPO">Training & Placement Officer (TPO)</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-[#182044] mb-1">
              Department
            </label>
            <input
              type="text"
              value={inviteForm.department}
              onChange={(e) =>
                setInviteForm({ ...inviteForm, department: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowInviteModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Invite Code</Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
