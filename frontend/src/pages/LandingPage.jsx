import React, { useState, useEffect } from "react";
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
  Zap,
  Flame,
  Trophy,
  Check,
  Star,
  Users,
  GraduationCap,
  Code2,
} from "lucide-react";
import { Button, Card, Badge } from "../components/ui";
import { useAuth } from "../hooks/useAuth";

const MOTIVATION_WORDS = [
  "Get Placed. 🚀",
  "Crack 20+ LPA. 💼",
  "Land Dream Tech. 🌟",
  "Master DSA & AI. ⚡",
  "Ace Every Round. 🎯",
];

const TICKER_ITEMS = [
  { icon: "🎉", text: "Rahul S. placed at Oracle (19.5 LPA)", tag: "OFFER" },
  { icon: "🚀", text: "Sneha V. selected at Google (32 LPA)", tag: "TIER 1" },
  { icon: "💼", text: "142 Active Placement Drives Currently Open", tag: "CAMPUS" },
  { icon: "⚡", text: "Dhanyashree N scored 96% on Java Concurrency Test", tag: "RANK #1" },
  { icon: "🔥", text: "Cohort Average Placement Readiness up +12% this month", tag: "INSIGHT" },
  { icon: "🎯", text: "Atlassian Drive: Assessment round begins Saturday", tag: "UPCOMING" },
  { icon: "🌟", text: "Priya N. accepted SDE offer at Microsoft (28 LPA)", tag: "OFFER" },
];

const CAREER_JOURNEY_STAGES = [
  {
    step: "01",
    title: "Diagnostic Skill Audit",
    short: "Diagnose",
    badge: "Day 1",
    tagline: "Discover your exact baseline across 36 core placement skills",
    description:
      "Take structured MCQ diagnostic tests across Java, DSA, DBMS, and System Design to identify your strengths and high-priority skill gaps instantly.",
    highlight: "Automated baseline scoring across 10 subject domains",
    metrics: { readiness: "45% Baseline", time: "15 mins", focus: "Gap Analysis" },
  },
  {
    step: "02",
    title: "Intelligent Study Roadmap",
    short: "Roadmap",
    badge: "Weeks 1-4",
    tagline: "Step-by-step curriculum with zero guesswork",
    description:
      "Follow curated curriculum milestones from core algorithms to full-stack microservices. Track daily scheduled coding sessions, revisions, and milestone completions.",
    highlight: "8 comprehensive CS and engineering modules",
    metrics: { readiness: "65% Momentum", time: "4 weeks", focus: "DSA & OOPs" },
  },
  {
    step: "03",
    title: "ML Resume Intelligence",
    short: "Resume",
    badge: "Week 5",
    tagline: "Beat ATS filters and highlight quantifiable engineering impact",
    description:
      "Our scikit-learn TF-IDF engine extracts technical skills, detects action verbs, and verifies measurable project metrics to score your resume up to 98/100.",
    highlight: "Instant keyword match and action-plan suggestions",
    metrics: { readiness: "78% Verified", time: "Instant", focus: "ATS & Impact" },
  },
  {
    step: "04",
    title: "Mock Drives & Assessments",
    short: "Mocks",
    badge: "Weeks 6-8",
    tagline: "Simulate real company online tests under timer pressure",
    description:
      "Take timed mock tests modeled after Oracle, Google, and TCS assessments. Review granular explanations and watch your topic radar performance soar.",
    highlight: "Topic-wise scoring with detailed correct-answer breakdowns",
    metrics: { readiness: "88% Prime", time: "Weekly", focus: "Speed & Accuracy" },
  },
  {
    step: "05",
    title: "Drive Selection & Offer Letter",
    short: "Placement",
    badge: "Placement Day",
    tagline: "Meet eligibility, apply in 1-click, and celebrate your offer",
    description:
      "5-criteria automated eligibility checking lets you apply seamlessly. TPO advances your interview stages and automatically records your placement offer.",
    highlight: "Automated placement record and student cohort celebration",
    metrics: { readiness: "100% Placed", time: "Drive Day", focus: "Offer Letter" },
  },
];

const SKILL_BUBBLES = [
  { name: "Java DSA", level: "High Demand", color: "#6555F5" },
  { name: "System Design", level: "Tier-1 Essential", color: "#7C5CFF" },
  { name: "SQL & Indexing", level: "Core CS", color: "#32B67A" },
  { name: "React & Full-Stack", level: "Top Web Stack", color: "#38BDF8" },
  { name: "Python & ML", level: "High Growth", color: "#F4B942" },
  { name: "Docker & Cloud", level: "DevOps", color: "#EC4899" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Dynamic Cycling Headline State
  const [wordIdx, setWordIdx] = useState(0);
  const [fadeWord, setFadeWord] = useState(true);

  // Interactive Readiness Simulator State
  const [targetRole, setTargetRole] = useState("SDE");
  const [dsaLevel, setDsaLevel] = useState(2); // 1 = Basics, 2 = Intermediate, 3 = Advanced
  const [resumeImpact, setResumeImpact] = useState(2); // 1 = Standard, 2 = High Impact
  const [projectsCount, setProjectsCount] = useState(2); // 1 = 1-2, 2 = 3+ Deployed
  const [quizzesDone, setQuizzesDone] = useState(3);

  // Active Journey Stage Tab
  const [activeStage, setActiveStage] = useState(0);

  // Contact form state
  const [contactSent, setContactSent] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });

  // Rotate motivational words smoothly
  useEffect(() => {
    const interval = setInterval(() => {
      setFadeWord(false);
      setTimeout(() => {
        setWordIdx((prev) => (prev + 1) % MOTIVATION_WORDS.length);
        setFadeWord(true);
      }, 250);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Compute live simulated readiness score based on interactive sliders
  const simScore = Math.min(
    98,
    Math.round(
      40 +
        dsaLevel * 14 +
        resumeImpact * 10 +
        projectsCount * 7 +
        Math.min(quizzesDone, 5) * 2.5
    )
  );

  const getPackageTier = (score) => {
    if (score >= 88) return { ctc: "₹18 – ₹32 LPA", tier: "Tier-1 Product / Super Dream", color: "text-[#32B67A]" };
    if (score >= 75) return { ctc: "₹10 – ₹18 LPA", tier: "Dream / High Growth", color: "text-[#7C5CFF]" };
    return { ctc: "₹6 – ₹10 LPA", tier: "Standard / Core IT", color: "text-[#F4B942]" };
  };

  const currentTier = getPackageTier(simScore);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (contactForm.name && contactForm.email) {
      setContactSent(true);
      setContactForm({ name: "", email: "", message: "" });
    }
  };

  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5FF] text-[#182044] flex flex-col selection:bg-[#6555F5] selection:text-white">
      {/* Top Motivational Live Ticker Bar */}
      <div className="bg-[#0D132A] text-xs text-slate-300 border-b border-white/10 overflow-hidden py-2 relative z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-3">
          <div className="flex items-center gap-1.5 shrink-0 bg-[#6555F5] text-white px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider animate-pulse">
            <Flame className="w-3 h-3 text-amber-300" />
            <span>LIVE CAMPUS FEED</span>
          </div>

          <div className="overflow-hidden whitespace-nowrap w-full">
            <div className="animate-marquee flex items-center gap-8 text-xs">
              {TICKER_ITEMS.concat(TICKER_ITEMS).map((item, idx) => (
                <div key={idx} className="inline-flex items-center gap-2 shrink-0">
                  <span>{item.icon}</span>
                  <span className="text-slate-200 font-medium">{item.text}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-indigo-300 font-bold">
                    {item.tag}
                  </span>
                  <span className="text-white/20 ml-2">•</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Landing Header */}
      <header className="bg-[#111936]/95 backdrop-blur-md text-white border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6555F5] to-[#7C5CFF] flex items-center justify-center shadow-nav group-hover:scale-105 pt-transition">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-extrabold tracking-tight">
              Placement<span className="text-[#7C5CFF]">Trace</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-300">
            <a
              href="#home"
              onClick={(e) => scrollToSection(e, "home")}
              className="hover:text-white pt-transition"
            >
              Home
            </a>
            <a
              href="#simulator"
              onClick={(e) => scrollToSection(e, "simulator")}
              className="hover:text-white pt-transition flex items-center gap-1 text-[#7C5CFF]"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              Readiness Simulator
            </a>
            <a
              href="#journey"
              onClick={(e) => scrollToSection(e, "journey")}
              className="hover:text-white pt-transition"
            >
              Placement Roadmap
            </a>
            <a
              href="#features"
              onClick={(e) => scrollToSection(e, "features")}
              className="hover:text-white pt-transition"
            >
              Features
            </a>
            <a
              href="#contact"
              onClick={(e) => scrollToSection(e, "contact")}
              className="hover:text-white pt-transition"
            >
              Contact
            </a>
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
                  className="text-xs font-semibold text-slate-200 hover:text-white px-3 py-2 pt-transition hover:bg-white/5 rounded-lg"
                >
                  Login
                </Link>
                <Button
                  onClick={() => navigate("/register")}
                  size="md"
                  className="shadow-nav hover:shadow-hover"
                >
                  Get Started Free
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section with Ambient Motion & Animated Highlights */}
      <section
        id="home"
        className="relative bg-[#111936] text-white overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-24 border-b border-white/5"
      >
        {/* Animated ambient drifting orbs */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-[480px] h-[480px] rounded-full bg-[#6555F5]/25 blur-[120px] animate-pulse-glow" />
        <div className="pointer-events-none absolute top-1/4 right-0 w-[520px] h-[520px] rounded-full bg-[#7C5CFF]/20 blur-[130px] animate-pulse-glow" style={{ animationDelay: "3s" }} />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 w-[380px] h-[380px] rounded-full bg-cyan-500/15 blur-[110px]" />

        {/* Grid pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Hero Motivational Copy */}
            <div className="lg:col-span-6 space-y-6">
              {/* Animated Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-indigo-200 backdrop-blur-sm shadow-sm animate-float-slow">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Next-Gen Placement Readiness Engine</span>
                <span className="bg-[#6555F5] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  2026 Batch Ready
                </span>
              </div>

              {/* Dynamic Animated Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12]">
                <span className="block text-slate-100">Track.</span>
                <span className="block text-slate-100">Prepare.</span>
                <span
                  className={`block transition-all duration-300 ${
                    fadeWord ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
                  } gradient-text-animated`}
                >
                  {MOTIVATION_WORDS[wordIdx]}
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
                Stop guessing your interview readiness. Measure your 8-factor score,
                bridge targeted skill gaps with scikit-learn ML, and land top offers
                at Google, Oracle, Atlassian, and Microsoft.
              </p>

              {/* Primary Call to Actions */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  size="lg"
                  onClick={() =>
                    navigate(isAuthenticated ? "/dashboard" : "/register")
                  }
                  className="px-7 py-3.5 text-sm font-bold shadow-nav hover:shadow-hover group"
                >
                  <span>Start Your Preparation Free</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 pt-transition" />
                </Button>
                <a
                  href="#simulator"
                  onClick={(e) => scrollToSection(e, "simulator")}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold border border-white/20 text-white hover:bg-white/10 hover:border-white/30 pt-transition backdrop-blur-sm"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Try Live Simulator</span>
                </a>
              </div>

              {/* Motivation Highlights Strip */}
              <div className="pt-4 grid grid-cols-3 gap-4 border-t border-white/10">
                <div>
                  <p className="text-2xl font-extrabold text-white">94.8%</p>
                  <p className="text-[11px] text-slate-400">Offer Acceptance</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-[#38BDF8]">₹18.5 LPA</p>
                  <p className="text-[11px] text-slate-400">Average Tier-1 CTC</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-[#32B67A]">100% Free</p>
                  <p className="text-[11px] text-slate-400">For College Students</p>
                </div>
              </div>
            </div>

            {/* Right Column: Live Interactive Placement Readiness Card */}
            <div className="lg:col-span-6 relative">
              {/* Drifting Achievement Floating Pill 1 (Top Left) */}
              <div className="hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-md text-[#182044] px-4 py-2 rounded-2xl shadow-xl absolute -top-4 -left-6 z-30 border border-indigo-100 animate-float-slow">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-[#32B67A] flex items-center justify-center font-bold text-xs">
                  🏆
                </span>
                <div>
                  <p className="text-[11px] font-bold">Google Selection Verified</p>
                  <p className="text-[9px] text-[#32B67A] font-semibold">32.0 LPA • Batch 2026</p>
                </div>
              </div>

              {/* Drifting Achievement Floating Pill 2 (Bottom Right) */}
              <div className="hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-md text-[#182044] px-4 py-2 rounded-2xl shadow-xl absolute -bottom-5 right-2 z-30 border border-indigo-100 animate-float-reverse">
                <span className="w-6 h-6 rounded-lg bg-amber-100 text-[#F4B942] flex items-center justify-center text-xs">
                  ⚡
                </span>
                <div>
                  <p className="text-[11px] font-bold">Resume Score: 94/100</p>
                  <p className="text-[9px] text-[#6555F5] font-semibold">ATS Passed • ML Verified</p>
                </div>
              </div>

              {/* Main Interactive Hero Card */}
              <div className="bg-[#172044]/90 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#6555F5] flex items-center justify-center">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Live Placement Cockpit</h3>
                      <p className="text-[10px] text-slate-400">Deterministic ML Career Engine</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-[#32B67A] text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#32B67A] animate-pulse" />
                    SIMULATOR LIVE
                  </span>
                </div>

                {/* Score & Gauge Section */}
                <div className="py-5 grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                  {/* Gauge Graphic */}
                  <div className="sm:col-span-5 flex flex-col items-center justify-center text-center">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      {/* Outer animated glow ring */}
                      <div className="absolute inset-0 rounded-full bg-[#6555F5]/30 blur-xl animate-pulse" />
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="url(#heroScoreGrad)"
                          strokeWidth="8"
                          strokeDasharray={2 * Math.PI * 40}
                          strokeDashoffset={2 * Math.PI * 40 * (1 - simScore / 100)}
                          strokeLinecap="round"
                          fill="transparent"
                          className="transition-all duration-700 ease-out"
                        />
                        <defs>
                          <linearGradient id="heroScoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#38BDF8" />
                            <stop offset="50%" stopColor="#6555F5" />
                            <stop offset="100%" stopColor="#32B67A" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-3xl font-extrabold text-white tracking-tight">
                          {simScore}%
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                          Ready ✓
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-2 font-medium">
                      Calculated Readiness
                    </p>
                  </div>

                  {/* Predicted Placement Tier */}
                  <div className="sm:col-span-7 space-y-3 bg-[#111936]/80 p-4 rounded-2xl border border-white/10">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Predicted CTC Band
                      </p>
                      <p className={`text-xl font-extrabold ${currentTier.color}`}>
                        {currentTier.ctc}
                      </p>
                      <p className="text-xs font-semibold text-slate-200">
                        {currentTier.tier}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">DSA & Algorithms</span>
                        <span className="text-white font-bold">
                          {dsaLevel === 3 ? "Advanced (100%)" : dsaLevel === 2 ? "Medium (75%)" : "Basic (50%)"}
                        </span>
                      </div>
                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#38BDF8] h-full rounded-full transition-all duration-500"
                          style={{ width: `${dsaLevel === 3 ? 100 : dsaLevel === 2 ? 75 : 50}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Resume Impact & Projects</span>
                        <span className="text-white font-bold">
                          {resumeImpact === 2 ? "High Impact" : "Standard"}
                        </span>
                      </div>
                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#32B67A] h-full rounded-full transition-all duration-500"
                          style={{ width: `${resumeImpact === 2 ? 92 : 65}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Interactive Toggles (Students Love Interacting) */}
                <div className="mt-2 pt-3 border-t border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-300">
                      Simulate Your Experience:
                    </span>
                    <span className="text-[10px] text-[#7C5CFF] font-bold">
                      Click to Test Score
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDsaLevel((prev) => (prev % 3) + 1)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left text-xs text-white pt-transition"
                    >
                      <span className="text-[10px] block text-slate-400">DSA Level</span>
                      <span className="font-bold text-[#38BDF8]">
                        {dsaLevel === 3 ? "⚡ Advanced DP & Graphs" : dsaLevel === 2 ? "🌲 Trees & Medium DSA" : "📚 Foundations"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setResumeImpact((prev) => (prev === 1 ? 2 : 1))}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left text-xs text-white pt-transition"
                    >
                      <span className="text-[10px] block text-slate-400">Resume Metrics</span>
                      <span className="font-bold text-[#32B67A]">
                        {resumeImpact === 2 ? "✓ Quantifiable Impact" : "⚠️ Basic Bullets"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Direct Action Link */}
                <div className="mt-4 pt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-300 text-[11px]">
                    Ready to track your actual profile?
                  </span>
                  <button
                    onClick={() => navigate(isAuthenticated ? "/dashboard" : "/register")}
                    className="text-[#7C5CFF] hover:text-white font-bold flex items-center gap-1 hover:underline pt-transition"
                  >
                    <span>Get Real Score</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive In-Demand Skills Strip */}
      <section className="bg-white py-6 border-b border-slate-200/80 shadow-sm relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 shrink-0">
              <Code2 className="w-5 h-5 text-[#6555F5]" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#182044]">
                Top In-Demand Placement Skills (2026):
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {SKILL_BUBBLES.map((sk) => (
                <div
                  key={sk.name}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#F4F5FF] hover:bg-[#EEEAFE] hover:border-[#6555F5] border border-slate-200/80 pt-transition cursor-pointer group"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: sk.color }}
                  />
                  <span className="text-[#182044] font-bold group-hover:text-[#6555F5]">
                    {sk.name}
                  </span>
                  <span className="text-[10px] text-[#66708F] bg-white px-2 py-0.5 rounded-full border border-slate-200">
                    {sk.level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive 5-Stage Career Journey Section */}
      <section id="journey" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="purple">YOUR PATH TO SUCCESS</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#182044] mt-3 tracking-tight">
            How Students Go From Day 1 to Top Offers
          </h2>
          <p className="text-sm text-[#66708F] mt-2 leading-relaxed">
            Click through the 5 proven milestones of the PlaceTrace Placement Engine.
            Every stage provides clear milestones, automated checks, and zero guesswork.
          </p>
        </div>

        {/* Step Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-8">
          {CAREER_JOURNEY_STAGES.map((st, idx) => (
            <button
              key={st.step}
              onClick={() => setActiveStage(idx)}
              className={`p-3.5 rounded-2xl text-left border pt-transition flex flex-col justify-between ${
                activeStage === idx
                  ? "bg-[#172044] text-white border-[#6555F5] shadow-lg scale-[1.02]"
                  : "bg-white hover:bg-slate-50 text-[#182044] border-slate-200/80"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-xs font-black px-2 py-0.5 rounded-md ${
                    activeStage === idx
                      ? "bg-[#6555F5] text-white"
                      : "bg-[#F4F5FF] text-[#6555F5]"
                  }`}
                >
                  Step {st.step}
                </span>
                <span
                  className={`text-[10px] font-bold ${
                    activeStage === idx ? "text-indigo-300" : "text-[#66708F]"
                  }`}
                >
                  {st.badge}
                </span>
              </div>
              <p
                className={`text-xs font-bold leading-tight ${
                  activeStage === idx ? "text-white" : "text-[#182044]"
                }`}
              >
                {st.title}
              </p>
            </button>
          ))}
        </div>

        {/* Active Stage Interactive Showcase Card */}
        {(() => {
          const current = CAREER_JOURNEY_STAGES[activeStage];
          return (
            <Card className="p-6 sm:p-10 border border-indigo-100 shadow-hover bg-gradient-to-br from-white to-[#F8F9FF]">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#6555F5]">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>MILESTONE {current.step} OF 05</span>
                    <span>•</span>
                    <span className="text-[#32B67A]">{current.badge}</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#182044] tracking-tight">
                    {current.title}
                  </h3>

                  <p className="text-sm font-semibold text-[#6555F5]">
                    {current.tagline}
                  </p>

                  <p className="text-sm text-[#66708F] leading-relaxed">
                    {current.description}
                  </p>

                  <div className="p-4 rounded-xl bg-white border border-indigo-100/80 shadow-sm flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#32B67A] shrink-0" />
                    <span className="text-xs font-bold text-[#182044]">
                      {current.highlight}
                    </span>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-4">
                    <Button
                      onClick={() => navigate(isAuthenticated ? "/dashboard" : "/register")}
                      size="md"
                    >
                      <span>Get Started with Step {current.step}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                    <button
                      onClick={() =>
                        setActiveStage((prev) => (prev + 1) % CAREER_JOURNEY_STAGES.length)
                      }
                      className="px-4 py-2 rounded-xl text-xs font-bold text-[#6555F5] hover:bg-[#EEEAFE] pt-transition"
                    >
                      Next Milestone →
                    </button>
                  </div>
                </div>

                {/* Right Interactive Metrics Display */}
                <div className="lg:col-span-5 bg-[#172044] text-white p-6 sm:p-7 rounded-3xl shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-xs font-bold text-slate-300">
                      Step {current.step} Benchmark
                    </span>
                    <Badge variant="success">Active Target</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-[10px] text-slate-400">Target Readiness</p>
                      <p className="text-lg font-black text-[#38BDF8]">
                        {current.metrics.readiness}
                      </p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-[10px] text-slate-400">Timeline</p>
                      <p className="text-lg font-black text-amber-300">
                        {current.metrics.time}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#111936] rounded-xl border border-white/10">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                      Key Skill Dimension
                    </p>
                    <p className="text-sm font-bold text-white mt-0.5">
                      {current.metrics.focus}
                    </p>
                  </div>

                  <div className="text-center pt-2">
                    <p className="text-[11px] text-slate-300 italic">
                      "Students following this 5-stage roadmap clear technical rounds 3.2x faster."
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          );
        })()}
      </section>

      {/* Core Ecosystem Features */}
      <section id="features" className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="purple">ROLE-BASED PLATFORM</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#182044] mt-3">
              One Unified System for Students & Placement Cells
            </h2>
            <p className="text-sm text-[#66708F] mt-2">
              Say goodbye to fragmented Google Sheets and lost emails. Every role has
              its dedicated, high-performance portal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card hover className="space-y-3 group border border-slate-100 hover:border-[#6555F5]/30">
              <div className="w-11 h-11 rounded-2xl bg-[#EEEAFE] text-[#6555F5] flex items-center justify-center group-hover:scale-110 pt-transition">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#182044]">
                ML Resume & Skill Gap Intelligence
              </h3>
              <p className="text-xs text-[#66708F] leading-relaxed">
                Extract technical skills automatically, match against live job descriptions
                using TF-IDF bigram similarity, and receive an actionable upskilling plan.
              </p>
              <div className="pt-2 text-xs font-bold text-[#6555F5] flex items-center gap-1 group-hover:translate-x-1 pt-transition">
                <span>Explore Resume Scorer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Card>

            <Card hover className="space-y-3 group border border-slate-100 hover:border-[#32B67A]/30">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#32B67A] flex items-center justify-center group-hover:scale-110 pt-transition">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#182044]">
                5-Point Automated Eligibility Verification
              </h3>
              <p className="text-xs text-[#66708F] leading-relaxed">
                Instant verification of Degree, Branch, CGPA cutoff, Active Backlogs, and
                Graduation Year. Zero ineligible applications and instant 1-click apply.
              </p>
              <div className="pt-2 text-xs font-bold text-[#32B67A] flex items-center gap-1 group-hover:translate-x-1 pt-transition">
                <span>See Eligibility Engine</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Card>

            <Card hover className="space-y-3 group border border-slate-100 hover:border-amber-400/30">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-[#F4B942] flex items-center justify-center group-hover:scale-110 pt-transition">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#182044]">
                TPO Analytics & 5-Stage Drive Funnel
              </h3>
              <p className="text-xs text-[#66708F] leading-relaxed">
                Move applicants across Applied → Assessment → Tech Interview → HR Interview
                → Selected. Automatically records placement offers and tracks cohort trends.
              </p>
              <div className="pt-2 text-xs font-bold text-[#F4B942] flex items-center gap-1 group-hover:translate-x-1 pt-transition">
                <span>View TPO Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Motivational Numbers & Enterprise Architecture */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#172044] text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <Badge variant="purple">ENTERPRISE FULL-STACK TECH</Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Built for High Reliability, Fast Scaling & Real Placement Success
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Powered by React 18, Django 5 REST Framework, FastAPI ML microservice,
                scikit-learn, and PostgreSQL. Strict security includes JWT rotation,
                brute-force account lockouts, and immutable audit logs.
              </p>
              <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-200">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#32B67A]" /> 8-Factor Deterministic Math
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#32B67A]" /> 9 Live Recharts Dashboards
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#32B67A]" /> Role-Based Access Control
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-[#111936] rounded-2xl border border-white/10 text-center space-y-3">
              <Trophy className="w-12 h-12 text-amber-400 animate-bounce" />
              <h3 className="text-lg font-bold text-white">
                Ready to Join Top Performers?
              </h3>
              <p className="text-xs text-slate-300">
                Create your student profile in 60 seconds and receive your personalized
                readiness roadmap.
              </p>
              <Button
                onClick={() => navigate(isAuthenticated ? "/dashboard" : "/register")}
                size="lg"
                className="w-full shadow-nav hover:shadow-hover"
              >
                <span>Launch PlaceTrace Free</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-14 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <Card className="border border-indigo-100 shadow-card">
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
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#6555F5]"
                />
                <input
                  type="email"
                  required
                  placeholder="Your Email"
                  value={contactForm.email}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, email: e.target.value })
                  }
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#6555F5]"
                />
              </div>
              <textarea
                rows={3}
                required
                placeholder="How can we help you?"
                value={contactForm.message}
                onChange={(e) =>
                  setContactForm({ ...contactForm, message: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#6555F5]"
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
            <Link to="/login" className="hover:text-white pt-transition">
              Login
            </Link>
            <Link to="/register" className="hover:text-white pt-transition">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
