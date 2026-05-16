import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CreditCard,
  ExternalLink,
  Flame,
  Heart,
  Leaf,
  Loader2,
  Lock,
  Play,
  Scroll,
  Shield,
  Share2,
  Sparkles,
  Wind,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import ShareToCircle from "../../components/ShareToCircle";
import GuidedPracticeOverlay from "../../components/GuidedPracticeOverlay";

export const CourseDetailModal = ({
  selectedCourse,
  onClose,
  activeTab,
  setActiveTab,
  expandedRite,
  setExpandedRite,
  expandedRitual,
  setExpandedRitual,
  getCourseImage,
  hasAccess,
  handlePurchase,
  purchaseLoading,
}) => {
  const [showShare, setShowShare] = useState(false);
  const [showGuided, setShowGuided] = useState(false);

  if (!selectedCourse) return null;

  return (
    <>
      <AnimatePresence>
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
            onClick={e => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-card border border-white/10 overflow-hidden"
            data-testid="course-detail-modal"
          >
            <div className="relative flex-shrink-0">
              {getCourseImage(selectedCourse) ? (
                <div className="relative h-48 overflow-hidden">
                  <img src={getCourseImage(selectedCourse)} alt={selectedCourse.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
                </div>
              ) : null}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
                data-testid="close-course-modal"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
              <button
                onClick={() => setShowShare(true)}
                className="absolute top-3 right-14 w-9 h-9 rounded-full bg-black/60 flex items-center justify-center hover:bg-rose-500/20 transition-colors"
                title="Share your experience to Sacred Circle"
                data-testid="course-share-btn"
              >
                <Share2 className="w-4 h-4 text-rose-300" />
              </button>
              <div className="absolute bottom-3 left-4 right-4">
                <div className="flex gap-2 flex-wrap mb-1">
                  {selectedCourse.category && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30">
                      {selectedCourse.category}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-serif text-white drop-shadow">{selectedCourse.title || selectedCourse.name}</h2>
              </div>
            </div>

            <div className="px-5 pt-3 pb-2 flex-shrink-0">
              <p className="text-sm text-muted-foreground leading-relaxed">{selectedCourse.description}</p>
            </div>

            {selectedCourse.is_premium && selectedCourse.price && !hasAccess(selectedCourse.id) && (
              <div className="px-5 pb-3 flex-shrink-0">
                <div className="p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-amber-500/10 border border-violet-500/20">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">One-time purchase</p>
                      <p className="text-2xl font-serif text-violet-300">${selectedCourse.price}</p>
                    </div>
                    <Button onClick={() => handlePurchase(selectedCourse)} disabled={purchaseLoading} className="bg-violet-500 hover:bg-violet-600 text-white px-6 py-2" data-testid="purchase-course-btn">
                      {purchaseLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing...</> : <><CreditCard className="w-4 h-4 mr-2" /> Unlock Course</>}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {selectedCourse.is_premium && hasAccess(selectedCourse.id) && (
              <div className="px-5 pb-3 flex-shrink-0">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-sm font-medium text-emerald-300">You have access to this course</p>
                    <p className="text-xs text-muted-foreground">Explore all the teachings below</p>
                  </div>
                </div>
              </div>
            )}

            {(selectedCourse.rites?.length > 0 || selectedCourse.rituals?.length > 0 || selectedCourse.embodiment_practices?.length > 0 || selectedCourse.daily_practice || selectedCourse.forty_day_integration || selectedCourse.safety_precautions) && (
              <div className="flex gap-1 px-4 pb-2 flex-shrink-0 border-b border-white/10 overflow-x-auto">
                {selectedCourse.rites?.length > 0 && (
                  <button onClick={() => setActiveTab("rites")} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeTab === "rites" ? "bg-violet-500 text-white" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`} data-testid="tab-rites"><Scroll className="w-3 h-3 inline mr-1" />The Rites</button>
                )}
                {selectedCourse.rituals?.length > 0 && (
                  <button onClick={() => setActiveTab("rituals")} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeTab === "rituals" ? "bg-violet-500 text-white" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`} data-testid="tab-rituals"><Flame className="w-3 h-3 inline mr-1" />Rituals</button>
                )}
                {selectedCourse.embodiment_practices?.length > 0 && (
                  <button onClick={() => setActiveTab("embodiment")} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeTab === "embodiment" ? "bg-violet-500 text-white" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`} data-testid="tab-embodiment"><Heart className="w-3 h-3 inline mr-1" />Embodiment</button>
                )}
                {selectedCourse.preparation && <button onClick={() => setActiveTab("prepare")} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeTab === "prepare" ? "bg-violet-500 text-white" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`} data-testid="tab-prepare"><Leaf className="w-3 h-3 inline mr-1" />Prepare & Integrate</button>}
                {selectedCourse.daily_practice && <button onClick={() => setActiveTab("daily")} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeTab === "daily" ? "bg-emerald-500 text-white" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`} data-testid="tab-daily"><Sparkles className="w-3 h-3 inline mr-1" />Daily Practice</button>}
                {selectedCourse.forty_day_integration && <button onClick={() => setActiveTab("journey")} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeTab === "journey" ? "bg-amber-500 text-white" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`} data-testid="tab-journey"><Calendar className="w-3 h-3 inline mr-1" />40-Day Journey</button>}
                {selectedCourse.safety_precautions && <button onClick={() => setActiveTab("safety")} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeTab === "safety" ? "bg-red-500 text-white" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`} data-testid="tab-safety"><Shield className="w-3 h-3 inline mr-1" />Safety</button>}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 text-sm text-muted-foreground">
              {activeTab === "rites" && selectedCourse.rites?.length > 0 && (
                <div className="space-y-3" data-testid="rites-tab-content">
                  {selectedCourse.rites.map((rite, i) => (
                    <div key={`${selectedCourse.id}-rite-${rite.name || i}`} className="rounded-xl border border-violet-500/20 bg-violet-500/5 overflow-hidden">
                      <button onClick={() => setExpandedRite(expandedRite === i ? null : i)} className="w-full flex items-start justify-between p-4 text-left hover:bg-violet-500/10 transition-colors" data-testid={`rite-${i}`}>
                        <div className="flex items-start gap-3 flex-1">
                          <span className="w-7 h-7 rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{rite.number || i + 1}</span>
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
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "daily" && selectedCourse.daily_practice && (
                <div className="space-y-4" data-testid="daily-tab-content">
                  <div className="flex items-center gap-3 mb-1">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-serif text-emerald-200">{selectedCourse.daily_practice.name}</h3>
                  </div>
                  {selectedCourse.daily_practice.steps?.length > 0 && (
                    <div className="space-y-2">
                      {selectedCourse.daily_practice.steps.map((step, si) => (
                        <div key={`${selectedCourse.id}-daily-step-${si}`} className="flex items-start gap-2 text-sm text-muted-foreground p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
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
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showShare && selectedCourse && (
          <ShareToCircle practiceTitle={selectedCourse.title} practiceType="journey" defaultElement="Spirit" onClose={() => setShowShare(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGuided && selectedCourse?.daily_practice && (
          <GuidedPracticeOverlay
            practice={{
              name: selectedCourse.daily_practice.name || `${selectedCourse.title} — Daily Practice`,
              duration_minutes: selectedCourse.daily_practice.duration?.replace(/\D/g, "") * 1 || 20,
              element: "Spirit",
              steps: selectedCourse.daily_practice.steps,
            }}
            onExit={() => setShowGuided(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};