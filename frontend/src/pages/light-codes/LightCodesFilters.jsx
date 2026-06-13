import { categories } from "./lightCodeConfig";

export const LightCodesFilters = ({ activeCategory, selectCategory }) => (
  <div className="flex flex-wrap gap-4 justify-center" data-testid="light-codes-category-filters">
    {categories.map((category) => {
      const Icon = category.icon;
      const isActive = activeCategory === category.id;
      const activeClassName = `${category.bg} ${category.color} border ${category.border} shadow-[0_0_0_1px_rgba(255,255,255,0.04)]`;
      const inactiveClassName = "bg-card/50 text-muted-foreground border border-white/5 hover:border-white/10 hover:-translate-y-0.5";

      return (
        <button
          key={category.id}
          onClick={() => selectCategory(category.id)}
          className={`px-5 py-4 rounded-2xl flex items-center gap-3 transition-all duration-300 ${isActive ? activeClassName : inactiveClassName}`}
          data-testid={`category-${category.id}`}
        >
          <Icon className="w-5 h-5" />
          <div className="text-left">
            <p className="font-medium">{category.name}</p>
            <p className="text-xs opacity-70 hidden sm:block">{category.description}</p>
          </div>
        </button>
      );
    })}
  </div>
);
