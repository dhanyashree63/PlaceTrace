import React, { useState, useEffect, useCallback } from "react";
import {
  Award,
  CheckCircle2,
  Play,
  Trophy,
  BarChart2,
  Clock,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { AppLayout } from "../../layouts/AppLayout";
import {
  Card,
  KpiCard,
  Button,
  Badge,
  Modal,
  LoadingState,
  ErrorState,
} from "../../components/ui";
import { api } from "../../services/api";
import { useToast } from "../../hooks/useToast";
import { formatShortDate } from "../../utils/formatters";

const QUIZ_CATEGORIES = [
  "All",
  "Java",
  "DSA",
  "SQL",
  "Computer Networks",
  "Operating Systems",
  "DBMS",
  "Aptitude",
  "Web Development",
  "Python",
  "System Design",
];

export default function PracticeQuizzesPage() {
  const { addToast } = useToast();
  const [quizzes, setQuizzes] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Active Quiz Session state
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadQuizData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [quizList, dashData] = await Promise.all([
        api.quizzes.list(),
        api.quizzes.dashboard(),
      ]);
      setQuizzes(Array.isArray(quizList) ? quizList : quizList?.results || []);
      setDashboard(dashData);
    } catch (err) {
      setError(err.message || "Failed to load practice quizzes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuizData();
  }, [loadQuizData]);

  const startQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setAnswers({});
    setQuizResult(null);
  };

  const handleSubmitQuiz = async (e) => {
    e.preventDefault();
    if (!activeQuiz) return;
    setSubmitting(true);
    try {
      const res = await api.quizzes.submit(activeQuiz.id, answers);
      setQuizResult(res);
      addToast(
        `Quiz completed! You scored ${res.attempt.percentage}%`,
        "success"
      );
      loadQuizData();
    } catch (err) {
      addToast(err.message || "Failed to submit quiz.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout title="Practice & Quizzes">
        <LoadingState message="Loading mock test dashboard and practice sets..." />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Practice & Quizzes">
        <ErrorState message={error} onRetry={loadQuizData} />
      </AppLayout>
    );
  }

  const filteredQuizzes =
    selectedCategory === "All"
      ? quizzes
      : quizzes.filter((q) => q.category === selectedCategory);

  return (
    <AppLayout
      title="Practice & Mock Test Dashboard"
      subtitle="Sharpen your technical skills with MCQs, coding practice, and full mock assessments"
    >
      <div className="space-y-6">
        {/* Mock Test Dashboard KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={BarChart2}
            label="Total Tests"
            value={dashboard?.total_tests ?? quizzes.length}
            sublabel="Available practice sets"
            accent="purple"
          />
          <KpiCard
            icon={CheckCircle2}
            label="Completed"
            value={dashboard?.completed_tests ?? 0}
            sublabel="Total attempts recorded"
            accent="green"
          />
          <KpiCard
            icon={Award}
            label="Average Score"
            value={`${dashboard?.average_score ?? 0}%`}
            sublabel="Across all completed tests"
            accent="blue"
          />
          <KpiCard
            icon={Trophy}
            label="Best Score"
            value={`${dashboard?.best_score ?? 0}%`}
            sublabel="Personal high score"
            accent="amber"
          />
        </div>

        {/* Topic-Wise Performance Chart + Attempt History */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-7">
            <h3 className="text-base font-bold text-[#182044] mb-1">
              Topic-Wise Performance
            </h3>
            <p className="text-xs text-[#66708F] mb-4">
              Real average scores from your PostgreSQL quiz attempts
            </p>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboard?.topic_performance || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F8" />
                  <XAxis dataKey="topic" tick={{ fontSize: 11, fill: "#66708F" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#66708F" }} />
                  <Tooltip />
                  <Bar
                    dataKey="average_score"
                    name="Avg Score (%)"
                    fill="#6555F5"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="lg:col-span-5">
            <h3 className="text-base font-bold text-[#182044] mb-3">
              Recent Attempt History
            </h3>
            <div className="space-y-2.5 max-h-60 overflow-y-auto">
              {(dashboard?.recent_attempts || []).map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#F4F5FF] text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-[#182044] truncate">
                      {att.quiz_title}
                    </p>
                    <p className="text-[11px] text-[#66708F]">
                      {att.category} • {formatShortDate(att.attempted_at)}
                    </p>
                  </div>
                  <Badge variant={att.percentage >= 80 ? "success" : "purple"}>
                    {att.percentage}%
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {QUIZ_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap pt-transition ${
                selectedCategory === cat
                  ? "bg-[#6555F5] text-white shadow-nav"
                  : "bg-white text-[#66708F] hover:text-[#182044] border border-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Quizzes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuizzes.map((quiz) => (
            <Card key={quiz.id} className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="purple">{quiz.category}</Badge>
                  <Badge variant="neutral">{quiz.difficulty}</Badge>
                </div>
                <h4 className="text-sm font-bold text-[#182044]">
                  {quiz.title}
                </h4>
                <p className="text-xs text-[#66708F] mt-1.5 line-clamp-2">
                  {quiz.description}
                </p>
                <div className="flex items-center gap-3 mt-3 text-xs text-[#66708F]">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#6555F5]" />
                    {quiz.duration_minutes} mins
                  </span>
                  <span>• {quiz.questions_count} Questions</span>
                  {quiz.best_percentage !== null &&
                    quiz.best_percentage !== undefined && (
                      <span className="font-semibold text-[#32B67A]">
                        Best: {quiz.best_percentage}%
                      </span>
                    )}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                <Button size="sm" onClick={() => startQuiz(quiz)}>
                  <Play className="w-3.5 h-3.5" />
                  <span>
                    {quiz.quiz_type === "MOCK_TEST"
                      ? "Take Test"
                      : "Start Practice"}
                  </span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Interactive Quiz Runner Modal */}
      <Modal
        isOpen={Boolean(activeQuiz)}
        onClose={() => setActiveQuiz(null)}
        title={activeQuiz ? `${activeQuiz.title} (${activeQuiz.category})` : ""}
        maxWidth="max-w-2xl"
      >
        {activeQuiz && (
          <div className="space-y-5 text-xs">
            {quizResult ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#EEEAFE] text-center">
                  <p className="text-xs font-semibold text-[#66708F]">
                    Assessment Score
                  </p>
                  <p className="text-3xl font-extrabold text-[#6555F5] mt-1">
                    {quizResult.attempt.percentage}%
                  </p>
                  <p className="text-xs text-[#182044] mt-1">
                    {quizResult.attempt.score} / {quizResult.attempt.total_questions}{" "}
                    correct answers
                  </p>
                </div>

                <div className="space-y-3">
                  {activeQuiz.questions?.map((q, idx) => {
                    const fb = quizResult.feedback?.find(
                      (f) => f.question_id === q.id
                    );
                    return (
                      <div
                        key={q.id}
                        className={`p-3.5 rounded-xl border ${
                          fb?.is_correct
                            ? "bg-emerald-50/50 border-emerald-200"
                            : "bg-red-50/50 border-red-200"
                        }`}
                      >
                        <p className="font-bold text-[#182044]">
                          {idx + 1}. {q.prompt}
                        </p>
                        <p className="mt-1 font-semibold text-[#32B67A]">
                          Correct Answer: {q.options[q.correct_index]}
                        </p>
                        {q.explanation && (
                          <p className="mt-1 text-[#66708F]">{q.explanation}</p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => setActiveQuiz(null)}>Done</Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitQuiz} className="space-y-4">
                {(activeQuiz.questions || []).map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl bg-[#F4F5FF] space-y-2.5"
                  >
                    <p className="font-bold text-[#182044] text-sm">
                      {idx + 1}. {q.prompt}
                    </p>
                    <div className="space-y-2">
                      {(q.options || []).map((opt, optIdx) => (
                        <label
                          key={optIdx}
                          className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer pt-transition ${
                            answers[q.id] === optIdx
                              ? "bg-[#EEEAFE] border-[#6555F5] text-[#182044] font-semibold"
                              : "bg-white border-slate-200 text-[#66708F]"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            checked={answers[q.id] === optIdx}
                            onChange={() =>
                              setAnswers({ ...answers, [q.id]: optIdx })
                            }
                            className="text-[#6555F5]"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setActiveQuiz(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Test"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
