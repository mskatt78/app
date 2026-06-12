import { Button } from "../../components/ui/button";

const VERIFICATION_FILTERS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
];

const PRIORITY_FILTERS = [
  { value: "all", label: "All Priorities" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export const AdminYogaVerificationPanel = ({
  verificationSummary,
  verificationFilter,
  setVerificationFilter,
  priorityFilter,
  setPriorityFilter,
  setPage,
  updateYogaQueueParams,
}) => {
  return (
    <div className="mb-6 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5" data-testid="yoga-verification-queue-panel">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <p className="text-sm font-medium">Yoga Image Verification Queue</p>
          <p className="text-xs text-muted-foreground" data-testid="yoga-verification-queue-summary">
            {verificationSummary.verified} verified · {verificationSummary.pending} pending review
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setVerificationFilter("pending");
            setPriorityFilter("all");
            setPage(1);
            updateYogaQueueParams("pending", "all");
          }}
          data-testid="yoga-queue-pending-only-button"
        >
          Review Pending Queue
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {VERIFICATION_FILTERS.map((filterOption) => (
          <button
            key={filterOption.value}
            type="button"
            onClick={() => {
              setVerificationFilter(filterOption.value);
              setPage(1);
              updateYogaQueueParams(filterOption.value, priorityFilter);
            }}
            className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
              verificationFilter === filterOption.value
                ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-100"
                : "bg-white/5 border-white/10 text-muted-foreground hover:text-foreground"
            }`}
            data-testid={`yoga-verification-filter-${filterOption.value}`}
          >
            {filterOption.label}
          </button>
        ))}

        {PRIORITY_FILTERS.map((filterOption) => (
          <button
            key={filterOption.value}
            type="button"
            onClick={() => {
              setPriorityFilter(filterOption.value);
              setPage(1);
              updateYogaQueueParams(verificationFilter, filterOption.value);
            }}
            className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
              priorityFilter === filterOption.value
                ? "bg-cyan-500/20 border-cyan-400/40 text-cyan-100"
                : "bg-white/5 border-white/10 text-muted-foreground hover:text-foreground"
            }`}
            data-testid={`yoga-priority-filter-${filterOption.value}`}
          >
            {filterOption.label}
          </button>
        ))}
      </div>
    </div>
  );
};