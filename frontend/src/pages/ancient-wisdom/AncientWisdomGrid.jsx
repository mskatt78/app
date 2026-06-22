import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { TRADITION_MAP } from "./constants";

export const AncientWisdomGrid = ({ entries, setSelected }) => {
  if (entries.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground" data-testid="ancient-wisdom-empty-state">
        <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p>No entries found in this tradition.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" data-testid="ancient-wisdom-grid">
      {entries.map((entry, index) => {
        const tradition = TRADITION_MAP[entry.tradition] || TRADITION_MAP.egyptian;
        const Icon = tradition.icon;
        return (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.02, duration: 0.3 }}
            onClick={() => setSelected(entry)}
            className={`cursor-pointer rounded-2xl overflow-hidden border group ${tradition.border} hover:scale-[1.03] transition-all duration-300`}
            data-testid={`entry-card-${entry.id}`}
          >
            <div className="relative aspect-square overflow-hidden">
              <img
                src={entry.image_url}
                alt={entry.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${tradition.bg} ${tradition.color} border ${tradition.border} backdrop-blur-sm`}>
                <Icon className="w-3 h-3" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className={`text-xs ${tradition.color} mb-0.5`}>{tradition.label}</p>
                <h3 className="text-sm font-serif text-white font-semibold leading-tight">{entry.name}</h3>
                {entry.title && <p className="text-xs text-white/50 mt-0.5 line-clamp-1">{entry.title}</p>}
                {entry.content_integrity?.verified && (
                  <p className="text-[10px] text-cyan-300/90 mt-1" data-testid={`ancient-wisdom-integrity-${entry.id}`}>
                    Verified references ({entry.content_integrity.references_count || 0})
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};