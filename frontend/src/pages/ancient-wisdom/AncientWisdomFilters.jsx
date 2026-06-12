import { motion } from "framer-motion";

export const AncientWisdomFilters = ({ traditions, activeTab, setActiveTab }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex flex-wrap gap-2 justify-center mb-10"
      data-testid="ancient-wisdom-filters"
    >
      {traditions.map((tradition) => {
        const Icon = tradition.icon;
        const isActive = activeTab === tradition.id;
        return (
          <button
            key={tradition.id}
            data-testid={`filter-${tradition.id}`}
            onClick={() => setActiveTab(tradition.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              isActive
                ? `${tradition.bg} ${tradition.color} ${tradition.border} border scale-105 shadow-sm`
                : "bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {tradition.label}
          </button>
        );
      })}
    </motion.div>
  );
};