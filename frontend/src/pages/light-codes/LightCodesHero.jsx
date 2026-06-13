import { motion } from "framer-motion";
import { Hexagon, Sparkles } from "lucide-react";

export const LightCodesHero = ({ activeCategoryInfo }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(120,119,198,0.22),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(45,212,191,0.18),_transparent_28%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(3,7,18,0.88))] px-6 py-10 sm:px-10 sm:py-14"
    data-testid="light-codes-hero"
  >
    <div className="absolute inset-0 opacity-30 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:36px_36px]" />
    <div className="relative grid gap-8 lg:grid-cols-[1.4fr_0.9fr] lg:items-end">
      <div className="space-y-6 text-left">
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-violet-500/20 flex items-center justify-center">
            <Hexagon className="w-7 h-7 text-violet-400" />
          </div>
          <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center">
            <span className="text-2xl">ॐ</span>
          </div>
          <div className="w-14 h-14 rounded-full bg-cyan-500/20 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-cyan-400" />
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-white/40 mb-3">Symbol, sound, and subtle anatomy</p>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif leading-[1.05] max-w-3xl">
            Light Codes for the <span className="italic text-primary">body of consciousness</span>
          </h2>
        </div>
        <p className="text-sm sm:text-base text-white/70 max-w-2xl leading-relaxed" data-testid="light-codes-hero-description">
          This temple gathers sacred geometry, temple alphabets, DNA helix transmissions, galactic remembrance, and chakra activations into one contemplative library. Each symbol now carries deeper healing philosophy, lineage context, and practice guidance — not just a surface meaning.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5" data-testid="light-codes-hero-card-lineage">
          <p className="text-xs uppercase tracking-[0.28em] text-white/35 mb-2">Ancient stream</p>
          <p className="text-sm text-white/75 leading-relaxed">{activeCategoryInfo?.lineage}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5" data-testid="light-codes-hero-card-focus">
          <p className="text-xs uppercase tracking-[0.28em] text-white/35 mb-2">Why this category heals</p>
          <p className="text-sm text-white/75 leading-relaxed">{activeCategoryInfo?.integration}</p>
        </div>
      </div>
    </div>
  </motion.div>
);
