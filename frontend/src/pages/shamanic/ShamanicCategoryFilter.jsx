import { Feather } from "lucide-react";
import { categoryColors, categoryIcons, shamanicCategories } from "./constants";

export const ShamanicCategoryFilter = ({ filter, setFilter }) => {
  return (
    <div className="flex flex-wrap gap-2" data-testid="shamanic-category-filter">
      {shamanicCategories.map((category) => {
        const Icon = categoryIcons[category] || Feather;
        const colors = categoryColors[category] || { text: "text-gray-400", bg: "bg-gray-500/10" };

        return (
          <button
            key={category}
            onClick={() => setFilter(category)}
            data-testid={`filter-${category}`}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
              filter === category
                ? `${colors.bg} ${colors.text} border ${colors.border || "border-white/10"}`
                : "bg-card/50 text-muted-foreground hover:bg-card"
            }`}
          >
            {category !== "all" && <Icon className="w-4 h-4" />}
            <span className="text-sm capitalize">{category.replace("_", " ")}</span>
          </button>
        );
      })}
    </div>
  );
};