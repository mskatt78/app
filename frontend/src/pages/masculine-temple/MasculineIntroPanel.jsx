import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Heart } from "lucide-react";
import { templeIntro } from "./constants";

export const MasculineIntroPanel = ({ showIntro, setShowIntro }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mb-12 p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20"
      data-testid="masculine-intro-panel"
    >
      <button onClick={() => setShowIntro(!showIntro)} className="w-full flex items-center justify-between" data-testid="masculine-intro-toggle">
        <div className="flex items-center gap-3">
          <Heart className="w-6 h-6 text-amber-400" />
          <h3 className="text-xl font-serif text-amber-200">{templeIntro.title}</h3>
        </div>
        {showIntro ? <ChevronUp className="w-5 h-5 text-amber-300" /> : <ChevronDown className="w-5 h-5 text-amber-300" />}
      </button>

      <AnimatePresence>
        {showIntro && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <p className="text-muted-foreground mt-4 mb-6 leading-relaxed">{templeIntro.description}</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {templeIntro.principles.map((principle, index) => (
                <div key={`${principle.title}-${index}`} className="p-4 rounded-xl bg-black/20 border border-amber-500/10">
                  <h4 className="font-serif text-amber-300 mb-2">{principle.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{principle.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};