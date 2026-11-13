import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  CalendarCheck,
  Code2,
  FolderGit2,
  BookOpen,
  UserCircle,
  FileText,
  Target,
  ClipboardList,
  BarChart3,
  Building2,
  ShieldCheck,
  Settings,
  LogOut,
  Compass,
  X,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export function Sidebar({ mobileOpen = false, onCloseMobile }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const primaryLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/jobs", label: "Job Opportunities", icon: Briefcase },
    { to: "/study-planner", label: "Study Planner", icon: CalendarCheck },
    { to: "/practice", label: "Practice & Quizzes", icon: Code2 },
    { to: "/projects", label: "Projects", icon: FolderGit2 },
    { to: "/resources", label: "Resources", icon: BookOpen },
    { to: "/profile", label: "Profile", icon: UserCircle },
  ];

  const careerToolsLinks = [
    { to: "/resume", label: "Resume Analysis", icon: FileText },
    { to: "/skill-gap", label: "Skill Gap", icon: Target },
    { to: "/applications", label: "Applications", icon: ClipboardList },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
  ];

  const roleLinks = [];
  if (user?.role === "TPO" || user?.role === "ADMIN") {
    roleLinks.push({ to: "/tpo", label: "TPO Dashboard", icon: Building2 });
  }
  if (user?.role === "ADMIN") {
    roleLinks.push({ to: "/admin-portal", label: "Admin Dashboard", icon: ShieldCheck });
  }
  roleLinks.push({ to: "/settings", label: "Settings", icon: Settings });

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const renderNavItem = (item) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.to}
        to={item.to}
        onClick={() => onCloseMobile && onCloseMobile()}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium pt-transition ${
            isActive
              ? "bg-[#6555F5] text-white shadow-nav"
              : "text-slate-300/85 hover:text-white hover:bg-white/8"
          }`
        }
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span>{item.label}</span>
      </NavLink>
    );
  };

  return (
    <>
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-[#111936]/60 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#172044] text-white flex flex-col justify-between shrink-0 pt-transition ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-5 overflow-y-auto">
          {/* Brand Header */}
          <div className="flex items-center justify-between mb-6 px-1">
            <div
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-[#6555F5] flex items-center justify-center shadow-nav">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-base font-extrabold tracking-tight text-white">
                  Place<span className="text-[#7C5CFF]">Trace</span>
                </span>
                <p className="text-[10px] text-slate-400 leading-none mt-0.5">
                  Placement Companion
                </p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Primary Navigation */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400/80 mb-1.5">
              Workspace
            </p>
            {primaryLinks.map(renderNavItem)}
          </div>

          {/* Career Intelligence */}
          <div className="space-y-1 mt-5">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400/80 mb-1.5">
              Career Intelligence
            </p>
            {careerToolsLinks.map(renderNavItem)}
          </div>

          {/* Management & Settings */}
          <div className="space-y-1 mt-5">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400/80 mb-1.5">
              Portal & Account
            </p>
            {roleLinks.map(renderNavItem)}
          </div>
        </div>

        {/* Logout Bottom */}
        <div className="p-4 border-t border-white/10">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-red-500/20 pt-transition"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
