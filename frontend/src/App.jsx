import React from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import { ToastContext, useToastState } from "./hooks/useToast";
import {
  ToastContainer,
  LoadingState,
  Card,
  Button,
} from "./components/ui";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

import DashboardPage from "./pages/student/DashboardPage";
import JobsPage from "./pages/student/JobsPage";
import JobDetailPage from "./pages/student/JobDetailPage";
import ProfilePage from "./pages/student/ProfilePage";
import StudyPlannerPage from "./pages/student/StudyPlannerPage";
import PracticeQuizzesPage from "./pages/student/PracticeQuizzesPage";
import ProjectsPage from "./pages/student/ProjectsPage";
import ResourcesPage from "./pages/student/ResourcesPage";
import ResumePage from "./pages/student/ResumePage";
import SkillGapPage from "./pages/student/SkillGapPage";
import ApplicationsPage from "./pages/student/ApplicationsPage";
import SettingsPage from "./pages/student/SettingsPage";

import TpoDashboardPage from "./pages/tpo/TpoDashboardPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AnalyticsPage from "./pages/analytics/AnalyticsPage";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F5FF] flex items-center justify-center">
        <LoadingState message="Verifying authentication..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return (
      <div className="min-h-screen bg-[#F4F5FF] flex items-center justify-center p-4">
        <Card className="max-w-md text-center space-y-3">
          <h2 className="text-lg font-extrabold text-[#182044]">
            403 — Forbidden Access
          </h2>
          <p className="text-xs text-[#66708F]">
            Your account role ({user?.role}) does not have permission to view
            this portal.
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            Return to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return children;
}

function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#F4F5FF] flex items-center justify-center p-4">
      <Card className="max-w-md text-center space-y-3">
        <h1 className="text-2xl font-extrabold text-[#6555F5]">404</h1>
        <h2 className="text-base font-bold text-[#182044]">Page Not Found</h2>
        <p className="text-xs text-[#66708F]">
          The PlaceTrace page you requested does not exist or has moved.
        </p>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </Card>
    </div>
  );
}

export default function App() {
  const toastState = useToastState();

  return (
    <ToastContext.Provider value={toastState}>
      <AuthProvider>
        <Routes>
          {/* Public & Auth Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Authenticated Student & Shared Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs"
            element={
              <ProtectedRoute>
                <JobsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs/:id"
            element={
              <ProtectedRoute>
                <JobDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/study-planner"
            element={
              <ProtectedRoute>
                <StudyPlannerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice"
            element={
              <ProtectedRoute>
                <PracticeQuizzesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <ProjectsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resources"
            element={
              <ProtectedRoute>
                <ResourcesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resume"
            element={
              <ProtectedRoute>
                <ResumePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/skill-gap"
            element={
              <ProtectedRoute>
                <SkillGapPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications"
            element={
              <ProtectedRoute>
                <ApplicationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Role-Gated Portals */}
          <Route
            path="/tpo"
            element={
              <ProtectedRoute allowedRoles={["TPO", "ADMIN"]}>
                <TpoDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-portal"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* 404 Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        <ToastContainer
          toasts={toastState.toasts}
          onRemove={toastState.removeToast}
        />
      </AuthProvider>
    </ToastContext.Provider>
  );
}
