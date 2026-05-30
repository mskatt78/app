export const CoursesFilters = ({
  levels,
  filterLevel,
  setFilterLevel,
  categories,
  filterCategory,
  setFilterCategory,
}) => (
  <div className="flex flex-wrap gap-3 mb-8" data-testid="courses-filters">
    <div className="flex gap-2 flex-wrap">
      {levels.map(level => (
        <button
          key={level}
          onClick={() => setFilterLevel(level)}
          className={`px-4 py-2 rounded-full text-sm capitalize transition-all ${
            filterLevel === level ? "bg-violet-500/20 text-violet-300 border border-violet-500/40" : "bg-white/5 text-muted-foreground hover:bg-white/10"
          }`}
          data-testid={`filter-level-${level}`}
        >
          {level === "all" ? "All Levels" : level}
        </button>
      ))}
    </div>
    {categories.length > 2 && (
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm capitalize transition-all ${
              filterCategory === cat ? "bg-primary/20 text-primary border border-primary/40" : "bg-white/5 text-muted-foreground hover:bg-white/10"
            }`}
          >
            {cat === "all" ? "All Categories" : cat}
          </button>
        ))}
      </div>
    )}
  </div>
);