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
import { getAuthToken, isLoggedIn } from "../utils/clientStorage";
import { CourseCard } from "../components/courses/CourseCard";

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
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showGuided, setShowGuided] = useState(false);

  const fetchCourseAccess = useCallback(async () => {
    if (!isLoggedIn()) return;
    try {
      const token = getAuthToken();
      const { data } = await api.get("/payments/course-access", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPurchasedCourses(data.purchased_courses || []);
      setHasSubscription(data.has_subscription || false);
    } catch (error) {
      console.error("Failed to fetch course access:", error);
    }
  }, []);

  const hasAccess = (courseId) => hasSubscription || purchasedCourses.includes(courseId);

  const pollPaymentStatus = useCallback(async (sessionId, attempts = 0) => {
    const maxAttempts = 10;
    if (attempts >= maxAttempts) {
      setCheckingPayment(false);
      toast.error("Payment verification timed out. Please check your email.");
      return;
    }
    try {
      const token = getAuthToken();
      const { data } = await api.get(`/payments/status/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.payment_status === "paid") {
        setCheckingPayment(false);
        toast.success("Payment successful! You now have access to the course.");
        fetchCourseAccess();
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      } else if (data.status === "expired") {
        setCheckingPayment(false);
        toast.error("Payment session expired.");
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }
      setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), 2000);
    } catch (error) {
      console.error("Payment status polling failed:", error);
      if (attempts < 9) setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), 2000);
      else { setCheckingPayment(false); toast.error("Error verifying payment."); }
    }
  }, [fetchCourseAccess]);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (sessionId && isLoggedIn()) {
      setCheckingPayment(true);
      pollPaymentStatus(sessionId);
    }
  }, [searchParams, pollPaymentStatus]);

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

  const handlePurchase = async (course) => {
    if (!isLoggedIn()) {
      toast.error("Please sign in to purchase courses");
      navigate("/");
      return;
    }
    setPurchaseLoading(true);
    try {
      const token = getAuthToken();
      const { data } = await api.post("/payments/create-checkout", {
        product_type: "course",
        product_id: course.id,
        origin_url: window.location.origin,
        payment_method: "stripe"
      }, { headers: { Authorization: `Bearer ${token}` } });
      if (data.checkout_url) window.location.href = data.checkout_url;
      else toast.error("Could not create checkout session");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to start checkout");
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handleBundlePurchase = async () => {
    if (!isLoggedIn()) {
      toast.error("Please sign in to purchase");
      navigate("/");
      return;
    }
    setPurchaseLoading(true);
    try {
      const token = getAuthToken();
      const { data } = await api.post("/payments/create-checkout", {
        product_type: "bundle",
        product_id: "sacred-rites-bundle",
        origin_url: window.location.origin,
        payment_method: "stripe"
      }, { headers: { Authorization: `Bearer ${token}` } });
      if (data.checkout_url) window.location.href = data.checkout_url;
      else toast.error("Could not create checkout session");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to start checkout");
    } finally {
      setPurchaseLoading(false);
    }
  };

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

              {/* Tab content - scrollable */}
              <div className="flex-1 overflow-y-auto">
                {/* THE RITES TAB */}
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
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
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
                                    <p className="text-xs text-violet-300 font-medium mb-2">
                                      <Sparkles className="w-3 h-3 inline mr-1" />
                                      Embodiment Practice: {rite.embodiment_practice.name}
                                    </p>
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

                {/* RITUALS TAB */}
                {activeTab === "rituals" && selectedCourse.rituals?.length > 0 && (
                  <div className="p-4 space-y-4" data-testid="rituals-tab-content">
                    {selectedCourse.rituals.map((ritual, i) => (
                      <div key={`${selectedCourse.id}-ritual-${ritual.name || i}`} className="rounded-xl border border-amber-500/20 bg-amber-500/5 overflow-hidden">
                        <button
                          onClick={() => setExpandedRitual(expandedRitual === i ? null : i)}
                          className="w-full flex items-start justify-between p-4 text-left hover:bg-amber-500/10 transition-colors"
                          data-testid={`ritual-${i}`}
                        >
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
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
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
                                {ritual.steps?.length > 0 && (
                                  <div>
                                    <p className="text-xs text-amber-300 font-medium mb-2">Steps:</p>
                                    <ol className="space-y-2">
                                      {ritual.steps.map((step, si) => (
                                        <li key={`${selectedCourse.id}-ritual-step-${i}-${String(step).slice(0, 24)}-${si}`} className="flex items-start gap-2 text-xs text-muted-foreground">
                                          <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">{si + 1}</span>
                                          <span>{step}</span>
                                        </li>
                                      ))}
                                    </ol>
                                  </div>
                                )}
                                {ritual.closing && (
                                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                    <p className="text-xs text-amber-300 font-medium mb-1">Closing:</p>
                                    <p className="text-xs text-muted-foreground">{ritual.closing}</p>
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

                {/* EMBODIMENT PRACTICES TAB */}
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
                        {practice.steps?.length > 0 && (
                          <ol className="space-y-2">
                            {practice.steps.map((step, si) => (
                              <li key={`${selectedCourse.id}-embodiment-step-${i}-${String(step).slice(0, 24)}-${si}`} className="flex items-start gap-2 text-xs text-muted-foreground">
                                <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">{si + 1}</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* PREPARE & INTEGRATE TAB */}
                {activeTab === "prepare" && (
                  <div className="p-4 space-y-4" data-testid="prepare-tab-content">
                    {selectedCourse.preparation && (
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Leaf className="w-4 h-4 text-emerald-400" />
                          <p className="font-medium text-sm text-emerald-200">Preparing to Receive</p>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{selectedCourse.preparation}</p>
                      </div>
                    )}
                    {selectedCourse.integration_guidance && (
                      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Wind className="w-4 h-4 text-blue-400" />
                          <p className="font-medium text-sm text-blue-200">Integration Guidance</p>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{selectedCourse.integration_guidance}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* DAILY PRACTICE TAB */}
                {activeTab === "daily" && selectedCourse.daily_practice && (
                  <div className="p-4 space-y-4" data-testid="daily-tab-content">
                    <div className="flex items-center gap-3 mb-1">
                      <Sparkles className="w-5 h-5 text-emerald-400" />
                      <h3 className="font-serif text-emerald-200">{selectedCourse.daily_practice.name}</h3>
                      {selectedCourse.daily_practice.duration && (
                        <span className="text-xs text-muted-foreground">{selectedCourse.daily_practice.duration}</span>
                      )}
                    </div>
                    {selectedCourse.daily_practice.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed">{selectedCourse.daily_practice.description}</p>
                    )}
                    {selectedCourse.daily_practice.steps?.length > 0 && (
                      <div className="space-y-2">
                        {(hasAccess(selectedCourse.id)
                          ? selectedCourse.daily_practice.steps
                          : selectedCourse.daily_practice.steps.slice(0, 3)
                        ).map((step, si) => (
                          <div key={`${selectedCourse.id}-daily-step-${String(step).slice(0, 24)}-${si}`} className="flex items-start gap-2 text-sm text-muted-foreground p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">{si + 1}</span>
                            <span className="leading-relaxed">{step}</span>
                          </div>
                        ))}
                        {!hasAccess(selectedCourse.id) && selectedCourse.daily_practice.steps.length > 3 && (
                          <div className="relative rounded-xl overflow-hidden">
                            <div className="space-y-2 opacity-25 blur-[2px] pointer-events-none select-none">
                              {selectedCourse.daily_practice.steps.slice(3, 5).map((step, si) => (
                                <div key={`${selectedCourse.id}-daily-blur-${String(step).slice(0, 24)}-${si}`} className="flex items-start gap-2 text-sm p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">{si + 4}</span>
                                  <span>{step}</span>
                                </div>
                              ))}
                            </div>
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-[1px] rounded-xl gap-2">
                              <Lock className="w-5 h-5 text-amber-400" />
                              <p className="text-xs text-amber-300 font-medium">Purchase to unlock all steps</p>
                              <Button size="sm" onClick={() => handlePurchase(selectedCourse)} disabled={purchaseLoading} className="bg-violet-500 hover:bg-violet-600 text-xs px-4">
                                Unlock — ${selectedCourse.price}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Start Guided Practice button for purchased courses */}
                    {hasAccess(selectedCourse.id) && selectedCourse.daily_practice.steps?.length > 0 && (
                      <Button
                        onClick={() => setShowGuided(true)}
                        className="w-full bg-emerald-500/80 hover:bg-emerald-500 flex items-center justify-center gap-2"
                        data-testid="course-guided-btn"
                      >
                        <Play className="w-4 h-4" /> Start Guided Practice
                      </Button>
                    )}
                  </div>
                )}

                {/* 40-DAY JOURNEY TAB */}
                {activeTab === "journey" && selectedCourse.forty_day_integration && (
                  <div className="p-4 space-y-4" data-testid="journey-tab-content">
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
                                <p className="text-xs text-muted-foreground">{phase.focus?.slice(0, 80)}...</p>
                                <Button size="sm" onClick={() => handlePurchase(selectedCourse)} disabled={purchaseLoading} className="bg-violet-500 hover:bg-violet-600 text-xs">
                                  <Lock className="w-3 h-3 mr-1" />Unlock Course — ${selectedCourse.price}
                                </Button>
                              </div>
                            ) : (
                              <>
                                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{phase.focus}</p>
                                {phase.daily_focus && (
                                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-3">
                                    <p className="text-xs text-amber-300 font-medium mb-1">Daily Practice</p>
                                    <p className="text-xs text-muted-foreground">{phase.daily_focus}</p>
                                  </div>
                                )}
                                {phase.journaling_prompts?.length > 0 && (
                                  <div>
                                    <p className="text-xs text-amber-300 font-medium mb-2">Journal Prompts</p>
                                    <ul className="space-y-1.5">
                                      {phase.journaling_prompts.map((prompt, pi) => (
                                        <li key={`${selectedCourse.id}-prompt-${idx}-${String(prompt).slice(0, 24)}-${pi}`} className="flex items-start gap-2 text-xs text-muted-foreground">
                                          <span className="text-amber-400 mt-0.5 flex-shrink-0">•</span>
                                          <span className="leading-relaxed">{prompt}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* SAFETY TAB */}
                {activeTab === "safety" && selectedCourse.safety_precautions && (
                  <div className="p-4" data-testid="safety-tab-content">
                    <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Shield className="w-4 h-4 text-red-400" />
                        <h3 className="font-medium text-red-300 text-sm">Safety & Precautions</h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{selectedCourse.safety_precautions}</p>
                    </div>
                  </div>
                )}

                {/* OVERVIEW TAB (fallback for courses without deep content) */}
                {activeTab === "overview" && selectedCourse.highlights && (
                  <div className="p-4">
                    <h3 className="text-sm font-medium mb-3 text-violet-300">What You&apos;ll Learn</h3>
                    <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{selectedCourse.highlights}</div>
                  </div>
                )}

                {/* Default when no tabs */}
                {!selectedCourse.rites?.length && !selectedCourse.rituals?.length && !selectedCourse.embodiment_practices?.length && selectedCourse.highlights && (
                  <div className="p-4">
                    <h3 className="text-sm font-medium mb-3 text-violet-300">What You&apos;ll Learn</h3>
                    <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{selectedCourse.highlights}</div>
                  </div>
                )}

                {/* Enrol section */}
                {selectedCourse.price && (
                  <div className="p-4 pt-0">
                    <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-between">
                      <span className="text-violet-300 text-lg font-medium">${selectedCourse.price}</span>
                      {selectedCourse.registration_link ? (
                        <a
                          href={selectedCourse.registration_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 py-2 rounded-full bg-violet-500 text-white text-sm hover:bg-violet-600 transition-colors flex items-center gap-2"
                          data-testid="course-register-btn"
                        >
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
