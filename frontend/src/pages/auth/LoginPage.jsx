import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Compass, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { Button, Card } from "../../components/ui";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";

export default function LoginPage() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = await login({ email, password, remember_me: rememberMe });
      addToast(`Welcome back, ${user.full_name}!`, "success");
      if (user.role === "TPO") {
        navigate("/tpo");
      } else if (user.role === "ADMIN") {
        navigate("/admin-portal");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  };

  const fillSeedDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#111936] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#6555F5]/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 right-10 w-80 h-80 rounded-full bg-[#7C5CFF]/20 blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        <div
          onClick={() => navigate("/")}
          className="flex items-center justify-center gap-2.5 mb-6 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-[#6555F5] flex items-center justify-center shadow-nav">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-extrabold text-white tracking-tight">
            Place<span className="text-[#7C5CFF]">Trace</span>
          </span>
        </div>

        <Card className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-xl font-extrabold text-[#182044]">
              Sign in to PlaceTrace
            </h1>
            <p className="text-xs text-[#66708F] mt-1">
              Track your placement readiness, jobs, and career roadmap
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-[#E55353] font-medium"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold text-[#182044] mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#66708F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@placetrace.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-[#182044] focus:outline-none focus:ring-2 focus:ring-[#6555F5]/30 focus:border-[#6555F5]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-[#182044]"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-[#6555F5] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#66708F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-[#182044] focus:outline-none focus:ring-2 focus:ring-[#6555F5]/30 focus:border-[#6555F5]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="inline-flex items-center gap-2 text-[#66708F] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-[#6555F5] focus:ring-[#6555F5]"
                />
                <span>Remember me</span>
              </label>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5"
            >
              <span>{submitting ? "Signing in..." : "Login"}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Explicit Development Seed Account Quick-Fill */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-[#66708F] mb-2 text-center">
              Development Seed Accounts (Click to Autofill):
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillSeedDemo("dhanyashree@placetrace.edu", "Student@12345")}
                className="px-2.5 py-1.5 rounded-lg bg-[#F4F5FF] hover:bg-[#EEEAFE] text-[11px] font-semibold text-[#6555F5] pt-transition"
              >
                Student Demo
              </button>
              <button
                type="button"
                onClick={() => fillSeedDemo("tpo@placetrace.edu", "Tpo@12345")}
                className="px-2.5 py-1.5 rounded-lg bg-[#F4F5FF] hover:bg-[#EEEAFE] text-[11px] font-semibold text-[#6555F5] pt-transition"
              >
                TPO Demo
              </button>
              <button
                type="button"
                onClick={() => fillSeedDemo("admin@placetrace.edu", "Admin@12345")}
                className="px-2.5 py-1.5 rounded-lg bg-[#F4F5FF] hover:bg-[#EEEAFE] text-[11px] font-semibold text-[#6555F5] pt-transition"
              >
                Admin Demo
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-[#66708F] mt-5">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-[#6555F5] hover:underline"
            >
              Create account
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
