import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Compass,
  ArrowRight,
  CheckCircle2,
  Briefcase,
  Award,
  TrendingUp,
  BookOpen,
  Sparkles,
  Target,
  FileText,
  BarChart3,
  ShieldCheck,
  Send,
} from "lucide-react";
import { Button, Card, Badge } from "../components/ui";
import { useAuth } from "../hooks/useAuth";

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [contactSent, setContactSent] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });

  const featureStripItems = [
    {
      icon: TrendingUp,
      title: "Track Placement Readiness",
      subtitle: "Deterministic readiness score & roadmap",
    },
    {
      icon: Briefcase,
      title: "Get Job Recommendations",
      subtitle: "Real-time eligibility & skill matching",
    },
    {
      icon: BookOpen,
      title: "Access Study Resources",
      subtitle: "Curated sheets, mock tests & planner",
    },
    {
      icon: Sparkles,
      title: "Stay Ahead",
      subtitle: "ML resume analysis & skill-gap insights",
    },
  ];

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (contactForm.name && contactForm.email) {
      setContactSent(true);
      setContactForm({ name: "", email: "", message: "" });
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5FF] text-[#182044] flex flex-col">
      {/* Top Landing Header */}
      <header className="bg-[#111936] text-white border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-[#6555F5] flex items-center justify-center shadow-nav">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-extrabold tracking-tight">
              Placement<span className="text-[#7C5CFF]">Trace</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-300">
            <a href="#home" className="hover:text-white pt-transition">
              Home
            </a>
            <a href="#features" className="hover:text-white pt-transition">
              Features
            </a>
            <a href="#about" className="hover:text-white pt-transition">
              About
            </a>
            <a href="#contact" className="hover:text-white pt-transition">
              Contact
            </a>
            <Link to="/login" className="hover:text-white pt-transition">
              Login
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button onClick={() => navigate("/dashboard")} size="md">
                Open Dashboard <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-200 hover:text-white px-3 py-2"
                >
                  Login
                </Link>
                <Button onClick={() => navigate("/register")} size="md">
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        id="home"
        className="relative bg-[#111936] text-white overflow-hidden pt-12 pb-20 lg:py-20"
      >
        {/* Subtle decorative purple glows */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#6555F5]/20 blur-3xl" />
        <div className="pointer-events-none absolute top-1/3 right-10 w-80 h-80 rounded-full bg-[#7C5CFF]/20 blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Hero Copy */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-medium text-indigo-200">
                <Sparkles className="w-3.5 h-3.5 text-[#7C5CFF]" />
                <span>Intelligent Campus Placement & Career Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12]">
                <span className="block">Track.</span>
                <span className="block">Prepare.</span>
                <span className="block text-[#7C5CFF]">Get Placed.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
                Your complete placement companion — from learning to landing your
                dream job.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  size="lg"
                  onClick={() =>
                    navigate(isAuthenticated ? "/dashboard" : "/register")
                  }
                  className="px-6 py-3 text-sm font-semibold shadow-nav"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold border border-white/20 text-white hover:bg-white/10 pt-transition"
                >
                  Learn More
                </a>
              </div>
            </div>

            {/* Right Column: Student/Career Illustration + Floating Feature Cards */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto max-w-lg">
                {/* Floating Card 1: Track Your Progress */}
                <div className="hidden sm:flex items-center gap-2.5 bg-white text-[#182044] px-4 py-2.5 rounded-2xl shadow-xl absolute -top-5 -left-6 z-20 border border-indigo-100">
                  <span className="w-7 h-7 rounded-lg bg-emerald-50 text-[#32B67A] flex items-center justify-center font-bold text-xs">
                    ✓
                  </span>
                  <div>
                    <p className="text-xs font-bold">Track Your Progress</p>
                    <p className="text-[10px] text-[#66708F]">Readiness & Roadmap</p>
                  </div>
                </div>

                {/* Floating Card 2: Explore Jobs */}
                <div className="hidden sm:flex items-center gap-2.5 bg-white text-[#182044] px-4 py-2.5 rounded-2xl shadow-xl absolute top-1/3 -right-6 z-20 border border-indigo-100">
                  <span className="w-7 h-7 rounded-lg bg-[#EEEAFE] text-[#6555F5] flex items-center justify-center text-xs">
                    💼
                  </span>
                  <div>
                    <p className="text-xs font-bold">Explore Jobs</p>
                    <p className="text-[10px] text-[#66708F]">Smart Skill Match</p>
                  </div>
                </div>

                {/* Floating Card 3: Ace Interviews */}
                <div className="hidden sm:flex items-center gap-2.5 bg-white text-[#182044] px-4 py-2.5 rounded-2xl shadow-xl absolute -bottom-5 left-8 z-20 border border-indigo-100">
                  <span className="w-7 h-7 rounded-lg bg-amber-50 text-[#F4B942] flex items-center justify-center text-xs">
                    🏆
                  </span>
                  <div>
                    <p className="text-xs font-bold">Ace Interviews</p>
                    <p className="text-[10px] text-[#66708F]">Mock Tests & Prep</p>
                  </div>
                </div>

                {/* Central Student & Career Vector Illustration Card */}
                <div className="bg-[#172044] border border-white/15 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                  <svg
                    viewBox="0 0 480 340"
                    className="w-full h-auto"
                    role="img"
                    aria-label="PlaceTrace Student Career Illustration"
                  >
                    <defs>
                      <linearGradient id="ptGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#6555F5" />
                        <stop offset="100%" stopColor="#7C5CFF" />
                      </linearGradient>
                    </defs>
                    {/* Soft background card */}
                    <rect x="20" y="20" width="440" height="300" rx="22" fill="#1E2956" />
                    {/* Dashboard preview bars inside illustration */}
                    <rect x="45" y="45" width="175" height="90" rx="14" fill="#FFFFFF" />
                    <text x="62" y="72" fill="#66708F" fontSize="11" fontWeight="600">
                      Placement Readiness
                    </text>
                    <text x="62" y="106" fill="#182044" fontSize="26" fontWeight="800">
                      78%
                    </text>
                    <rect x="130" y="90" width="48" height="20" rx="10" fill="#E8F8F0" />
                    <text x="140" y="104" fill="#32B67A" fontSize="10" fontWeight="700">
                      ↑ +5%
                    </text>

                    {/* Roadmap mini card */}
                    <rect x="45" y="150" width="175" height="145" rx="14" fill="#FFFFFF" />
                    <text x="62" y="175" fill="#182044" fontSize="11" fontWeight="700">
                      Placement Roadmap
                    </text>
                    <circle cx="68" cy="200" r="7" fill="#32B67A" />
                    <text x="84" y="204" fill="#182044" fontSize="10" fontWeight="600">
                      Java Fundamentals
                    </text>
                    <circle cx="68" cy="230" r="7" fill="#32B67A" />
                    <text x="84" y="234" fill="#182044" fontSize="10" fontWeight="600">
                      Java DSA
                    </text>
                    <circle cx="68" cy="260" r="7" fill="#6555F5" />
                    <text x="84" y="264" fill="#6555F5" fontSize="10" fontWeight="700">
                      Full Stack Dev
                    </text>

                    {/* Student Character & Laptop Illustration on Right */}
                    <circle cx="340" cy="175" r="88" fill="url(#ptGrad)" opacity="0.25" />
                    {/* Desk & Laptop */}
                    <rect x="265" y="245" width="155" height="10" rx="5" fill="#94A3B8" />
                    <rect x="295" y="195" width="85" height="50" rx="8" fill="#E2E8F0" />
                    <circle cx="337" cy="220" r="6" fill="#6555F5" />
                    {/* Student Avatar Silhouette */}
                    <circle cx="345" cy="122" r="26" fill="#F8FAFC" />
                    <path
                      d="M305 195 C305 158 385 158 385 195 Z"
                      fill="url(#ptGrad)"
                    />
                    {/* Graduation / Career Badge */}
                    <rect x="365" y="55" width="75" height="32" rx="10" fill="#32B67A" />
                    <text x="378" y="75" fill="#FFFFFF" fontSize="11" fontWeight="700">
                      PLACED ✓
                    </text>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Horizontal Feature Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 w-full">
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {featureStripItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="p-5 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#EEEAFE] text-[#6555F5] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#182044]">{item.title}</h3>
                  <p className="text-xs text-[#66708F] mt-0.5">{item.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="purple">COMPLETE PLACEMENT ECOSYSTEM</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#182044] mt-3">
            Built for Students, Placement Officers & Administrators
          </h2>
          <p className="text-sm text-[#66708F] mt-2">
            Every workflow from skill preparation and ML resume scoring to campus drive
            eligibility and offer tracking in one unified platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card hover>
            <div className="w-10 h-10 rounded-xl bg-[#EEEAFE] text-[#6555F5] flex items-center justify-center mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#182044]">
              ML Resume & JD Parsing
            </h3>
            <p className="text-xs text-[#66708F] mt-2 leading-relaxed">
              Automatically extract verified skills from student resumes and job
              descriptions, score resume sections, and uncover high-priority skill gaps.
            </p>
          </Card>

          <Card hover>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#32B67A] flex items-center justify-center mb-4">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#182044]">
              Automated Eligibility & Matching
            </h3>
            <p className="text-xs text-[#66708F] mt-2 leading-relaxed">
              Instant verification against degree, branch, CGPA cutoffs, and active
              backlogs alongside real-time skill match percentages.
            </p>
          </Card>

          <Card hover>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#F4B942] flex items-center justify-center mb-4">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#182044]">
              TPO & Campus Analytics
            </h3>
            <p className="text-xs text-[#66708F] mt-2 leading-relaxed">
              Manage student cohorts, publish placement drives, update interview stages,
              and track real-time branch-wise and company-wise placement trends.
            </p>
          </Card>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <Badge variant="purple">WHY PLACETRACE</Badge>
            <h2 className="text-2xl font-extrabold text-[#182044]">
              Transparent Readiness & End-to-End Career Tracking
            </h2>
            <p className="text-sm text-[#66708F] leading-relaxed">
              PlaceTrace replaces scattered spreadsheets and static portals with a
              deterministic 8-factor Placement Readiness Engine, structured DSA &
              full-stack roadmaps, interactive mock tests, and role-based portals for
              Students, TPOs, and Administrators.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 rounded-xl bg-[#F4F5FF]">
                <p className="text-lg font-extrabold text-[#6555F5]">8 Factors</p>
                <p className="text-xs text-[#66708F]">Deterministic Readiness Score</p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F4F5FF]">
                <p className="text-lg font-extrabold text-[#32B67A]">3 Portals</p>
                <p className="text-xs text-[#66708F]">Student, TPO & Admin RBAC</p>
              </div>
            </div>
          </div>

          <Card className="bg-[#172044] text-white space-y-4">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#32B67A]" />
              <span>Enterprise-Grade Security & Architecture</span>
            </div>
            <h3 className="text-lg font-bold">
              React + Django REST + FastAPI ML + PostgreSQL
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#32B67A]" />
                Role-based access control & JWT token rotation
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#32B67A]" />
                Scikit-learn TF-IDF & NLP skill gap analyzer
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#32B67A]" />
                Audit logging, rate limiting & student data privacy
              </li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-14 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <Card>
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-[#182044]">
              Connect with the Placement Cell
            </h2>
            <p className="text-xs text-[#66708F] mt-1">
              Have questions about campus drives, TPO onboarding, or student accounts?
            </p>
          </div>
          {contactSent ? (
            <div className="p-4 rounded-xl bg-emerald-50 text-[#32B67A] text-center text-xs font-semibold">
              Thank you! Your message has been received by the PlaceTrace team.
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={contactForm.name}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, name: e.target.value })
                  }
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#6555F5]"
                />
                <input
                  type="email"
                  required
                  placeholder="Your Email"
                  value={contactForm.email}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, email: e.target.value })
                  }
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#6555F5]"
                />
              </div>
              <textarea
                rows={3}
                required
                placeholder="How can we help?"
                value={contactForm.message}
                onChange={(e) =>
                  setContactForm({ ...contactForm, message: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#6555F5]"
              />
              <div className="flex justify-end">
                <Button type="submit" size="md">
                  <Send className="w-3.5 h-3.5" /> Send Inquiry
                </Button>
              </div>
            </form>
          )}
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-[#111936] text-slate-400 py-8 mt-auto border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#7C5CFF]" />
            <span className="font-bold text-white">PlaceTrace</span>
            <span>— Track. Prepare. Get Placed.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-white">
              Login
            </Link>
            <Link to="/register" className="hover:text-white">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
