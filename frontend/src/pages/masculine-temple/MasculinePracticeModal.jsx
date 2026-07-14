import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Shield, Zap } from "lucide-react";
import AddToJournal from "../../components/AddToJournal";
import GuidedAudioButton from "../../components/GuidedAudioButton";
import { resolveDurationMinutes } from "../../utils/durationUtils";
import { composeDeepGuidedNarration, ritualDeliveryPillars } from "../../utils/guidedRitualComposer";
import { getMasculineTempleImage } from "../../utils/shamanicImageTheme";

const normalizeBenefits = (benefits) => {
  if (!benefits) return [];
  if (typeof benefits === "string") {
    return benefits.split(",").map((benefit) => benefit.trim()).filter(Boolean);
  }
  return benefits;
};

export const MasculinePracticeModal = ({ selectedPractice, setSelectedPractice, api }) => {
  const benefits = normalizeBenefits(selectedPractice?.benefits);

  return (
    <AnimatePresence>
      {selectedPractice && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedPractice(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(event) => event.stopPropagation()}
            className="bg-card rounded-2xl max-w-2xl w-full my-8"
            data-testid="embodiment-modal"
          >
            <div className="relative h-48 rounded-t-2xl overflow-hidden">
              <img src={getMasculineTempleImage(selectedPractice, 1)} alt={selectedPractice.name} className="w-full h-full object-cover" data-testid="masculine-practice-modal-image" />
              <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs">{selectedPractice.category}</span>
                {selectedPractice.element && <span className="px-3 py-1 rounded-full bg-white/5 text-xs">{selectedPractice.element} Element</span>}
                {selectedPractice.duration_minutes && <span className="px-3 py-1 rounded-full bg-white/5 text-xs">{resolveDurationMinutes(selectedPractice.duration_minutes, 20)} min</span>}
              </div>
              <h2 className="text-2xl font-serif mb-3">{selectedPractice.name}</h2>
              <p className="text-muted-foreground mb-6">{selectedPractice.description}</p>

              {selectedPractice.why_this_heals && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" /> Why This Heals
                  </h3>
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                    {selectedPractice.why_this_heals}
                  </div>
                </div>
              )}

              {selectedPractice.practice_guide && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-400" /> Practice Guide
                  </h3>
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-muted-foreground whitespace-pre-line leading-relaxed max-h-64 overflow-y-auto">
                    {selectedPractice.practice_guide}
                  </div>
                </div>
              )}

              {selectedPractice.safety_notes && (
                <div className="mb-4" data-testid="masculine-practice-safety-notes-panel">
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-400" /> Safety Notes
                  </h3>
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                    {selectedPractice.safety_notes}
                  </div>
                </div>
              )}

              {Array.isArray(selectedPractice.integration_actions) && selectedPractice.integration_actions.length > 0 && (
                <div className="mb-4" data-testid="masculine-practice-integration-actions-panel">
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" /> Integration Actions
                  </h3>
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <ul className="space-y-1.5">
                      {selectedPractice.integration_actions.map((step, index) => (
                        <li key={`${selectedPractice.id || selectedPractice.name}-integration-${index}`} className="text-sm text-muted-foreground">• {step}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {selectedPractice.extended_teachings && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-violet-400" /> Deeper Teachings
                  </h3>
                  <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 text-sm text-muted-foreground whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
                    {selectedPractice.extended_teachings}
                  </div>
                </div>
              )}

              <div className="mb-4 p-4 rounded-xl bg-primary/5 border border-primary/20" data-testid="masculine-practice-ritual-depth-panel">
                <h3 className="text-sm font-medium mb-2">Embodied Ritual Delivery</h3>
                <ul className="space-y-1.5">
                  {ritualDeliveryPillars.map((pillar) => (
                    <li key={pillar} className="text-xs text-muted-foreground">• {pillar}</li>
                  ))}
                </ul>
              </div>

              {benefits.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">Benefits</h3>
                  <div className="flex flex-wrap gap-2">
                    {benefits.map((benefit, index) => (
                      <span key={`${selectedPractice.id || selectedPractice.name}-benefit-${String(benefit).slice(0, 24)}-${index}`} className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <GuidedAudioButton
                  api={api}
                  script={composeDeepGuidedNarration({
                    title: selectedPractice.name,
                    element: selectedPractice.element || "Fire",
                    description: selectedPractice.description,
                    teachings: [selectedPractice.extended_teachings],
                    rituals: [selectedPractice.practice_guide],
                    embodiment: [selectedPractice.why_this_heals, ...ritualDeliveryPillars],
                  })}
                  label="Listen to Guided Practice"
                  className="flex-1"
                  durationMinutes={resolveDurationMinutes(selectedPractice.duration_minutes, 20)}
                />
                <AddToJournal
                  practiceName={selectedPractice.name}
                  practiceType="masculine"
                  duration={resolveDurationMinutes(selectedPractice.duration_minutes, 20)}
                  buttonVariant="outline"
                  buttonSize="default"
                />
                <button
                  onClick={() => setSelectedPractice(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  data-testid="masculine-practice-close-btn"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};