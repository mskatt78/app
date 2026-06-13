import { Heart } from "lucide-react";

export const HeartPracticesFilters = ({ categories, categoryIcons, categoryColors, filter, setFilter }) => (
  <div className="flex flex-wrap gap-2" data-testid="heart-practices-filter-grid">
    {categories.map((category) => {
      const Icon = categoryIcons[category] || Heart;
      const colors = categoryColors[category] || { text: "text-gray-400", bg: "bg-gray-500/10" };
      const selectedClassName = `${colors.bg} ${colors.text} border ${colors.border || "border-white/10"}`;
      const unselectedClassName = "bg-card/50 text-muted-foreground hover:bg-card";

      return (
        <button
          key={category}
          onClick={() => setFilter(category)}
          data-testid={`filter-${category}`}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${filter === category ? selectedClassName : unselectedClassName} border`}
        >
          {category !== "all" && <Icon className="w-4 h-4" />}
          <span className="text-sm capitalize">{category.replace("_", " ")}</span>
        </button>
      );
    })}
  </div>
);
