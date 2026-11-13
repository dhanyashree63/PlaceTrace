import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Menu,
  Search,
  ChevronDown,
  UserCircle,
  Settings,
  LogOut,
  CheckCheck,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { api } from "../../services/api";
import { Avatar, Badge } from "../ui";

export function Header({ onOpenMobile, title, subtitle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [quickSearch, setQuickSearch] = useState("");

  const firstName = user?.full_name?.split(" ")[0] || "Student";

  useEffect(() => {
    let mounted = true;
    api.auth
      .notifications()
      .then((data) => {
        if (mounted && Array.isArray(data)) {
          setNotifications(data);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAllRead = async () => {
    try {
      await api.auth.markNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      // Ignore error
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(quickSearch.trim())}`);
    }
  };

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/70 sticky top-0 z-30 px-4 sm:px-6 py-3.5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            aria-label="Open navigation menu"
            onClick={onOpenMobile}
            className="lg:hidden p-2 rounded-xl bg-[#F4F5FF] text-[#182044] hover:bg-[#EEEAFE]"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-[#182044] truncate">
              {title || `Welcome back, ${firstName}! 👋`}
            </h1>
            <p className="text-xs text-[#66708F] truncate">
              {subtitle || "Keep going! You're closer to your dream job."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Job Search */}
          <form onSubmit={handleSearchSubmit} className="hidden md:block relative w-60">
            <Search className="w-3.5 h-3.5 text-[#66708F] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              placeholder="Search companies, roles..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#F4F5FF] border border-indigo-100/80 text-xs text-[#182044] placeholder-[#66708F] focus:outline-none focus:ring-2 focus:ring-[#6555F5]/30"
            />
          </form>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              type="button"
              aria-label="Notifications"
              onClick={() => {
                setShowNotifMenu((prev) => !prev);
                setShowProfileMenu(false);
              }}
              className="relative p-2 rounded-xl bg-[#F4F5FF] text-[#182044] hover:bg-[#EEEAFE] pt-transition"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#6555F5] text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50">
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
                  <span className="text-xs font-bold text-[#182044]">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-[#6555F5] hover:underline"
                    >
                      <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-[#66708F] py-4 text-center">
                      No notifications yet.
                    </p>
                  ) : (
                    notifications.slice(0, 6).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          setShowNotifMenu(false);
                          if (n.link) navigate(n.link);
                        }}
                        className={`p-2.5 rounded-xl text-xs cursor-pointer pt-transition ${
                          n.is_read ? "bg-slate-50/70" : "bg-[#EEEAFE]/60"
                        } hover:bg-[#EEEAFE]`}
                      >
                        <p className="font-semibold text-[#182044]">{n.title}</p>
                        <p className="text-[11px] text-[#66708F] mt-0.5 line-clamp-2">
                          {n.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowProfileMenu((prev) => !prev);
                setShowNotifMenu(false);
              }}
              className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl hover:bg-[#F4F5FF] pt-transition"
            >
              <Avatar name={user?.full_name || "Student"} src={user?.avatar_url} size="sm" />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-[#182044] leading-tight">
                  {user?.full_name || "Student"}
                </p>
                <p className="text-[10px] text-[#66708F] font-medium">
                  {user?.role || "STUDENT"}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#66708F]" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-xs font-bold text-[#182044] truncate">{user?.full_name}</p>
                  <p className="text-[11px] text-[#66708F] truncate">{user?.email}</p>
                  <div className="mt-1">
                    <Badge variant="purple">{user?.role || "STUDENT"}</Badge>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate("/profile");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#182044] hover:bg-[#F4F5FF]"
                >
                  <UserCircle className="w-4 h-4 text-[#6555F5]" /> My Profile
                </button>
                {(user?.role === "TPO" || user?.role === "ADMIN") && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate("/tpo");
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#182044] hover:bg-[#F4F5FF]"
                  >
                    <Building2 className="w-4 h-4 text-[#6555F5]" /> TPO Portal
                  </button>
                )}
                {user?.role === "ADMIN" && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate("/admin-portal");
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#182044] hover:bg-[#F4F5FF]"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#6555F5]" /> Admin Portal
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate("/settings");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#182044] hover:bg-[#F4F5FF]"
                >
                  <Settings className="w-4 h-4 text-[#6555F5]" /> Settings & Export
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setShowProfileMenu(false);
                    await logout();
                    navigate("/login");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#E55353] hover:bg-red-50 mt-1"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
