import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  ChevronDown,
  ExternalLink,
  Flame,
  Heart,
  Leaf,
  Lock,
  Play,
  Scroll,
  Shield,
  Sparkles,
  Wind,
  CheckCircle2,
} from "lucide-react";
import { Button } from "../ui/button";
import { CourseJourneyTimeline } from "./CourseJourneyTimeline";

export const CourseModalContent = ({
  activeTab,
  selectedCourse,
  expandedRite,
  setExpandedRite,
  expandedRitual,
  setExpandedRitual,
  hasAccess,
  handlePurchase,
  purchaseLoading,
  setShowGuided,
}) => (
  <div className="flex-1 overflow-y-auto">
    {activeTab === "rites" && selectedCourse.rites?.length > 0 && (
      <div className="p-4 space-y-3" data-testid="rites-tab-content">
        {selectedCourse.rites.map((rite, i) => (
          <div key={`${selectedCourse.id}-rite-${rite.name || i}`} className="rounded-xl border border-violet-500/20 bg-violet-500/5 overflow-hidden">
            <button
              onClick={() => setExpandedRite(expandedRite === i ? null : i)}
              className="w-full flex items-start justify-between p-4 text-left hover:bg-violet-500/10 transition-colors"
              data-testid={`rite-${i}`}
            >
              <div className="flex items-start gap-3 flex-1">
                <span className="w-7 h-7 rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {rite.number || i + 1}
                </span>
                <div>
                  <p className="font-medium text-sm text-violet-100">{rite.name}</p>
                  {rite.type && <p className="text-xs text-muted-foreground mt-0.5">{rite.type}</p>}
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 mt-1 transition-transform ${expandedRite === i ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {expandedRite === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  <div className="px-4 pb-4 space-y-3 border-t border-violet-500/10">
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line pt-3">{rite.description}</p>
                    {rite.what_it_heals && (
                      <div className="p-3 rounded-lg bg-white/5">
                        <p className="text-xs text-violet-300 font-medium mb-1">What It Heals</p>
                        <p className="text-xs text-muted-foreground">{rite.what_it_heals}</p>
                      </div>
                    )}
                    {rite.embodiment_practice && (
                      <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
                        <p className="text-xs text-violet-300 font-medium mb-2"><Sparkles className="w-3 h-3 inline mr-1" />Embodiment Practice: {rite.embodiment_practice.name}</p>
                        <ol className="space-y-1.5">
                          {rite.embodiment_practice.steps?.map((step, si) => (
                            <li key={`${selectedCourse.id}-rite-step-${i}-${String(step).slice(0, 24)}-${si}`} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <span className="w-4 h-4 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">{si + 1}</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    )}

    {activeTab === "rituals" && selectedCourse.rituals?.length > 0 && (
      <div className="p-4 space-y-4" data-testid="rituals-tab-content">
        {selectedCourse.rituals.map((ritual, i) => (
          <div key={`${selectedCourse.id}-ritual-${ritual.name || i}`} className="rounded-xl border border-amber-500/20 bg-amber-500/5 overflow-hidden">
            <button onClick={() => setExpandedRitual(expandedRitual === i ? null : i)} className="w-full flex items-start justify-between p-4 text-left hover:bg-amber-500/10 transition-colors" data-testid={`ritual-${i}`}>
              <div className="flex-1">
                <p className="font-medium text-sm text-amber-100">{ritual.name}</p>
                <div className="flex gap-3 mt-1">
                  {ritual.timing && <p className="text-xs text-muted-foreground">{ritual.timing}</p>}
                  {ritual.duration && <p className="text-xs text-amber-400/70">{ritual.duration}</p>}
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 mt-1 transition-transform ${expandedRitual === i ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {expandedRitual === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  <div className="px-4 pb-4 border-t border-amber-500/10 pt-3 space-y-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">{ritual.description}</p>
                    {ritual.what_you_need?.length > 0 && (
                      <div className="p-3 rounded-lg bg-white/5">
                        <p className="text-xs text-amber-300 font-medium mb-2">You will need:</p>
                        <ul className="space-y-1">
                          {ritual.what_you_need.map((item, wi) => (
                            <li key={`${selectedCourse.id}-ritual-need-${i}-${String(item).slice(0, 24)}-${wi}`} className="text-xs text-muted-foreground flex items-center gap-2">
                              <span className="w-1 h-1 rounded-full bg-amber-400/60 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    )}

    {activeTab === "embodiment" && selectedCourse.embodiment_practices?.length > 0 && (
      <div className="p-4 space-y-4" data-testid="embodiment-tab-content">
        {selectedCourse.embodiment_practices.map((practice, i) => (
          <div key={`${selectedCourse.id}-embodiment-${practice.name || i}`} className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-sm text-rose-100">{practice.name}</p>
                <div className="flex gap-2 mt-1">
                  {practice.type && <span className="text-xs text-rose-300/70 bg-rose-500/10 px-2 py-0.5 rounded-full">{practice.type}</span>}
                  {practice.duration && <span className="text-xs text-muted-foreground">{practice.duration}</span>}
                </div>
              </div>
              <Heart className="w-4 h-4 text-rose-400 flex-shrink-0 mt-1" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{practice.description}</p>
          </div>
        ))}
      </div>
    )}

    {activeTab === "prepare" && (
      <div className="p-4 space-y-4" data-testid="prepare-tab-content">
        {selectedCourse.preparation && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <div className="flex items-center gap-2 mb-3"><Leaf className="w-4 h-4 text-emerald-400" /><p className="font-medium text-sm text-emerald-200">Preparing to Receive</p></div>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{selectedCourse.preparation}</p>
          </div>
        )}
        {selectedCourse.integration_guidance && (
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
            <div className="flex items-center gap-2 mb-3"><Wind className="w-4 h-4 text-blue-400" /><p className="font-medium text-sm text-blue-200">Integration Guidance</p></div>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{selectedCourse.integration_guidance}</p>
          </div>
        )}
      </div>
    )}

    {activeTab === "daily" && selectedCourse.daily_practice && (
      <div className="p-4 space-y-4" data-testid="daily-tab-content">
        <div className="flex items-center gap-3 mb-1"><Sparkles className="w-5 h-5 text-emerald-400" /><h3 className="font-serif text-emerald-200">{selectedCourse.daily_practice.name}</h3></div>
        {selectedCourse.daily_practice.steps?.length > 0 && (
          <div className="space-y-2">
            {(hasAccess(selectedCourse.id) ? selectedCourse.daily_practice.steps : selectedCourse.daily_practice.steps.slice(0, 3)).map((step, si) => (
              <div key={`${selectedCourse.id}-daily-step-${String(step).slice(0, 24)}-${si}`} className="flex items-start gap-2 text-sm text-muted-foreground p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">{si + 1}</span>
                <span className="leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        )}
        {hasAccess(selectedCourse.id) && selectedCourse.daily_practice.steps?.length > 0 && (
          <Button onClick={() => setShowGuided(true)} className="w-full bg-emerald-500/80 hover:bg-emerald-500 flex items-center justify-center gap-2" data-testid="course-guided-btn">
            <Play className="w-4 h-4" /> Start Guided Practice
          </Button>
        )}
      </div>
    )}

    {activeTab === "journey" && selectedCourse.forty_day_integration && (
      <div className="p-4 space-y-4" data-testid="journey-tab-content">
        <CourseJourneyTimeline
          selectedCourse={selectedCourse}
          hasAccess={hasAccess(selectedCourse.id)}
        />

        <div className="rounded-xl border border-amber-500/20 bg-black/20 p-3" data-testid="journey-days-map">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-xs uppercase tracking-wider text-amber-300 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              40-Day Journey Map
            </p>
            <span className="text-[11px] text-muted-foreground">Full integration timeline</span>
          </div>
          <div className="flex flex-wrap gap-2" data-testid="journey-phase-chips">
            {selectedCourse.forty_day_integration.phases?.map((phase, idx) => (
              <span
                key={`${selectedCourse.id}-phase-chip-${phase.days || idx}`}
                className="px-2 py-1 rounded-full text-[11px] bg-amber-500/10 border border-amber-500/30 text-amber-200"
                data-testid={`journey-phase-chip-${idx}`}
              >
                {phase.days}
              </span>
            ))}
          </div>
        </div>

        {selectedCourse.forty_day_integration.overview && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <p className="text-sm text-muted-foreground leading-relaxed">{selectedCourse.forty_day_integration.overview}</p>
          </div>
        )}
        {selectedCourse.forty_day_integration.phases?.map((phase, idx) => {
          const isLocked = idx > 0 && !hasAccess(selectedCourse.id);
          return (
            <div key={`${selectedCourse.id}-phase-${phase.title || idx}`} className="rounded-xl border border-amber-500/20 bg-amber-500/5 overflow-hidden">
              <div className="p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs text-amber-400 font-medium bg-amber-500/10 px-2 py-0.5 rounded-full">{phase.days}</span>
                  {isLocked && <Lock className="w-4 h-4 text-amber-400/60" />}
                </div>
                <h4 className="font-serif text-amber-100 mb-2">{phase.title}</h4>
                {isLocked ? (
                  <div className="text-center py-3 space-y-2">
                    <p className="text-xs text-muted-foreground">{phase.focus?.slice(0, 120)}...</p>
                    {phase.daily_focus && (
                      <p className="text-[11px] text-amber-200/80">Daily focus: {phase.daily_focus.slice(0, 90)}...</p>
                    )}
                    <Button size="sm" onClick={() => handlePurchase(selectedCourse)} disabled={purchaseLoading} className="bg-violet-500 hover:bg-violet-600 text-xs">
                      <Lock className="w-3 h-3 mr-1" />Unlock Course — ${selectedCourse.price}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">{phase.focus}</p>
                    {phase.daily_focus && (
                      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <p className="text-xs text-amber-300 font-medium mb-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Daily Focus
                        </p>
                        <p className="text-xs text-muted-foreground">{phase.daily_focus}</p>
                      </div>
                    )}
                    {phase.journaling_prompts?.length > 0 && (
                      <div>
                        <p className="text-xs text-amber-300 font-medium mb-2">Journaling Prompts</p>
                        <ul className="space-y-1.5">
                          {phase.journaling_prompts.map((prompt, pi) => (
                            <li
                              key={`${selectedCourse.id}-journey-prompt-${idx}-${pi}`}
                              className="flex items-start gap-2 text-xs text-muted-foreground"
                            >
                              <span className="text-amber-400 mt-0.5 flex-shrink-0">•</span>
                              <span className="leading-relaxed">{prompt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    )}

    {activeTab === "safety" && selectedCourse.safety_precautions && (
      <div className="p-4" data-testid="safety-tab-content">
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <div className="flex items-center gap-2 mb-3"><Shield className="w-4 h-4 text-red-400" /><h3 className="font-medium text-red-300 text-sm">Safety & Precautions</h3></div>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{selectedCourse.safety_precautions}</p>
        </div>
      </div>
    )}

    {activeTab === "overview" && selectedCourse.highlights && (
      <div className="p-4">
        <h3 className="text-sm font-medium mb-3 text-violet-300">What You&apos;ll Learn</h3>
        <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{selectedCourse.highlights}</div>
      </div>
    )}

    {!selectedCourse.rites?.length && !selectedCourse.rituals?.length && !selectedCourse.embodiment_practices?.length && selectedCourse.highlights && (
      <div className="p-4">
        <h3 className="text-sm font-medium mb-3 text-violet-300">What You&apos;ll Learn</h3>
        <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{selectedCourse.highlights}</div>
      </div>
    )}

    {selectedCourse.price && (
      <div className="p-4 pt-0">
        <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-between">
          <span className="text-violet-300 text-lg font-medium">${selectedCourse.price}</span>
          {selectedCourse.registration_link ? (
            <a href={selectedCourse.registration_link} target="_blank" rel="noopener noreferrer" className="px-5 py-2 rounded-full bg-violet-500 text-white text-sm hover:bg-violet-600 transition-colors flex items-center gap-2" data-testid="course-register-btn">
              Enrol Now <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <span className="text-sm text-muted-foreground">Contact for enrollment</span>
          )}
        </div>
      </div>
    )}
  </div>
);