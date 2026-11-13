import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "../../layouts/AppLayout";
import {
  JobCard,
  SearchBar,
  FilterButton,
  Pagination,
  EmptyState,
  LoadingState,
  ErrorState,
  Card,
} from "../../components/ui";
import { api } from "../../services/api";
import { useDebounce } from "../../hooks/useDebounce";
import { useToast } from "../../hooks/useToast";

const CATEGORIES = [
  { key: "ALL", label: "All" },
  { key: "SOFTWARE_DEVELOPMENT", label: "Software Development" },
  { key: "DATA_SCIENCE", label: "Data Science" },
  { key: "PRODUCT", label: "Product" },
  { key: "ANALYTICS", label: "Analytics" },
  { key: "OTHER", label: "Other" },
];

export default function JobsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(search, 250);
  const [category, setCategory] = useState("ALL");
  const [showFilters, setShowFilters] = useState(false);
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);
  const [locationFilter, setLocationFilter] = useState("");
  const [page, setPage] = useState(1);

  const [jobsPayload, setJobsPayload] = useState({
    results: [],
    count: 0,
    total_pages: 1,
    current_page: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
      if (category !== "ALL") params.set("category", category);
      if (eligibleOnly) params.set("eligible_only", "true");
      if (savedOnly) params.set("saved_only", "true");
      if (locationFilter.trim()) params.set("location", locationFilter.trim());
      params.set("page", String(page));

      const data = await api.jobs.list(`?${params.toString()}`);
      if (Array.isArray(data)) {
        setJobsPayload({
          results: data,
          count: data.length,
          total_pages: 1,
          current_page: 1,
        });
      } else {
        setJobsPayload({
          results: data.results || [],
          count: data.count || 0,
          total_pages: data.total_pages || 1,
          current_page: data.current_page || 1,
        });
      }
    } catch (err) {
      setError(err.message || "Failed to fetch job opportunities.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category, eligibleOnly, savedOnly, locationFilter, page]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleApply = async (job) => {
    try {
      await api.applications.apply({ job: job.id });
      addToast(`Application submitted to ${job.company_name}!`, "success");
      fetchJobs();
    } catch (err) {
      addToast(err.message || "Failed to apply.", "error");
    }
  };

  const handleBookmark = async (jobId) => {
    try {
      const res = await api.jobs.bookmark(jobId);
      addToast(res.detail, "success");
      fetchJobs();
    } catch (err) {
      addToast(err.message || "Could not update bookmark.", "error");
    }
  };

  return (
    <AppLayout
      title="Job Opportunities"
      subtitle="Explore the latest placement opportunities"
    >
      <div className="space-y-5">
        {/* Search + Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <SearchBar
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            placeholder="Search companies, roles, skills, locations..."
          />
          <FilterButton
            active={showFilters || eligibleOnly || savedOnly || Boolean(locationFilter)}
            onClick={() => setShowFilters((prev) => !prev)}
            label="Filter"
          />
        </div>

        {/* Expandable Advanced Filters */}
        {showFilters && (
          <Card className="p-4 flex flex-wrap items-center gap-4 bg-white">
            <label className="inline-flex items-center gap-2 text-xs font-medium text-[#182044] cursor-pointer">
              <input
                type="checkbox"
                checked={eligibleOnly}
                onChange={(e) => {
                  setEligibleOnly(e.target.checked);
                  setPage(1);
                }}
                className="rounded text-[#6555F5] focus:ring-[#6555F5]"
              />
              <span>Eligible Only</span>
            </label>

            <label className="inline-flex items-center gap-2 text-xs font-medium text-[#182044] cursor-pointer">
              <input
                type="checkbox"
                checked={savedOnly}
                onChange={(e) => {
                  setSavedOnly(e.target.checked);
                  setPage(1);
                }}
                className="rounded text-[#6555F5] focus:ring-[#6555F5]"
              />
              <span>Bookmarked Jobs</span>
            </label>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[#66708F]">Location:</span>
              <input
                type="text"
                value={locationFilter}
                onChange={(e) => {
                  setLocationFilter(e.target.value);
                  setPage(1);
                }}
                placeholder="e.g. Bengaluru"
                className="px-3 py-1 rounded-lg border border-slate-200 text-xs"
              />
            </div>
          </Card>
        )}

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => {
            const isActive = category === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => {
                  setCategory(cat.key);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap pt-transition ${
                  isActive
                    ? "bg-[#6555F5] text-white shadow-nav"
                    : "bg-white text-[#66708F] hover:text-[#182044] border border-slate-200/80"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Job Cards Grid */}
        {loading ? (
          <LoadingState message="Fetching placement opportunities..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchJobs} />
        ) : jobsPayload.results.length === 0 ? (
          <EmptyState
            title="No matching job opportunities found"
            description="Try clearing your search query or switching category filters."
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobsPayload.results.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onViewDetail={(j) => navigate(`/jobs/${j.id}`)}
                  onApply={handleApply}
                  onBookmark={handleBookmark}
                />
              ))}
            </div>
            <Pagination
              currentPage={jobsPayload.current_page}
              totalPages={jobsPayload.total_pages}
              onPageChange={(p) => setPage(p)}
            />
          </>
        )}
      </div>
    </AppLayout>
  );
}
