import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Compass, Lock } from "lucide-react";
import { Button, Card } from "../../components/ui";
import { api } from "../../services/api";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const res = await api.auth.resetPassword({
        token,
        new_password: newPassword,
      });
      setMessage(res.detail || "Password reset successfully!");
    } catch (err) {
      setError(err.message || "Failed to reset password.");
    }
  };

  return (
    <div className="min-h-screen bg-[#111936] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#6555F5] flex items-center justify-center">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-extrabold text-white">PlaceTrace</span>
        </div>
        <Card className="p-6 space-y-4">
          <div className="text-center">
            <h1 className="text-lg font-bold text-[#182044]">Reset Password</h1>
            <p className="text-xs text-[#66708F] mt-1">
              Set a new strong password for your PlaceTrace account.
            </p>
          </div>
          {message && (
            <div className="p-3 rounded-xl bg-emerald-50 text-[#32B67A] text-xs font-medium">
              {message}
            </div>
          )}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-[#E55353] text-xs font-medium">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Reset token"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
            />
            <div className="relative">
              <Lock className="w-4 h-4 text-[#66708F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min 8 chars)"
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <Button type="submit" className="w-full">
              Update Password
            </Button>
          </form>
          <Link to="/login" className="block text-center text-xs font-semibold text-[#6555F5] hover:underline">
            Return to Login
          </Link>
        </Card>
      </div>
    </div>
  );
}
