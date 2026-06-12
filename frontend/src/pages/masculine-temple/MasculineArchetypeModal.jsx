import { AnimatePresence, motion } from "framer-motion";
import { Star, X } from "lucide-react";
import GuidedAudioButton from "../../components/GuidedAudioButton";

export const MasculineArchetypeModal = ({ selectedArchetype, activeTab, setActiveTab, setSelectedArchetype, api }) => {
  return (
    <AnimatePresence>
      {selectedArchetype && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedArchetype(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(event) => event.stopPropagation()}
            className="bg-card rounded-2xl max-w-3xl w-full my-8"
            data-testid="archetype-modal"
          >
            <div className={`p-6 rounded-t-2xl ${selectedArchetype.color.bg} border-b ${selectedArchetype.color.border}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${selectedArchetype.color.bg} border ${selectedArchetype.color.border} flex items-center justify-center`}>
                    <selectedArchetype.icon className={`w-6 h-6 ${selectedArchetype.color.text}`} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-serif">{selectedArchetype.title}</h2>
                    <p className={`text-sm ${selectedArchetype.color.text}`}>{selectedArchetype.subtitle}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedArchetype(null)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  data-testid="close-modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{selectedArchetype.description}</p>
            </div>

            <div className={`flex border-b ${selectedArchetype.color.border}`}>
              {["teachings", "practices", "ritual"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-sm font-medium transition-all capitalize ${
                    activeTab === tab
                      ? `${selectedArchetype.color.text} border-b-2 ${selectedArchetype.color.border}`
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid={`archetype-tab-${tab}`}
                >
                  {tab === "ritual" ? "Ritual 🙏" : tab}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === "teachings" && (
                <div className="space-y-4">
                  {selectedArchetype.teachings.map((teaching, index) => (
                    <div key={`${selectedArchetype.id}-teaching-${teaching.heading}-${index}`} className={`p-5 rounded-xl ${selectedArchetype.color.bg} border ${selectedArchetype.color.border}`}>
                      <h4 className="font-serif mb-2">{teaching.heading}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{teaching.body}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "practices" && (
                <div className="space-y-4">
                  {selectedArchetype.practices.map((practice, index) => (
                    <div key={`${selectedArchetype.id}-practice-${practice.name}-${index}`} className="p-5 rounded-xl bg-white/5 border border-white/10">
                      <h4 className="font-serif mb-2 flex items-center gap-2">
                        <Star className={`w-4 h-4 ${selectedArchetype.color.text}`} />
                        {practice.name}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">{practice.desc}</p>
                      <GuidedAudioButton
                        api={api}
                        script={`${selectedArchetype.name} practice: ${practice.name}. ${practice.desc}`}
                        label="Listen to practice"
                        className="text-xs"
                      />
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "ritual" && selectedArchetype.ritual && (
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl ${selectedArchetype.color.bg} border ${selectedArchetype.color.border}`}>
                    <h3 className="font-serif text-lg mb-1">{selectedArchetype.ritual.name}</h3>
                    <p className="text-xs text-muted-foreground italic">{selectedArchetype.ritual.timing}</p>
                  </div>
                  <ol className="space-y-3">
                    {selectedArchetype.ritual.steps.map((step, index) => (
                      <li key={`${selectedArchetype.id}-ritual-step-${String(step).slice(0, 24)}-${index}`} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <span className={`w-7 h-7 rounded-full ${selectedArchetype.color.bg} border ${selectedArchetype.color.border} flex items-center justify-center text-xs ${selectedArchetype.color.text} flex-shrink-0`}>
                          {index + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                  <div className={`p-4 rounded-xl ${selectedArchetype.color.bg} border ${selectedArchetype.color.border}`}>
                    <p className="text-xs text-muted-foreground/80 italic">{selectedArchetype.ritual.closing}</p>
                  </div>
                  <GuidedAudioButton
                    api={api}
                    script={`${selectedArchetype.name} ritual: ${selectedArchetype.ritual.name}. ${selectedArchetype.ritual.steps.join(". ")}. ${selectedArchetype.ritual.closing}`}
                    label="Listen to Guided Ritual"
                  />
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};