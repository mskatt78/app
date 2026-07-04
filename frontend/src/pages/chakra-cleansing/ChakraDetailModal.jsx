import { AnimatePresence, motion } from "framer-motion";
import { Clock, ChevronDown, ChevronUp, Flame, Loader2, Play, Share2, Volume2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import AddToJournal from "../../components/AddToJournal";
import { EmbodimentProtocolPanel } from "../../components/practice/EmbodimentProtocolPanel";
import { resolveDurationMinutes } from "../../utils/durationUtils";
import { getChakraConfig, stableChakraKey } from "./chakraConfig";

export const ChakraDetailModal = ({
  selectedPractice,
  audioState,
  expandedSection,
  setExpandedSection,
  sectionItems,
  dailyCeremonySteps,
  selectedPracticeBenefits,
  generateAudio,
  setShowShare,
  setShowGuided,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {selectedPractice && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-card border border-white/10"
            data-testid="chakra-detail-modal"
          >
            {selectedPractice.image_url && (
              <div className="relative h-48 overflow-hidden rounded-t-2xl">
                <img src={selectedPractice.image_url} alt={selectedPractice.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
              </div>
            )}

            <div className="p-6">
              {(() => {
                const config = getChakraConfig(selectedPractice.chakra);
                return (
                  <>
                    <div className="flex gap-2 mb-3 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-xs ${config.color}/20 ${config.text} flex items-center gap-1`}>
                        {config.icon} {selectedPractice.chakra}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs bg-white/5">{config.sanskrit}</span>
                      <span className="px-3 py-1 rounded-full text-xs bg-white/5">{config.element} Element</span>
                      {selectedPractice.duration_minutes && (
                        <span className="px-3 py-1 rounded-full text-xs bg-white/5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {resolveDurationMinutes(selectedPractice.duration_minutes, 20)} min
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-serif mb-1">{selectedPractice.name}</h2>
                    <p className="text-sm text-muted-foreground mb-3">Location: {config.location}</p>
                    <p className="text-muted-foreground mb-4">{selectedPractice.description}</p>
                  </>
                );
              })()}

              {sectionItems.map((section) => (
                <div key={section.key} className="mb-3 border border-white/10 rounded-xl overflow-hidden">
                  <div className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                    <button
                      onClick={() => setExpandedSection(expandedSection === section.key ? null : section.key)}
                      className="flex items-center gap-2 text-sm font-medium flex-1 text-left"
                      data-testid={`section-${section.key}`}
                    >
                      <section.icon className="w-4 h-4 text-violet-400" />
                      {section.label}
                    </button>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => generateAudio(section.content, section.key)}
                        className={`p-1.5 rounded-full transition-all ${
                          audioState.sectionKey === section.key
                            ? "bg-violet-500/20 text-violet-300"
                            : "hover:bg-white/10 text-muted-foreground"
                        }`}
                        title="Listen to narration"
                        data-testid={`listen-${section.key}`}
                      >
                        {audioState.loading && audioState.sectionKey === section.key ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => setExpandedSection(expandedSection === section.key ? null : section.key)}
                        className="p-1"
                      >
                        {expandedSection === section.key ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>

                  {expandedSection === section.key && (
                    <div className="px-4 pb-4 text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                      {audioState.audioUrl && audioState.sectionKey === section.key && (
                        <div className="mb-3 p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                          <p className="text-[10px] text-violet-400 mb-1.5 font-medium">Guided Narration</p>
                          <audio controls autoPlay src={audioState.audioUrl} className="w-full" style={{ height: "36px" }} />
                        </div>
                      )}
                      {section.content}
                    </div>
                  )}
                </div>
              ))}

              {selectedPractice.safety_precautions && (
                <div className="mb-3 border border-red-500/20 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedSection(expandedSection === "safety" ? null : "safety")}
                    className="w-full flex items-center justify-between p-4 hover:bg-red-500/5 transition-colors"
                    data-testid="section-safety"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium text-red-400">⚠ Safety Precautions</span>
                    {expandedSection === "safety" ? (
                      <ChevronUp className="w-4 h-4 text-red-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-red-400" />
                    )}
                  </button>
                  {expandedSection === "safety" && (
                    <div className="px-4 pb-4 text-sm text-muted-foreground whitespace-pre-line leading-relaxed bg-red-500/3">
                      {selectedPractice.safety_precautions}
                    </div>
                  )}
                </div>
              )}

              {selectedPractice.daily_embodiment_ceremony && (
                <div className="mb-3 border border-emerald-500/20 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedSection(expandedSection === "daily" ? null : "daily")}
                    className="w-full flex items-center justify-between p-4 hover:bg-emerald-500/5 transition-colors"
                    data-testid="section-daily"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium text-emerald-400">
                      <Flame className="w-4 h-4" /> Daily Embodiment Ceremony
                    </span>
                    {expandedSection === "daily" ? (
                      <ChevronUp className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-emerald-400" />
                    )}
                  </button>

                  {expandedSection === "daily" && (
                    <div className="px-4 pb-4 bg-emerald-500/3 space-y-3">
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-emerald-300 font-medium text-sm">
                          {selectedPractice.daily_embodiment_ceremony.name}
                        </span>
                        <span className="text-xs text-muted-foreground">— {selectedPractice.daily_embodiment_ceremony.duration}</span>
                      </div>
                      <ol className="space-y-2">
                        {dailyCeremonySteps.map((step, index) => (
                          <li key={stableChakraKey(`daily-ceremony-step-${selectedPractice.id}`, step)} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                              {index + 1}
                            </span>
                            <span className="leading-relaxed">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              )}

              <EmbodimentProtocolPanel
                practiceName={selectedPractice.name}
                element={selectedPractice.element || selectedPractice.chakra || "Spirit"}
                chakraName={selectedPractice.chakra}
                testIdPrefix="chakra-practice-embodiment"
              />

              {selectedPractice.benefits && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Benefits When Balanced</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPracticeBenefits.map((benefit) => (
                      <span key={stableChakraKey(`chakra-benefit-${selectedPractice.id}`, benefit)} className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-300 text-xs">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <AddToJournal
                  practiceName={selectedPractice.name}
                  practiceType="chakra"
                  duration={resolveDurationMinutes(selectedPractice.duration_minutes, 15)}
                  buttonVariant="outline"
                  buttonSize="default"
                />
                <Button
                  variant="outline"
                  onClick={() => setShowShare(true)}
                  className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 flex items-center gap-1.5"
                  data-testid="chakra-share-btn"
                >
                  <Share2 className="w-3.5 h-3.5" />Share
                </Button>
                <Button
                  onClick={() => setShowGuided(true)}
                  className="bg-violet-500 hover:bg-violet-600 flex items-center gap-1.5"
                  data-testid="chakra-guided-btn"
                >
                  <Play className="w-3.5 h-3.5" />Guided Practice
                </Button>
                <Button variant="ghost" onClick={onClose} className="flex-1" data-testid="chakra-close-modal-btn">
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};