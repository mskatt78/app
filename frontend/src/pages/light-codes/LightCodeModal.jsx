import { motion, AnimatePresence } from "framer-motion";
import { Brain, HandHeart, ScrollText, X, Volume2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import { getEncodedFrequencyImage } from "../../utils/lightCodeVisualTheme";
import { getLightCodeImage } from "../../utils/shamanicImageTheme";

export const LightCodeModal = ({
  selectedSymbol,
  activeCategoryInfo,
  modalTabs,
  modalTab,
  setModalTab,
  onClose,
}) => {
  if (!selectedSymbol) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
        onClick={onClose}
        data-testid="light-code-modal-backdrop"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-5xl max-h-[88vh] overflow-y-auto rounded-[2rem] border border-white/10 bg-card"
          onClick={(event) => event.stopPropagation()}
          data-testid="light-code-modal"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-black/50 flex items-center justify-center z-10 border border-white/10"
            data-testid="light-code-modal-close-btn"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            <div className="relative min-h-[280px] lg:min-h-full">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${getLightCodeImage(selectedSymbol)})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  opacity: 0.22,
                }}
                data-testid="light-code-modal-image-bg"
              />
              {selectedSymbol.image_url ? (
                <img
                  src={getLightCodeImage(selectedSymbol, 1)}
                  alt={selectedSymbol.name}
                  className="w-full h-full object-cover lg:absolute lg:inset-0"
                  data-testid="light-code-modal-image"
                />
              ) : (
                <div className={`h-full min-h-[280px] flex items-center justify-center ${activeCategoryInfo?.bg}`}>
                  <span className="text-8xl">{selectedSymbol.symbol || "✨"}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 space-y-3">
                <div className="inline-flex items-center gap-3 rounded-full bg-black/45 px-4 py-2 border border-white/10 backdrop-blur-md">
                  <span className="text-2xl">{selectedSymbol.symbol || "✨"}</span>
                  <span className="text-sm text-white/80" data-testid="light-code-modal-lineage">{selectedSymbol.lineage}</span>
                </div>
                <div>
                  <h2 className="text-3xl font-serif text-white" data-testid="light-code-modal-title">{selectedSymbol.name}</h2>
                  <p className="text-sm text-white/70 mt-2 max-w-xl" data-testid="light-code-modal-description">{selectedSymbol.description}</p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className={`rounded-2xl border ${activeCategoryInfo?.border} ${activeCategoryInfo?.bg} p-4`} data-testid="light-code-modal-meaning-card">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/40 mb-2">Meaning</p>
                  <p className="text-sm text-white/75 leading-relaxed">{selectedSymbol.meaning || selectedSymbol.purpose}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4" data-testid="light-code-modal-healing-card">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/40 mb-2">Healing lens</p>
                  <p className="text-sm text-white/75 leading-relaxed">{selectedSymbol.healing_lens}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3" data-testid="light-code-modal-depth-triad">
                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4" data-testid="light-code-depth-symbolic-card">
                  <div className="flex items-center gap-2 mb-2 text-cyan-200/80"><ScrollText className="w-4 h-4" /><span className="text-[11px] uppercase tracking-[0.2em]">Symbolic layer</span></div>
                  <p className="text-xs text-white/75 leading-relaxed">Pattern, proportion, and archetypal meaning shape perception and orient attention.</p>
                </div>
                <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4" data-testid="light-code-depth-neural-card">
                  <div className="flex items-center gap-2 mb-2 text-violet-200/80"><Brain className="w-4 h-4" /><span className="text-[11px] uppercase tracking-[0.2em]">Neural layer</span></div>
                  <p className="text-xs text-white/75 leading-relaxed">Coherent visual focus + paced breath can downshift stress loops and stabilize cognition.</p>
                </div>
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4" data-testid="light-code-depth-embodiment-card">
                  <div className="flex items-center gap-2 mb-2 text-emerald-200/80"><HandHeart className="w-4 h-4" /><span className="text-[11px] uppercase tracking-[0.2em]">Embodiment layer</span></div>
                  <p className="text-xs text-white/75 leading-relaxed">Activation is complete only when one practical behavior changes in daily life.</p>
                </div>
              </div>

              {selectedSymbol.pronunciation && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10" data-testid="light-code-modal-pronunciation">
                  <Volume2 className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-white/40">Pronunciation</p>
                    <p className="font-medium mt-1">{selectedSymbol.pronunciation}</p>
                  </div>
                </div>
              )}

              <Tabs value={modalTab} onValueChange={setModalTab} className="w-full" data-testid="light-code-modal-tabs">
                <TabsList className="w-full h-auto flex flex-wrap gap-2 bg-transparent p-0 justify-start">
                  {modalTabs.map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.18em] data-[state=active]:bg-white data-[state=active]:text-slate-950"
                      data-testid={`light-code-tab-${tab.id}`}
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="essence" className="space-y-4" data-testid="light-code-tab-content-essence">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/40 mb-3">Essence</p>
                    <p className="text-sm text-white/75 leading-relaxed">{selectedSymbol.extended_teachings}</p>
                  </div>
                  {selectedSymbol.meditation && (
                    <div className={`rounded-2xl border ${activeCategoryInfo?.border} ${activeCategoryInfo?.bg} p-5`} data-testid="light-code-modal-meditation">
                      <p className="text-xs uppercase tracking-[0.22em] text-white/40 mb-3">Contemplation</p>
                      <p className="text-sm text-white/75 leading-relaxed">{selectedSymbol.meditation}</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="why" className="space-y-4" data-testid="light-code-tab-content-why">
                  <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70 mb-3">Why it heals</p>
                    <p className="text-sm text-white/80 leading-relaxed">{selectedSymbol.why_this_heals}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5" data-testid="light-code-tab-why-practical-anchor">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/40 mb-3">Practical anchor</p>
                    <p className="text-sm text-white/75 leading-relaxed">
                      Healing is validated by behavior. After this transmission, choose one concrete action you can complete in under 24 hours.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="traditions" className="space-y-4" data-testid="light-code-tab-content-traditions">
                  <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-amber-200/70 mb-3">Ancient traditions</p>
                    <p className="text-sm text-white/80 leading-relaxed">{selectedSymbol.ancient_traditions}</p>
                  </div>
                  <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5" data-testid="light-code-tab-traditions-context">
                    <p className="text-xs uppercase tracking-[0.22em] text-amber-200/70 mb-3">Living context</p>
                    <p className="text-sm text-white/80 leading-relaxed">
                      These lineages used symbols as training technologies for perception, ethics, and collective coherence — not just visual motifs.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="ceremony" className="space-y-4" data-testid="light-code-tab-content-ceremony">
                  <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-5" data-testid="light-code-ceremony-symbol-band">
                    <p className="text-xs uppercase tracking-[0.22em] text-violet-200/70 mb-3">Light-coded symbols</p>
                    <div className="flex flex-wrap gap-2">
                      {(selectedSymbol.light_coded_symbols || [selectedSymbol.symbol || "✧"]).map((glyph, index) => (
                        <span
                          key={`${selectedSymbol.id || selectedSymbol.name}-glyph-${index}`}
                          className="px-3 py-1 rounded-full bg-black/30 border border-white/20 text-white/90"
                          data-testid={`light-code-ceremony-glyph-${index}`}
                        >
                          {glyph}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5" data-testid="light-code-ceremony-embodiment">
                    <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70 mb-3">Ceremonial Embodiment Protocol</p>
                    <ul className="space-y-2">
                      {(selectedSymbol.embodiment_ritual || []).map((step, index) => (
                        <li key={`${selectedSymbol.id || selectedSymbol.name}-embodiment-${index}`} className="text-sm text-white/80 leading-relaxed flex gap-2" data-testid={`light-code-embodiment-step-${index}`}>
                          <span className="text-cyan-300 shrink-0">{index + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5" data-testid="light-code-ceremony-sequence">
                    <p className="text-xs uppercase tracking-[0.22em] text-amber-200/70 mb-3">Ceremony Sequence & Articulation</p>
                    <ul className="space-y-2">
                      {(selectedSymbol.ceremony || []).map((line, index) => (
                        <li key={`${selectedSymbol.id || selectedSymbol.name}-ceremony-${index}`} className="text-sm text-white/80 leading-relaxed" data-testid={`light-code-ceremony-step-${index}`}>
                          • {line}
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="practice" className="space-y-4" data-testid="light-code-tab-content-practice">
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-emerald-200/70 mb-3">Practice guide</p>
                    <p className="text-sm text-white/80 leading-relaxed whitespace-pre-line">{selectedSymbol.practice_guide}</p>
                  </div>

                  {selectedSymbol.how_to_draw && (
                    <div className="rounded-2xl border border-rose-500/30 overflow-hidden" data-testid="light-code-modal-drawing-guide">
                      <div className="p-4 bg-rose-500/10 border-b border-rose-500/20">
                        <h3 className="font-medium text-rose-200 text-lg">Sacred Geometry Drawing Guide</h3>
                        <p className="text-xs text-white/50 mt-1">Move slowly and let the drawing become part of the ritual.</p>
                      </div>
                      <div className="p-4 bg-amber-500/5 border-b border-amber-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-amber-400">⚠</span>
                          <h4 className="text-sm font-medium text-amber-300">Preparation & grounding</h4>
                        </div>
                        <ul className="text-xs text-white/60 space-y-1.5">
                          <li>• Ground for a few minutes before drawing.</li>
                          <li>• Set a clear intention before beginning the pattern.</li>
                          <li>• Work slowly enough that breath and line stay connected.</li>
                          <li>• Integrate with water, stillness, and journaling afterward.</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-rose-500/5">
                        <p className="text-sm text-white/75 leading-relaxed whitespace-pre-line">
                          {selectedSymbol.how_to_draw.replace(/(\d+)\./g, "\n$1.").trim()}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedSymbol.activation && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5" data-testid="light-code-modal-activation">
                      <p className="text-xs uppercase tracking-[0.22em] text-white/40 mb-3">Activation</p>
                      <p className="text-sm text-white/75 leading-relaxed">{selectedSymbol.activation}</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <Button onClick={onClose} className="w-full" variant="outline" data-testid="light-code-modal-close-bottom-btn">
                Close
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};