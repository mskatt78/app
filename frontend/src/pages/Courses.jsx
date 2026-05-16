import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, Clock, Star, Users, Play, ChevronRight, ExternalLink, Loader2, Heart, ChevronDown, Flame, Wind, Sparkles, Leaf, Scroll, Lock, Calendar, Shield, CreditCard, CheckCircle2, Unlock, Share2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import ShareToCircle from "../components/ShareToCircle";
import GuidedPracticeOverlay from "../components/GuidedPracticeOverlay";
import { COURSE_IMAGES, LEVEL_COLORS, FORMAT_ICONS } from "./courses/courseConstants";
import { isLoggedIn } from "../utils/clientStorage";
import { CourseCard } from "../components/courses/CourseCard";
import { CourseDetailModal } from "./courses/CourseDetailModal";
import { useCoursePayments } from "./courses/useCoursePayments";

const api = axios.create({ baseURL: `${process.env.REACT_APP_BACKEND_URL}/api` });

export default function Courses() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [filterLevel, setFilterLevel] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("rites");
  const [expandedRite, setExpandedRite] = useState(null);
  const [expandedRitual, setExpandedRitual] = useState(null);
  const [showShare, setShowShare] = useState(false);
  const [showGuided, setShowGuided] = useState(false);

  const {
    purchaseLoading,
    checkingPayment,
    fetchCourseAccess,
    handlePurchase,
    handleBundlePurchase,
    hasAccess,
  } = useCoursePayments({ api, navigate, searchParams });

  const fetchCourses = useCallback(async () => {
    try {
      const { data } = await api.get("/courses");
      setCourses(data);
    } catch (error) {
      console.error("Failed loading courses:", error);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
    fetchCourseAccess();
  }, [fetchCourseAccess, fetchCourses]);

  const getCourseImage = (course) => COURSE_IMAGES[course.id] || course.image_url;
  const allCoursesUnlocked = courses.length > 0 && courses.every(c => hasAccess(c.id));

  const categories = ["all", ...new Set(courses.map(c => c.category).filter(Boolean))];
  const levels = ["all", "beginner", "intermediate", "advanced"];

  const filtered = courses.filter(c => {
    if (filterLevel !== "all" && c.level?.toLowerCase() !== filterLevel) return false;
    if (filterCategory !== "all" && c.category !== filterCategory) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background" data-testid="courses-page">
      {/* Payment verification overlay */}
      {checkingPayment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center p-8 rounded-2xl bg-card border border-white/10">
            <Loader2 className="w-12 h-12 animate-spin text-violet-400 mx-auto mb-4" />
            <h3 className="text-xl font-serif mb-2">Verifying Payment...</h3>
            <p className="text-muted-foreground text-sm">Please wait while we confirm your purchase.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-violet-950/40 to-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mb-4 text-muted-foreground" data-testid="courses-back-btn">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-violet-500/10">
              <BookOpen className="w-8 h-8 text-violet-400" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-serif">Courses</h1>
              <p className="text-muted-foreground mt-1">Live & recorded teachings for your spiritual journey</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="flex gap-2 flex-wrap">
            {levels.map(level => (
              <button
                key={level}
                onClick={() => setFilterLevel(level)}
                className={`px-4 py-2 rounded-full text-sm capitalize transition-all ${
                  filterLevel === level ? "bg-violet-500/20 text-violet-300 border border-violet-500/40" : "bg-white/5 text-muted-foreground hover:bg-white/10"
                }`}
                data-testid={`filter-level-${level}`}
              >
                {level === "all" ? "All Levels" : level}
              </button>
            ))}
          </div>
          {categories.length > 2 && (
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm capitalize transition-all ${
                    filterCategory === cat ? "bg-primary/20 text-primary border border-primary/40" : "bg-white/5 text-muted-foreground hover:bg-white/10"
                  }`}
                >
                  {cat === "all" ? "All Categories" : cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h2 className="text-2xl font-serif mb-2">Courses Coming Soon</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Sacred teachings are being prepared. Check back soon for live and recorded courses on breathwork, meditation, shamanic practices, and more.
            </p>
          </div>
        ) : (
          <>
            {/* Bundle Offer */}
            {!allCoursesUnlocked && courses.length > 0 && (
              <div className="mb-8 p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5" data-testid="bundle-offer">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full text-xs bg-amber-500/20 text-amber-300 mb-2">Save $124</span>
                    <h3 className="text-xl font-serif mb-1">All Sacred Rites Bundle</h3>
                    <p className="text-sm text-muted-foreground">Get all 3 courses: Munay Ki, Nusta Karpay & 13th Rite of the Womb</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-2xl font-medium text-amber-300">$397</span>
                      <span className="text-sm text-muted-foreground line-through ml-2">$521</span>
                    </div>
                    <Button onClick={handleBundlePurchase} disabled={purchaseLoading} className="bg-amber-500 hover:bg-amber-600" data-testid="bundle-purchase-btn">
                      {purchaseLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CreditCard className="w-4 h-4 mr-2" /> Unlock All</>}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((course, index) => {
                const userHasAccess = hasAccess(course.id);
                const courseImage = getCourseImage(course);
                return (
                  <CourseCard
                    key={course.id}
                    course={course}
                    index={index}
                    userHasAccess={userHasAccess}
                    courseImage={courseImage}
                    levelColors={LEVEL_COLORS}
                    onSelect={() => {
                      setSelectedCourse(course);
                      setActiveTab(course.rites?.length ? "rites" : "overview");
                      setExpandedRite(null);
                      setExpandedRitual(null);
                    }}
                  />
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* Course Detail Modal */}
      <AnimatePresence>
        {selectedCourse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => { setSelectedCourse(null); setActiveTab("rites"); setExpandedRite(null); setExpandedRitual(null); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-card border border-white/10 overflow-hidden"
              data-testid="course-detail-modal"
            >
              {/* Hero image + close */}
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
                <button
                  onClick={() => { setSelectedCourse(null); setActiveTab("rites"); setExpandedRite(null); setExpandedRitual(null); }}
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

              {/* Description */}
              <div className="px-5 pt-3 pb-2 flex-shrink-0">
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedCourse.description}</p>
              </div>

              {/* Purchase section for premium courses */}
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

              {/* Purchased indicator */}
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

              {/* Tabs - only if deep content exists */}
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
        )}
      </AnimatePresence>

      {/* Share to Sacred Circle Modal */}
      <AnimatePresence>
        {showShare && selectedCourse && (
          <ShareToCircle
            practiceTitle={selectedCourse.title}
            practiceType="journey"
            defaultElement="Spirit"
            onClose={() => setShowShare(false)}
          />
        )}
      </AnimatePresence>

      {/* Guided Practice Full-Screen Overlay (Daily Practice) */}
      <AnimatePresence>
        {showGuided && selectedCourse?.daily_practice && (
          <GuidedPracticeOverlay
            practice={{
              name: selectedCourse.daily_practice.name || `${selectedCourse.title} — Daily Practice`,
              duration_minutes: selectedCourse.daily_practice.duration?.replace(/\D/g, '') * 1 || 20,
              element: "Spirit",
              steps: selectedCourse.daily_practice.steps,
            }}
            onExit={() => setShowGuided(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
