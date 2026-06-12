import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { heroDescription } from "./constants";

export const MasculineHero = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12 pt-8" data-testid="masculine-hero">
      <div className="relative inline-block mb-6">
        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-amber-500/30 to-orange-600/20 border border-amber-500/30 flex items-center justify-center">
          <Shield className="w-12 h-12 text-amber-300" />
        </div>
        <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-xl" />
      </div>
      <h2 className="text-4xl sm:text-5xl font-serif mb-4">
        The <span className="text-amber-300 italic">Masculine Temple</span>
      </h2>
      <p className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed">{heroDescription}</p>
      <div className="flex items-center justify-center gap-2 mt-6">
        <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-500/50" />
        <Shield className="w-4 h-4 text-amber-400/60" />
        <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-500/50" />
      </div>
    </motion.div>
  );
};