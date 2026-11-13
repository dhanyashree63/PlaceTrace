import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Compass, ArrowRight, AlertCircle } from "lucide-react";
import { Button, Card } from "../../components/ui";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";

export default function RegisterPage() {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "STUDENT",
    invite_code: "",
    college_name: "RNSIT",
    branch: "CSE",
    cgpa: "9.00",
    graduation_year: 2027,
    usn: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register({
        ...formData,
        cgpa: parseFloat(formData.cgpa || "8.5"),
        graduation_year: parseInt(formData.graduation_year, 10) || 2027,
      });
      addToast("Account created! Welcome to PlaceTrace.", "success");
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed. Please check your inputs.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111936] flex flex-col justify-center items-center p-4 py-10">
      <div className="w-full max-w-lg">
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
              Create Your PlaceTrace Account
            </h1>
            <p className="text-xs text-[#66708F] mt-1">
              Start tracking your placement readiness and career opportunities
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#182044] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  placeholder="Dhanyashree N"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#6555F5]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#182044] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="student@placetrace.edu"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#6555F5]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#182044] mb-1">
                  Password (min 8 chars)
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#6555F5]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#182044] mb-1">
                  Account Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#6555F5]"
                >
                  <option value="STUDENT">Student</option>
                  <option value="TPO">Training & Placement Officer (TPO)</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
            </div>

            {formData.role !== "STUDENT" ? (
              <div>
                <label className="block text-xs font-semibold text-[#182044] mb-1">
                  Role Invite Code
                </label>
                <input
                  type="text"
                  required
                  value={formData.invite_code}
                  onChange={(e) =>
                    setFormData({ ...formData, invite_code: e.target.value })
                  }
                  placeholder="PT-TPO2026"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#6555F5]"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-[#66708F] mb-1">
                    College
                  </label>
                  <input
                    type="text"
                    value={formData.college_name}
                    onChange={(e) =>
                      setFormData({ ...formData, college_name: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#66708F] mb-1">
                    Branch
                  </label>
                  <select
                    value={formData.branch}
                    onChange={(e) =>
                      setFormData({ ...formData, branch: e.target.value })
                    }
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs bg-white"
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
                  <label className="block text-[11px] font-semibold text-[#66708F] mb-1">
                    CGPA
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={formData.cgpa}
                    onChange={(e) =>
                      setFormData({ ...formData, cgpa: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#66708F] mb-1">
                    USN
                  </label>
                  <input
                    type="text"
                    placeholder="1RN23CS..."
                    value={formData.usn}
                    onChange={(e) =>
                      setFormData({ ...formData, usn: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>
            )}

            <Button type="submit" disabled={submitting} className="w-full py-2.5">
              <span>{submitting ? "Creating Account..." : "Register Account"}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <p className="text-center text-xs text-[#66708F] mt-5">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-[#6555F5] hover:underline">
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
