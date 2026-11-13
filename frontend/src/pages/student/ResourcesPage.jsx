import React, { useState, useEffect, useCallback } from "react";
import { BookOpen, ExternalLink } from "lucide-react";
import { AppLayout } from "../../layouts/AppLayout";
import {
  Card,
  Badge,
  SearchBar,
  EmptyState,
  LoadingState,
  ErrorState,
} from "../../components/ui";
import { api } from "../../services/api";

const RESOURCE_CATEGORIES = [
  "All",
  "Java",
  "DSA",
  "SQL",
  "Web Development",
  "Python",
  "DBMS",
  "Operating Systems",
  "Computer Networks",
  "Aptitude",
  "Interview Preparation",
];

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadResources = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.resources.list();
      setResources(Array.isArray(data) ? data : data?.results || []);
    } catch (err) {
      setError(err.message || "Failed to load learning resources.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const filtered = resources.filter((r) => {
    const matchesCat = category === "All" || r.category === category;
    const matchesSearch =
      !search.trim() ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  if (loading) {
    return (
      <AppLayout title="Learning Resources">
        <LoadingState message="Loading curated placement preparation resources..." />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Learning Resources">
        <ErrorState message={error} onRetry={loadResources} />
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Curated Learning Resources"
      subtitle="Handbooks, practice sheets, and interview guides organized by technical subject"
    >
      <div className="space-y-5">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search resources by topic, title, or keyword..."
        />

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {RESOURCE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap pt-transition ${
                category === cat
                  ? "bg-[#6555F5] text-white shadow-nav"
                  : "bg-white text-[#66708F] hover:text-[#182044] border border-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="No resources match your filter"
            description="Try selecting 'All' categories or clearing your search."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((res) => (
              <Card key={res.id} className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <Badge variant="purple">{res.category}</Badge>
                    <Badge variant="neutral">{res.difficulty}</Badge>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#EEEAFE] text-[#6555F5] flex items-center justify-center shrink-0 mt-0.5">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#182044]">
                        {res.title}
                      </h3>
                      <p className="text-[11px] font-medium text-[#6555F5]">
                        {res.resource_type}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-[#66708F] mt-2.5 leading-relaxed">
                    {res.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                  <a
                    href={res.external_link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6555F5] hover:text-[#7C5CFF]"
                  >
                    <span>Open Resource</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
