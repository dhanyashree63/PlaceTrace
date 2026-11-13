import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Compass, Mail } from "lucide-react";
import { Button, Card } from "../../components/ui";
import { api } from "../../services/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sentMessage, setSentMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSentMessage("");
    try {
      const res = await api.auth.forgotPassword(email);
      setSentMessage(res.detail);
    } catch (err) {
      setError(err.message || "Could not process request.");
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
            <h1 className="text-lg font-bold text-[#182044]">Forgot Password</h1>
            <p className="text-xs text-[#66708F] mt-1">
              Enter your registered email to receive a password reset link.
            </p>
          </div>
          {sentMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 text-[#32B67A] text-xs font-medium">
              {sentMessage}
            </div>
          )}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-[#E55353] text-xs font-medium">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Mail className="w-4 h-4 text-[#66708F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@placetrace.edu"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <Button type="submit" className="w-full">
              Send Reset Instructions
            </Button>
          </form>
          <p className="text-center text-xs text-[#66708F]">
            Remembered your password?{" "}
            <Link to="/login" className="font-semibold text-[#6555F5] hover:underline">
              Back to Login
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
