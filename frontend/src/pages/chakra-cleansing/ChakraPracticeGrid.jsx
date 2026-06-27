import { motion } from "framer-motion";
import { Clock, Heart, Loader2, Lock, Zap } from "lucide-react";
import { getChakraConfig } from "./chakraConfig";
import { resolveDurationMinutes } from "../../utils/durationUtils";

export const ChakraPracticeGrid = ({ loading, practices, onOpenPractice, canAccessPractice }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20" data-testid="chakra-practices-loading">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
    );
  }

  if (practices.length === 0) {
    return (
      <div className="text-center py-20" data-testid="chakra-practices-empty-state">
        <Zap className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
        <h2 className="text-2xl font-serif mb-2">Chakra Practices Coming Soon</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Sacred chakra healing guides are being prepared. Add practices through the Admin CMS.
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="chakra-practice-grid">
      {practices.map((practice, index) => {
        const config = getChakraConfig(practice.chakra);
        return (
          <motion.div
            key={practice.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`rounded-2xl border backdrop-blur-xl cursor-pointer overflow-hidden hover:scale-[1.02] transition-all duration-300 group ${config.border} bg-white/[0.02]`}
            onClick={() => onOpenPractice(practice)}
            data-testid={`chakra-card-${practice.id}`}
          >
            {Boolean(practice.is_premium) && !canAccessPractice(practice) && (
              <div className="absolute top-3 left-3 z-10">
                <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-100 text-xs" data-testid={`chakra-practice-premium-badge-${practice.id}`}>
                  <Lock className="w-3 h-3" /> Premium
                </span>
              </div>
            )}
            {practice.image_url ? (
              <div className="relative h-44 overflow-hidden">
                <img src={practice.image_url} alt={practice.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs ${config.color}/20 ${config.text} backdrop-blur-sm flex items-center gap-1`}>
                  {config.icon} {practice.chakra}
                </span>
              </div>
            ) : (
              <div className={`h-32 flex items-center justify-center ${config.color}/10`}>
                <span className="text-5xl">{config.icon}</span>
              </div>
            )}

            <div className="p-5">
              <h3 className={`text-lg font-serif mb-2 ${config.text}`}>{practice.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{practice.description}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {practice.duration_minutes && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {resolveDurationMinutes(practice.duration_minutes, 20)} min
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />Self-Healing
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};