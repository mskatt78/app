import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { masculineQuote } from "./constants";

export const MasculineQuoteBlock = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
      className="mt-16 text-center p-8 rounded-2xl bg-amber-500/5 border border-amber-500/15"
      data-testid="masculine-quote-block"
    >
      <Shield className="w-8 h-8 text-amber-300/40 mx-auto mb-4" />
      <blockquote className="text-lg font-serif italic text-muted-foreground max-w-2xl mx-auto leading-relaxed">
        {masculineQuote}
      </blockquote>
      <p className="mt-4 text-xs text-amber-300/50 uppercase tracking-widest">Sacred Masculine Wisdom</p>
    </motion.div>
  );
};