import React from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  MapPin,
  Briefcase,
  Search,
  SlidersHorizontal,
  X,
  AlertCircle,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Bookmark,
} from "lucide-react";
import { getInitials, formatShortDate } from "../../utils/formatters";

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  type = "button",
  onClick,
  ...rest
}) {
  const variants = {
    primary:
      "bg-[#6555F5] hover:bg-[#7C5CFF] text-white shadow-sm hover:shadow-md active:scale-[0.99]",
    secondary:
      "bg-[#EEEAFE] hover:bg-[#E2DCFE] text-[#6555F5] font-medium",
    outline:
      "border border-slate-200 bg-white hover:bg-[#F4F5FF] text-[#182044]",
    danger:
      "bg-[#E55353] hover:bg-red-600 text-white shadow-sm",
    ghost:
      "bg-transparent hover:bg-slate-100 text-[#66708F] hover:text-[#182044]",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-lg",
    md: "px-4 py-2 text-sm rounded-xl",
    lg: "px-5 py-2.5 text-sm rounded-xl",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 font-medium pt-transition disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Card({ children, className = "", hover = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-card border border-slate-100/80 p-5 ${
        hover ? "pt-transition hover:shadow-hover cursor-pointer" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function Badge({ children, variant = "purple", className = "" }) {
  const styles = {
    purple: "bg-[#EEEAFE] text-[#6555F5]",
    success: "bg-emerald-50 text-[#32B67A]",
    warning: "bg-amber-50 text-[#D99B1E]",
    error: "bg-red-50 text-[#E55353]",
    neutral: "bg-slate-100 text-[#66708F]",
    navy: "bg-[#172044] text-white",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
        styles[variant] || styles.purple
      } ${className}`}
    >
      {children}
    </span>
  );
}

export function SkillChip({
  name,
  proficiency,
  variant = "default",
  onRemove,
  onClick,
}) {
  const variants = {
    default: "bg-[#F4F5FF] text-[#182044] border border-indigo-100/80 hover:border-[#6555F5]/40",
    have: "bg-emerald-50 text-[#228B59] border border-emerald-200",
    need: "bg-[#EEEAFE] text-[#6555F5] border border-indigo-200",
    priority: "bg-amber-50 text-amber-800 border border-amber-300",
  };
  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium pt-transition ${
        variants[variant] || variants.default
      } ${onClick ? "cursor-pointer" : ""}`}
    >
      <span>{name}</span>
      {proficiency && (
        <span className="text-[10px] opacity-70 font-normal">• {proficiency}</span>
      )}
      {onRemove && (
        <button
          type="button"
          aria-label={`Remove ${name}`}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 text-slate-400 hover:text-[#E55353]"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}

export function Avatar({ name = "User", src = "", size = "md", color = "#6555F5" }) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-lg",
    xl: "w-20 h-20 text-2xl",
  };
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizes[size] || sizes.md} rounded-full object-cover border-2 border-[#EEEAFE]`}
      />
    );
  }
  return (
    <div
      style={{ backgroundColor: color }}
      className={`${
        sizes[size] || sizes.md
      } rounded-full text-white font-semibold flex items-center justify-center shrink-0 shadow-sm`}
    >
      {getInitials(name)}
    </div>
  );
}

export function KpiCard({ icon: Icon, label, value, trend, sublabel, accent = "purple", onClick }) {
  const accents = {
    purple: "bg-[#EEEAFE] text-[#6555F5]",
    green: "bg-emerald-50 text-[#32B67A]",
    amber: "bg-amber-50 text-[#F4B942]",
    blue: "bg-blue-50 text-blue-600",
  };
  return (
    <Card hover={Boolean(onClick)} onClick={onClick} className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-[#66708F] mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-[#182044]">{value}</span>
          {trend !== undefined && trend !== null && (
            <span className="inline-flex items-center text-xs font-semibold text-[#32B67A]">
              <TrendingUp className="w-3 h-3 mr-0.5" />
              {typeof trend === "number" && trend > 0 ? `+${trend}` : trend}
            </span>
          )}
        </div>
        {sublabel && <p className="text-[11px] text-[#66708F] mt-0.5">{sublabel}</p>}
      </div>
      {Icon && (
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
            accents[accent] || accents.purple
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
      )}
    </Card>
  );
}

export function ProgressBar({ value = 0, color = "#6555F5", height = "h-2" }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${height}`}>
      <div
        style={{ width: `${pct}%`, backgroundColor: color }}
        className="h-full rounded-full pt-transition"
      />
    </div>
  );
}

export function Roadmap({ items = [], onToggleStatus, onViewAll }) {
  const nextStatus = {
    NOT_STARTED: "IN_PROGRESS",
    IN_PROGRESS: "COMPLETED",
    COMPLETED: "NOT_STARTED",
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-[#182044]">Your Placement Roadmap</h3>
          <p className="text-xs text-[#66708F]">Click any stage to update your live progress</p>
        </div>
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-semibold text-[#6555F5] hover:text-[#7C5CFF]"
          >
            View All →
          </button>
        )}
      </div>

      <div className="relative pl-3 space-y-4">
        <div className="absolute left-[23px] top-3 bottom-3 w-0.5 bg-slate-200" />
        {items.map((item, idx) => {
          const isCompleted = item.status === "COMPLETED";
          const isCurrent = item.status === "IN_PROGRESS";
          return (
            <div
              key={item.id || idx}
              onClick={() =>
                onToggleStatus && onToggleStatus(item.id, nextStatus[item.status] || "COMPLETED")
              }
              className={`relative flex items-start gap-3.5 p-2.5 rounded-xl pt-transition ${
                onToggleStatus ? "cursor-pointer hover:bg-[#F4F5FF]" : ""
              }`}
            >
              <div
                className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                  isCompleted
                    ? "bg-[#32B67A] text-white"
                    : isCurrent
                    ? "bg-[#6555F5] text-white ring-4 ring-[#EEEAFE]"
                    : "bg-white border-2 border-slate-300 text-[#66708F]"
                }`}
              >
                {isCompleted ? "✓" : idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[#182044] truncate">
                    {item.title}
                  </p>
                  <Badge
                    variant={
                      isCompleted ? "success" : isCurrent ? "purple" : "neutral"
                    }
                  >
                    {isCompleted
                      ? "Completed"
                      : isCurrent
                      ? "In Progress"
                      : "Upcoming"}
                  </Badge>
                </div>
                {item.description && (
                  <p className="text-xs text-[#66708F] mt-0.5 line-clamp-1">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function TaskCard({ task, onToggleComplete }) {
  const isDone = task.status === "COMPLETED";
  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#F4F5FF]/70 hover:bg-[#F4F5FF] border border-indigo-100/60 pt-transition">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          aria-label={`Mark ${task.title} complete`}
          onClick={() =>
            onToggleComplete &&
            onToggleComplete(task.id, isDone ? "PENDING" : "COMPLETED")
          }
          className="text-[#6555F5] hover:scale-110 pt-transition shrink-0"
        >
          {isDone ? (
            <CheckCircle2 className="w-5 h-5 text-[#32B67A]" />
          ) : (
            <Circle className="w-5 h-5 text-[#6555F5]" />
          )}
        </button>
        <div className="min-w-0">
          <p
            className={`text-sm font-semibold truncate ${
              isDone ? "line-through text-[#66708F]" : "text-[#182044]"
            }`}
          >
            {task.title}
          </p>
          <p className="text-xs text-[#66708F]">
            {formatShortDate(task.scheduled_date)} • {task.scheduled_time}
          </p>
        </div>
      </div>
      <Badge
        variant={
          task.priority === "HIGH"
            ? "error"
            : task.priority === "MEDIUM"
            ? "purple"
            : "neutral"
        }
      >
        {task.category || task.priority}
      </Badge>
    </div>
  );
}

export function JobCard({ job, onViewDetail, onApply, onBookmark }) {
  const isEligible = job.eligibility?.is_eligible ?? true;
  const matchPct = job.match_data?.match_percentage ?? 82;

  return (
    <Card className="flex flex-col justify-between hover:shadow-hover pt-transition">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              style={{ backgroundColor: job.company_logo_color || "#6555F5" }}
              className="w-11 h-11 rounded-xl text-white font-bold text-base flex items-center justify-center shrink-0 shadow-sm"
            >
              {getInitials(job.company_name)}
            </div>
            <div>
              <p className="text-xs font-semibold text-[#66708F]">
                {job.company_name}
              </p>
              <h4
                onClick={() => onViewDetail && onViewDetail(job)}
                className="text-sm font-bold text-[#182044] hover:text-[#6555F5] cursor-pointer"
              >
                {job.title}
              </h4>
            </div>
          </div>
          {onBookmark && (
            <button
              type="button"
              aria-label="Bookmark job"
              onClick={() => onBookmark(job.id)}
              className={`p-1.5 rounded-lg pt-transition ${
                job.is_saved
                  ? "bg-[#EEEAFE] text-[#6555F5]"
                  : "text-slate-400 hover:bg-slate-100"
              }`}
            >
              <Bookmark className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-[#66708F]">
          <span className="inline-flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#6555F5]" />
            {job.location}
          </span>
          <span className="inline-flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5 text-[#6555F5]" />
            {job.employment_type}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {job.posted_ago || "Recently"}
          </span>
          {job.ctc_lpa && (
            <span className="font-semibold text-[#182044]">
              ₹{job.ctc_lpa} LPA
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-3">
          <Badge variant={isEligible ? "success" : "error"}>
            {isEligible ? "✓ Eligible" : "Not Eligible"}
          </Badge>
          <Badge variant="purple">
            <Sparkles className="w-3 h-3" /> {matchPct}% Match
          </Badge>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewDetail && onViewDetail(job)}
        >
          View Details
        </Button>
        <Button
          variant={job.has_applied ? "secondary" : "primary"}
          size="sm"
          disabled={job.has_applied || !isEligible}
          onClick={() => onApply && onApply(job)}
        >
          {job.has_applied ? "Applied ✓" : "Apply Now"}
        </Button>
      </div>
    </Card>
  );
}

export function Timeline({ steps = [] }) {
  return (
    <div className="relative pl-2 space-y-4">
      <div className="absolute left-[18px] top-2 bottom-2 w-0.5 bg-slate-200" />
      {steps.map((step, idx) => {
        const isDone = step.state === "COMPLETED";
        const isCurrent = step.state === "CURRENT";
        return (
          <div key={step.id || idx} className="relative flex items-start gap-3">
            <div
              className={`relative z-10 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                isDone
                  ? "bg-[#32B67A] text-white"
                  : isCurrent
                  ? "bg-[#6555F5] text-white ring-4 ring-[#EEEAFE]"
                  : "bg-white border-2 border-slate-300 text-slate-400"
              }`}
            >
              {isDone ? "✓" : isCurrent ? "●" : "○"}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#182044]">
                {step.stage_name}
              </p>
              <p className="text-xs text-[#66708F]">
                {step.event_date
                  ? formatShortDate(step.event_date)
                  : isCurrent
                  ? "Upcoming"
                  : "Pending"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function SearchBar({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="relative flex-1">
      <Search className="w-4 h-4 text-[#66708F] absolute left-3.5 top-1/2 -translate-y-1/2" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-[#182044] placeholder-[#66708F] focus:outline-none focus:ring-2 focus:ring-[#6555F5]/30 focus:border-[#6555F5]"
      />
    </div>
  );
}

export function FilterButton({ active = false, onClick, label = "Filter" }) {
  return (
    <Button
      variant={active ? "primary" : "outline"}
      size="md"
      onClick={onClick}
    >
      <SlidersHorizontal className="w-4 h-4" />
      <span>{label}</span>
    </Button>
  );
}

export function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-lg" }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111936]/60 backdrop-blur-xs">
      <div
        className={`bg-white rounded-2xl shadow-xl border border-slate-100 w-full ${maxWidth} max-h-[90vh] overflow-y-auto p-6`}
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-[#182044]">{title}</h3>
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#66708F] hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Pagination({ currentPage = 1, totalPages = 1, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
      <span className="text-xs text-[#66708F]">
        Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft className="w-4 h-4" /> Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export function EmptyState({ title = "No records found", description = "", action }) {
  return (
    <Card className="text-center py-10">
      <div className="w-12 h-12 rounded-2xl bg-[#EEEAFE] text-[#6555F5] flex items-center justify-center mx-auto mb-3">
        <Sparkles className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-bold text-[#182044]">{title}</h4>
      {description && (
        <p className="text-xs text-[#66708F] mt-1 max-w-md mx-auto">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </Card>
  );
}

export function LoadingState({ message = "Loading PlaceTrace workspace..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-14">
      <div className="w-9 h-9 rounded-full border-3 border-[#EEEAFE] border-t-[#6555F5] animate-spin mb-3" />
      <p className="text-xs font-medium text-[#66708F]">{message}</p>
    </div>
  );
}

export function ErrorState({ message = "Something went wrong", onRetry }) {
  return (
    <Card className="border-red-200 bg-red-50/40 text-center py-8">
      <AlertCircle className="w-8 h-8 text-[#E55353] mx-auto mb-2" />
      <h4 className="text-sm font-bold text-[#182044]">Unable to load data</h4>
      <p className="text-xs text-[#66708F] mt-1">{message}</p>
      {onRetry && (
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </div>
      )}
    </Card>
  );
}

export function ToastContainer({ toasts = [], onRemove }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-lg text-xs font-medium text-white ${
            t.type === "error"
              ? "bg-[#E55353]"
              : t.type === "warning"
              ? "bg-[#F4B942] text-[#182044]"
              : "bg-[#172044] border border-[#6555F5]/40"
          }`}
        >
          <span>{t.message}</span>
          <button
            type="button"
            onClick={() => onRemove(t.id)}
            className="opacity-70 hover:opacity-100"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
