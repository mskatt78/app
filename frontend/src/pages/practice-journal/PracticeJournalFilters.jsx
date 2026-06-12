import { Search } from "lucide-react";
import { PRACTICE_FILTERS } from "./constants";

export const PracticeJournalFilters = ({ filterType, setFilterType, searchTerm, setSearchTerm }) => {
  const resolveFilterButtonClass = (type) => {
    if (filterType === type) {
      return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40";
    }

    return "bg-white/5 text-muted-foreground hover:bg-white/10";
  };

  const resolveFilterLabel = (type) => {
    if (type === "all") {
      return "All";
    }

    return type;
  };

  return (
    <div className="flex flex-wrap gap-3 mb-6" data-testid="practice-journal-filters-section">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search entries..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-emerald-500/50"
          data-testid="search-input"
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        {PRACTICE_FILTERS.map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-2 rounded-lg text-sm capitalize transition-all ${resolveFilterButtonClass(type)}`}
            data-testid={`filter-${type}`}
          >
            {resolveFilterLabel(type)}
          </button>
        ))}
      </div>
    </div>
  );
};
