import { motion } from "framer-motion";
import { BookOpen, ChevronRight, Crown, Lock } from "lucide-react";

export const MasculineArchetypeGrid = ({ archetypes, openArchetype, isLocked }) => {
  return (
    <>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="w-6 h-6 text-amber-400" />
          <h3 className="text-2xl font-serif">The Four Archetypes</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="masculine-archetype-grid">
        {archetypes.map((archetype, index) => {
          const Icon = archetype.icon;
          return (
            <motion.div
              key={archetype.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => openArchetype(archetype)}
              data-testid={`archetype-${archetype.id}`}
              className={`group cursor-pointer rounded-2xl border backdrop-blur-xl overflow-hidden ${archetype.color.bg} ${archetype.color.border} hover:scale-[1.02] transition-all duration-300`}
            >
              {archetype.image && (
                <div className="relative h-40 overflow-hidden">
                  <img src={archetype.image} alt={archetype.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                  <div className={`absolute top-4 left-4 w-10 h-10 rounded-xl ${archetype.color.bg} border ${archetype.color.border} flex items-center justify-center backdrop-blur-sm`}>
                    <Icon className={`w-5 h-5 ${archetype.color.text}`} />
                  </div>
                </div>
              )}
              <div className="p-5">
                <h3 className="text-xl font-serif mb-1">{archetype.title}</h3>
                <p className={`text-sm ${archetype.color.text} mb-3 uppercase tracking-wider`}>{archetype.subtitle}</p>
                <p className="text-base text-muted-foreground line-clamp-3 leading-relaxed">{archetype.description}</p>
                {isLocked && (
                  <div className="mt-3 inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border border-amber-500/30 bg-amber-500/15 text-amber-100" data-testid={`masculine-archetype-lock-${archetype.id}`}>
                    <Lock className="w-3 h-3" /> Premium <Crown className="w-3 h-3" />
                  </div>
                )}
                <div className={`mt-4 flex items-center gap-1 text-sm ${archetype.color.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                  <ChevronRight className="w-4 h-4" />
                  <span>Enter the Teaching</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </>
  );
};