import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Compass, CheckCircle2 } from "lucide-react";
import { Button, Card } from "../../components/ui";
import { api } from "../../services/api";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [statusMsg, setStatusMsg] = useState("");
  const [error, setError] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setStatusMsg("");
    try {
      const res = await api.auth.verifyEmail(token);
      setStatusMsg(res.detail || "Email verified successfully!");
    } catch (err) {
      setError(err.message || "Verification failed.");
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
        <Card className="p-6 text-center space-y-4">
          <CheckCircle2 className="w-10 h-10 text-[#6555F5] mx-auto" />
          <h1 className="text-lg font-bold text-[#182044]">Email Verification</h1>
          <p className="text-xs text-[#66708F]">
            Enter the verification token sent to your institutional email address.
          </p>
          {statusMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 text-[#32B67A] text-xs font-semibold">
              {statusMsg}
            </div>
          )}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-[#E55353] text-xs font-semibold">
              {error}
            </div>
          )}
          <form onSubmit={handleVerify} className="space-y-3">
            <input
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste verification token"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
            />
            <Button type="submit" className="w-full">
              Verify Email
            </Button>
          </form>
          <Link to="/dashboard" className="block text-xs font-semibold text-[#6555F5] hover:underline">
            Return to Dashboard
          </Link>
        </Card>
      </div>
    </div>
  );
}
