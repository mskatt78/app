import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export const MasculineEmbodimentGrid = ({ embodimentPractices, setSelectedPractice }) => {
  if (embodimentPractices.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mb-12"
      data-testid="masculine-embodiment-grid"
    >
      <div className="flex items-center gap-3 mb-6">
        <Zap className="w-6 h-6 text-orange-400" />
        <h3 className="text-2xl font-serif">Embodiment Practices</h3>
      </div>
      <p className="text-muted-foreground mb-6">Sacred practices for honoring your whole temple — body, heart, strength, and soul.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {embodimentPractices.map((practice, index) => (
          <motion.div
            key={practice.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            onClick={() => setSelectedPractice(practice)}
            className="p-5 rounded-xl bg-orange-500/10 border border-orange-500/20 cursor-pointer hover:scale-[1.02] transition-all group"
            data-testid={`embodiment-${practice.id}`}
          >
            {practice.image_url && (
              <div className="relative h-32 rounded-lg overflow-hidden mb-4">
                <img src={practice.image_url} alt={practice.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            )}
            <span className="text-xs text-orange-300 uppercase tracking-wider">{practice.category}</span>
            <h4 className="font-serif text-lg mt-1 group-hover:text-orange-300 transition-colors">{practice.name}</h4>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{practice.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};