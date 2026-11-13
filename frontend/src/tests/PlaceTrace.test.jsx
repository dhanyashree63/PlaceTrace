import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ToastContext } from "../hooks/useToast";
import LoginPage from "../pages/auth/LoginPage";
import DashboardPage from "../pages/student/DashboardPage";
import JobsPage from "../pages/student/JobsPage";
import ProfilePage from "../pages/student/ProfilePage";
import SkillGapPage from "../pages/student/SkillGapPage";
import ApplicationsPage from "../pages/student/ApplicationsPage";
import { api } from "../services/api";

vi.mock("../services/api", () => ({
  api: {
    auth: {
      login: vi.fn(),
      notifications: vi.fn().mockResolvedValue([]),
      markNotificationsRead: vi.fn().mockResolvedValue({}),
    },
    analytics: {
      studentDashboard: vi.fn(),
    },
    jobs: {
      list: vi.fn(),
      bookmark: vi.fn(),
    },
    applications: {
      apply: vi.fn(),
      list: vi.fn(),
      update: vi.fn(),
    },
    students: {
      getMe: vi.fn(),
      addSkill: vi.fn(),
      removeSkill: vi.fn(),
      updateMe: vi.fn(),
    },
    projects: {
      list: vi.fn(),
    },
    ml: {
      skillGap: vi.fn(),
    },
    study: {
      updateRoadmapTopic: vi.fn(),
      updateTask: vi.fn(),
    },
  },
}));

const mockUser = {
  id: "u1",
  full_name: "Dhanyashree N",
  email: "dhanyashree@placetrace.edu",
  role: "STUDENT",
};

function renderWithProviders(ui, { user = mockUser, login = vi.fn() } = {}) {
  return render(
    <MemoryRouter>
      <ToastContext.Provider
        value={{ toasts: [], addToast: vi.fn(), removeToast: vi.fn() }}
      >
        <AuthContext.Provider
          value={{
            user,
            isAuthenticated: Boolean(user),
            loading: false,
            login,
            logout: vi.fn(),
          }}
        >
          {ui}
        </AuthContext.Provider>
      </ToastContext.Provider>
    </MemoryRouter>
  );
}

describe("PlaceTrace Frontend Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. Login Page renders and submits credentials", async () => {
    const mockLogin = vi.fn().mockResolvedValue(mockUser);
    renderWithProviders(<LoginPage />, { user: null, login: mockLogin });

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "dhanyashree@placetrace.edu" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "Student@12345" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "dhanyashree@placetrace.edu",
        password: "Student@12345",
        remember_me: true,
      });
    });
  });

  it("2. Dashboard renders real KPIs, roadmap, and upcoming tasks", async () => {
    api.analytics.studentDashboard.mockResolvedValue({
      profile: {
        full_name: "Dhanyashree N",
        cgpa: "9.35",
        branch: "CSE",
        readiness_score: 78,
        kpis: {
          readiness_score: 78,
          readiness_trend: 5,
          topics_completed: 4,
          total_topics: 8,
          mock_tests_count: 6,
          applications_count: 3,
        },
      },
      roadmap: [
        { id: 1, title: "Java Fundamentals", status: "COMPLETED" },
        { id: 2, title: "Full Stack Development", status: "IN_PROGRESS" },
      ],
      upcoming_tasks: [
        {
          id: 10,
          title: "DSA Practice",
          scheduled_date: "2026-11-13",
          scheduled_time: "7:00 PM",
          priority: "HIGH",
          status: "PENDING",
        },
      ],
      recommended_jobs: [],
    });

    renderWithProviders(<DashboardPage />);
    expect(await screen.findByText("78%")).toBeInTheDocument();
    expect(screen.getByText("Java Fundamentals")).toBeInTheDocument();
    expect(screen.getByText("DSA Practice")).toBeInTheDocument();
  });

  it("3. Job Search & Job Application work through backend APIs", async () => {
    api.jobs.list.mockResolvedValue({
      results: [
        {
          id: 101,
          company_name: "Oracle",
          title: "Software Development Engineer",
          location: "Bengaluru",
          employment_type: "Full Time",
          ctc_lpa: "19.50",
          eligibility: { is_eligible: true },
          match_data: { match_percentage: 82 },
          has_applied: false,
        },
      ],
      count: 1,
      total_pages: 1,
      current_page: 1,
    });
    api.applications.apply.mockResolvedValue({ id: 501 });

    renderWithProviders(<JobsPage />);
    expect(
      await screen.findByText("Software Development Engineer")
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Apply Now/i }));
    await waitFor(() => {
      expect(api.applications.apply).toHaveBeenCalledWith({ job: 101 });
    });
  });

  it("4. Student Profile renders skills, projects, and activity tabs", async () => {
    api.students.getMe.mockResolvedValue({
      full_name: "Dhanyashree N",
      usn: "1RN23CS042",
      college_name: "RNSIT",
      branch: "CSE",
      cgpa: "9.35",
      kpis: { topics_completed: 4, mock_tests_count: 6, projects_count: 1 },
      student_skills: [
        { id: 1, skill_name: "Java", category: "PROGRAMMING", proficiency: "EXPERT" },
      ],
      activities: [],
    });
    api.projects.list.mockResolvedValue([
      {
        id: 1,
        title: "PlaceTrace",
        description: "Placement platform",
        technologies: ["React", "Django"],
        status: "COMPLETED",
      },
    ]);

    renderWithProviders(<ProfilePage />);
    expect(await screen.findByText("Dhanyashree N")).toBeInTheDocument();
    expect(screen.getByText("Java")).toBeInTheDocument();
  });

  it("5. Skill Gap Page displays You Have, You Need, and High Priority skills", async () => {
    api.jobs.list.mockResolvedValue([
      { id: 101, company_name: "Oracle", title: "SDE", location: "Bengaluru", ctc_lpa: "19.50" },
    ]);
    api.ml.skillGap.mockResolvedValue({
      job: { id: 101, company_name: "Oracle", title: "SDE" },
      match_percentage: 82,
      required_skills: ["Java", "SQL", "Docker"],
      your_skills: ["Java", "SQL"],
      you_have: ["Java", "SQL"],
      you_need: ["Docker"],
      high_priority: ["Docker"],
      action_plan: ["Master Docker"],
    });

    renderWithProviders(<SkillGapPage />);
    expect(await screen.findByText("You Have")).toBeInTheDocument();
    expect(screen.getByText("You Need")).toBeInTheDocument();
    expect(screen.getByText("High Priority")).toBeInTheDocument();
  });

  it("6. Applications Tracker lists applications and opens timeline detail modal", async () => {
    api.applications.list.mockResolvedValue([
      {
        id: 201,
        company_name: "Oracle",
        job_title: "Software Development Engineer",
        applied_at: "2026-11-12T10:00:00Z",
        stage: "TECHNICAL_INTERVIEW",
        status_label: "Technical Interview",
        match_score: 82,
        notes: "Cleared coding round",
        timeline: [
          { id: 1, stage_name: "Applied", state: "COMPLETED" },
          { id: 2, stage_name: "Technical Interview", state: "CURRENT" },
        ],
      },
    ]);

    renderWithProviders(<ApplicationsPage />);
    expect(await screen.findByText("Oracle")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Oracle"));
    expect(
      await screen.findByText("Interview & Selection Timeline")
    ).toBeInTheDocument();
  });
});
