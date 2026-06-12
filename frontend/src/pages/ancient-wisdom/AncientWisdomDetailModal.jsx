import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, ChevronRight, Eye, Gem, Heart, Sparkles, Star, X, Zap } from "lucide-react";
import { Button } from "../../components/ui/button";
import GuidedAudioButton from "../../components/GuidedAudioButton";
import { formatReviewedDate, TRADITION_MAP } from "./constants";

export const AncientWisdomDetailModal = ({ selected, setSelected, api }) => {
  return (
    <AnimatePresence>
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={(event) => event.target === event.currentTarget && setSelected(null)}
        >
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            className="relative w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-background border border-white/10"
            data-testid="wisdom-detail-modal"
          >
            <div className="relative h-64 overflow-hidden rounded-t-3xl">
              <img src={selected.image_url} alt={selected.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-transparent" />
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors"
                data-testid="close-modal-btn"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              <div className="absolute bottom-4 left-4 right-12">
                {(() => {
                  const tradition = TRADITION_MAP[selected.tradition] || TRADITION_MAP.egyptian;
                  const Icon = tradition.icon;
                  return (
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs mb-2 ${tradition.bg} ${tradition.color} border ${tradition.border}`}>
                      <Icon className="w-3 h-3" />
                      {tradition.label}
                    </div>
                  );
                })()}
                <h2 className="text-3xl font-serif text-white">{selected.name}</h2>
                {selected.title && <p className="text-sm text-white/60 mt-1 italic">{selected.title}</p>}
                {selected.element && <p className="text-xs text-white/40 mt-0.5">Element: {selected.element}</p>}
                {formatReviewedDate(selected.content_integrity?.last_reviewed_at) && (
                  <p className="text-xs text-cyan-300/90 mt-1" data-testid="ancient-wisdom-reviewed-at">
                    Last reviewed: {formatReviewedDate(selected.content_integrity?.last_reviewed_at)}
                  </p>
                )}
              </div>
            </div>

            <div className="p-6 space-y-6">
              <p className="text-muted-foreground leading-relaxed">{selected.description}</p>

              {selected.expanded_context && (
                <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5">
                  <p className="text-xs uppercase tracking-widest text-cyan-300 mb-2">Expanded Context</p>
                  <p className="text-sm text-cyan-100/90 leading-relaxed">{selected.expanded_context}</p>
                </div>
              )}

              {selected.message && (
                <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20">
                  <h4 className="text-xs uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    Sacred Message
                  </h4>
                  <p className="text-foreground italic leading-relaxed">"{selected.message}"</p>
                </div>
              )}

              {selected.invocation && (
                <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                  <h4 className="text-xs uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5" />
                    Sacred Mantra / Invocation
                  </h4>
                  <p className="text-sm italic text-muted-foreground leading-relaxed">"{selected.invocation}"</p>
                  <div className="mt-3">
                    <GuidedAudioButton
                      api={api}
                      script={`Sacred invocation for ${selected.name}: ${selected.invocation}`}
                      label="Listen to Sacred Invocation"
                      voice="nova"
                      className="text-xs"
                    />
                  </div>
                </div>
              )}

              {selected.teachings?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-primary" />
                    Sacred Teachings
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selected.teachings.map((teaching) => (
                      <span key={`teaching-${selected.id}-${teaching.slice(0, 40)}`} className="px-3 py-1 rounded-full bg-white/5 text-xs text-muted-foreground border border-white/10">
                        {teaching}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selected.sacred_tools?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400" />
                    Sacred Tools & Offerings
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selected.sacred_tools.map((tool) => (
                      <div key={`tool-${selected.id}-${tool.slice(0, 40)}`} className="flex items-start gap-2 p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                        <ChevronRight className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-muted-foreground">{tool}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selected.practice?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-400" />
                    Ceremony / Ritual Steps
                  </h4>
                  <ol className="space-y-2">
                    {selected.practice.map((step, index) => (
                      <li key={`practice-${selected.id}-${step.slice(0, 40)}`} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <span className="w-6 h-6 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-xs text-rose-400 flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                  <div className="mt-3">
                    <GuidedAudioButton
                      api={api}
                      script={`${selected.name} ceremony. ${selected.practice.map((step, index) => `Step ${index + 1}: ${step}`).join(". ")}`}
                      label="Listen to Ceremony Steps"
                      voice="nova"
                      className="text-xs"
                    />
                  </div>
                </div>
              )}

              {selected.crystals?.length > 0 && (
                <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/20">
                  <p className="text-xs text-violet-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Gem className="w-3.5 h-3.5" />
                    Crystal Allies
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selected.crystals.map((crystal) => (
                      <span key={`wisdom-crystal-${selected.id}-${String(crystal).toLowerCase()}`} className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300">
                        {crystal}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selected.chakra && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
                  <Zap className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-indigo-400 uppercase tracking-wider">Chakra Connection</p>
                    <p className="text-sm font-medium mt-0.5">{selected.chakra}</p>
                  </div>
                </div>
              )}

              <Button className="w-full" onClick={() => setSelected(null)} data-testid="close-wisdom-btn">
                Return to Traditions
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};