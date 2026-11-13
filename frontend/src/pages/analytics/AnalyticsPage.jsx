import React, { useState, useEffect, useCallback } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Users,
  Briefcase,
  Award,
  TrendingUp,
  Building2,
  ClipboardList,
} from "lucide-react";
import { AppLayout } from "../../layouts/AppLayout";
import { Card, KpiCard, LoadingState, ErrorState } from "../../components/ui";
import { api } from "../../services/api";

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.analytics.platform();
      setData(res);
    } catch (err) {
      setError(err.message || "Failed to load placement analytics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (loading) {
    return (
      <AppLayout title="Placement Analytics">
        <LoadingState message="Loading live PostgreSQL placement analytics..." />
      </AppLayout>
    );
  }

  if (error || !data) {
    return (
      <AppLayout title="Placement Analytics">
        <ErrorState message={error} onRetry={loadAnalytics} />
      </AppLayout>
    );
  }

  const kpis = data.kpis || {};
  const charts = data.charts || {};

  return (
    <AppLayout
      title="Placement Intelligence & Analytics"
      subtitle="Real-time visualizations of placement trends, branch outcomes, skill demand, and selection funnels"
    >
      <div className="space-y-6">
        {/* Top KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <KpiCard
            icon={Users}
            label="Total Students"
            value={kpis.total_students ?? 0}
            accent="purple"
          />
          <KpiCard
            icon={Briefcase}
            label="Active Jobs"
            value={kpis.active_jobs ?? 0}
            accent="blue"
          />
          <KpiCard
            icon={ClipboardList}
            label="Applications"
            value={kpis.applications ?? 0}
            accent="purple"
          />
          <KpiCard
            icon={Award}
            label="Placed Students"
            value={kpis.placed_students ?? 0}
            accent="green"
          />
          <KpiCard
            icon={TrendingUp}
            label="Placement Rate"
            value={`${kpis.placement_rate ?? 0}%`}
            accent="amber"
          />
          <KpiCard
            icon={Building2}
            label="Companies"
            value={kpis.companies ?? 0}
            accent="blue"
          />
        </div>

        {/* 9 Recharts Visualizations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Placement Trend */}
          <Card>
            <h3 className="text-sm font-bold text-[#182044] mb-1">
              1. Placement Trend Over Time
            </h3>
            <p className="text-xs text-[#66708F] mb-4">
              Monthly cumulative offers and placements
            </p>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.placement_trend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F8" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#66708F" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#66708F" }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="placed"
                    name="Placed Students"
                    stroke="#6555F5"
                    fill="#EEEAFE"
                    strokeWidth={2.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Chart 2: Applications Over Time */}
          <Card>
            <h3 className="text-sm font-bold text-[#182044] mb-1">
              2. Applications Over Time
            </h3>
            <p className="text-xs text-[#66708F] mb-4">
              Monthly student job application velocity
            </p>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.applications_over_time || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F8" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#66708F" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#66708F" }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="applications"
                    name="Applications"
                    stroke="#7C5CFF"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#6555F5" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Chart 3: Branch-Wise Placement */}
          <Card>
            <h3 className="text-sm font-bold text-[#182044] mb-1">
              3. Branch-Wise Placement
            </h3>
            <p className="text-xs text-[#66708F] mb-4">
              Total students vs placed students per department
            </p>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.branch_wise_placement || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F8" />
                  <XAxis dataKey="branch" tick={{ fontSize: 11, fill: "#66708F" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#66708F" }} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="total"
                    name="Total Students"
                    fill="#CBD0E6"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="placed"
                    name="Placed"
                    fill="#6555F5"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Chart 4: Company-Wise Selection */}
          <Card>
            <h3 className="text-sm font-bold text-[#182044] mb-1">
              4. Company-Wise Selection
            </h3>
            <p className="text-xs text-[#66708F] mb-4">
              Applications vs final selections across recruiting partners
            </p>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.company_wise_selection || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F8" />
                  <XAxis dataKey="company" tick={{ fontSize: 11, fill: "#66708F" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#66708F" }} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="applications"
                    name="Applications"
                    fill="#7C5CFF"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="selections"
                    name="Selections"
                    fill="#32B67A"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Chart 5: Skill Demand */}
          <Card>
            <h3 className="text-sm font-bold text-[#182044] mb-1">
              5. Top Demanded Skills Across Jobs
            </h3>
            <p className="text-xs text-[#66708F] mb-4">
              Frequency of skills required by active placement drives
            </p>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={charts.skill_demand || []}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F8" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#66708F" }} />
                  <YAxis
                    type="category"
                    dataKey="skill"
                    width={90}
                    tick={{ fontSize: 11, fill: "#182044" }}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="jobs"
                    name="Jobs Requiring Skill"
                    fill="#6555F5"
                    radius={[0, 6, 6, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Chart 6: Missing Skills Across Cohort */}
          <Card>
            <h3 className="text-sm font-bold text-[#182044] mb-1">
              6. Cohort Missing Skills Gap (%)
            </h3>
            <p className="text-xs text-[#66708F] mb-4">
              Percentage of students missing high-demand skills
            </p>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.missing_skills || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F8" />
                  <XAxis dataKey="skill" tick={{ fontSize: 11, fill: "#66708F" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#66708F" }} />
                  <Tooltip />
                  <Bar
                    dataKey="gap_percentage"
                    name="Skill Gap (%)"
                    fill="#F4B942"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Chart 7: Application Stages Funnel */}
          <Card>
            <h3 className="text-sm font-bold text-[#182044] mb-1">
              7. Application Stages Breakdown
            </h3>
            <p className="text-xs text-[#66708F] mb-4">
              Distribution of applications across recruitment stages
            </p>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.application_stages || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F8" />
                  <XAxis dataKey="stage" tick={{ fontSize: 10, fill: "#66708F" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#66708F" }} />
                  <Tooltip />
                  <Bar
                    dataKey="count"
                    name="Applications"
                    fill="#6555F5"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Chart 8: CGPA Distribution */}
          <Card>
            <h3 className="text-sm font-bold text-[#182044] mb-1">
              8. Student CGPA Distribution
            </h3>
            <p className="text-xs text-[#66708F] mb-4">
              Academic standing across the registered student cohort
            </p>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.cgpa_distribution || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F8" />
                  <XAxis dataKey="range" tick={{ fontSize: 11, fill: "#66708F" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#66708F" }} />
                  <Tooltip />
                  <Bar
                    dataKey="students"
                    name="Students"
                    fill="#7C5CFF"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Chart 9: Overall Placement Rate Distribution */}
        <Card>
          <h3 className="text-sm font-bold text-[#182044] mb-1">
            9. Overall Placement Rate Breakdown
          </h3>
          <p className="text-xs text-[#66708F] mb-4">
            Proportion of placed, internship, and actively preparing students
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.placement_rate || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={50}
                  paddingAngle={4}
                >
                  {(charts.placement_rate || []).map((entry, index) => (
                    <Cell key={index} fill={entry.color || "#6555F5"} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
