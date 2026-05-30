import { motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Loader2,
  Scroll,
  Flame,
  Heart,
  Leaf,
  Sparkles,
  Calendar,
  Shield,
  Share2,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { CourseDetailModal } from "./CourseDetailModal";

export const CoursesModalShell = ({
  selectedCourse,
  getCourseImage,
  setSelectedCourse,
  setActiveTab,
  setExpandedRite,
  setExpandedRitual,
  setShowShare,
  hasAccess,
  purchaseLoading,
  handlePurchase,
  activeTab,
  expandedRite,
  expandedRitual,
  setShowGuided,
}) => {
  if (!selectedCourse) return null;

  const resetModal = () => {
    setSelectedCourse(null);
    setActiveTab("rites");
    setExpandedRite(null);
    setExpandedRitual(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={resetModal}
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
          ) : (
            <div className="h-32 bg-gradient-to-br from-violet-500/20 to-indigo-500/10 flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-violet-400/40" />
            </div>
          )}
          <button onClick={resetModal} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors" data-testid="close-course-modal">
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
          <button onClick={() => setShowShare(true)} className="absolute top-3 right-14 w-9 h-9 rounded-full bg-black/60 flex items-center justify-center hover:bg-rose-500/20 transition-colors" title="Share your experience to Sacred Circle" data-testid="course-share-btn">
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
              <p className="text-[10px] text-muted-foreground mt-2">Secure payment via Stripe. Lifetime access included.</p>
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
              <button
                onClick={() => setActiveTab("rites")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeTab === "rites" ? "bg-violet-500 text-white" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}
                data-testid="tab-rites"
              >
                <Scroll className="w-3 h-3 inline mr-1" />The Rites
              </button>
            )}
            {selectedCourse.rituals?.length > 0 && (
              <button
                onClick={() => setActiveTab("rituals")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeTab === "rituals" ? "bg-violet-500 text-white" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}
                data-testid="tab-rituals"
              >
                <Flame className="w-3 h-3 inline mr-1" />Rituals
              </button>
            )}
            {selectedCourse.embodiment_practices?.length > 0 && (
              <button
                onClick={() => setActiveTab("embodiment")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeTab === "embodiment" ? "bg-violet-500 text-white" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}
                data-testid="tab-embodiment"
              >
                <Heart className="w-3 h-3 inline mr-1" />Embodiment
              </button>
            )}
            {selectedCourse.preparation && (
              <button
                onClick={() => setActiveTab("prepare")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeTab === "prepare" ? "bg-violet-500 text-white" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}
                data-testid="tab-prepare"
              >
                <Leaf className="w-3 h-3 inline mr-1" />Prepare & Integrate
              </button>
            )}
            {selectedCourse.daily_practice && (
              <button
                onClick={() => setActiveTab("daily")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeTab === "daily" ? "bg-emerald-500 text-white" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}
                data-testid="tab-daily"
              >
                <Sparkles className="w-3 h-3 inline mr-1" />Daily Practice
              </button>
            )}
            {selectedCourse.forty_day_integration && (
              <button
                onClick={() => setActiveTab("journey")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeTab === "journey" ? "bg-amber-500 text-white" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}
                data-testid="tab-journey"
              >
                <Calendar className="w-3 h-3 inline mr-1" />40-Day Journey
              </button>
            )}
            {selectedCourse.safety_precautions && (
              <button
                onClick={() => setActiveTab("safety")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeTab === "safety" ? "bg-red-500 text-white" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}
                data-testid="tab-safety"
              >
                <Shield className="w-3 h-3 inline mr-1" />Safety
              </button>
            )}
            {!selectedCourse.rites?.length && selectedCourse.highlights && (
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeTab === "overview" ? "bg-violet-500 text-white" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}
              >
                Overview
              </button>
            )}
          </div>
        )}

        <CourseDetailModal
          activeTab={activeTab}
          selectedCourse={selectedCourse}
          expandedRite={expandedRite}
          setExpandedRite={setExpandedRite}
          expandedRitual={expandedRitual}
          setExpandedRitual={setExpandedRitual}
          hasAccess={hasAccess}
          handlePurchase={handlePurchase}
          purchaseLoading={purchaseLoading}
          setShowGuided={setShowGuided}
        />
      </motion.div>
    </motion.div>
  );
};