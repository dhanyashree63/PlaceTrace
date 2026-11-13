import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Download,
  Trash2,
  MailCheck,
  ShieldAlert,
  UserCheck,
} from "lucide-react";
import { AppLayout } from "../../layouts/AppLayout";
import { Card, Button, Badge, Modal } from "../../components/ui";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { api, setStoredTokens } from "../../services/api";

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [exporting, setExporting] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleExportData = async () => {
    setExporting(true);
    try {
      const data = await api.auth.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `placetrace-export-${user?.email || "student"}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast("Your placement data has been exported!", "success");
    } catch (err) {
      addToast(err.message || "Data export failed.", "error");
    } finally {
      setExporting(false);
    }
  };

  const handleResendVerification = async () => {
    setResendingEmail(true);
    try {
      const res = await api.auth.resendVerification();
      addToast(res.detail || "Verification email sent!", "success");
    } catch (err) {
      addToast(err.message || "Could not resend verification email.", "error");
    } finally {
      setResendingEmail(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setDeleting(true);
    try {
      await api.auth.deleteAccount(confirmPassword);
      setStoredTokens(null);
      localStorage.removeItem("placetrace_user");
      setUser(null);
      addToast("Your account has been permanently deleted.", "success");
      navigate("/");
    } catch (err) {
      addToast(err.message || "Account deletion failed.", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AppLayout
      title="Account Settings & Data Privacy"
      subtitle="Manage your account security, email verification, placement data export, and account deletion"
    >
      <div className="max-w-3xl space-y-6">
        {/* Account Overview */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EEEAFE] text-[#6555F5] flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#182044]">
                  {user?.full_name}
                </h3>
                <p className="text-xs text-[#66708F]">{user?.email}</p>
              </div>
            </div>
            <Badge variant="purple">{user?.role}</Badge>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <MailCheck className="w-4 h-4 text-[#6555F5]" />
              <span>Email Verification Status:</span>
              <Badge variant={user?.is_email_verified ? "success" : "warning"}>
                {user?.is_email_verified ? "Verified ✓" : "Pending Verification"}
              </Badge>
            </div>
            {!user?.is_email_verified && (
              <Button
                size="sm"
                variant="secondary"
                disabled={resendingEmail}
                onClick={handleResendVerification}
              >
                {resendingEmail ? "Sending..." : "Resend Verification Email"}
              </Button>
            )}
          </div>
        </Card>

        {/* Data Export */}
        <Card className="space-y-3">
          <h3 className="text-base font-bold text-[#182044]">
            Export Your Placement & Career Data
          </h3>
          <p className="text-xs text-[#66708F] leading-relaxed">
            Download a complete JSON archive of your own student profile, verified
            skills, projects, study tasks, quiz attempts, and job applications.
            Private data of other students is strictly isolated.
          </p>
          <div>
            <Button onClick={handleExportData} disabled={exporting}>
              <Download className="w-4 h-4" />
              <span>
                {exporting
                  ? "Preparing Export..."
                  : "Export My Placement Data (JSON)"}
              </span>
            </Button>
          </div>
        </Card>

        {/* Account Deletion */}
        <Card className="border-red-200 bg-red-50/20 space-y-3">
          <div className="flex items-center gap-2 text-[#E55353]">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="text-base font-bold">Delete Account</h3>
          </div>
          <p className="text-xs text-[#66708F] leading-relaxed">
            Permanently delete your PlaceTrace account and personal records.
            Requires password confirmation. The last active administrator account
            is protected from deletion.
          </p>
          <div>
            <Button
              variant="danger"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete My Account</span>
            </Button>
          </div>
        </Card>
      </div>

      {/* Password Confirmation Modal for Account Deletion */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Permanent Account Deletion"
      >
        <form onSubmit={handleDeleteAccount} className="space-y-4 text-xs">
          <p className="text-[#66708F]">
            Please enter your current password to confirm permanent deletion of
            your PlaceTrace account.
          </p>
          <div>
            <label className="block font-semibold text-[#182044] mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button variant="danger" type="submit" disabled={deleting}>
              {deleting ? "Deleting..." : "Confirm Delete Account"}
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
