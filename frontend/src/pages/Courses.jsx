import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, Clock, Star, Users, Play, ChevronRight, ExternalLink, Loader2, Heart, ChevronDown, Flame, Wind, Sparkles, Leaf, Scroll, Lock, Calendar, Shield, CreditCard, CheckCircle2, Unlock } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import axios from "axios";

const api = axios.create({ baseURL: `${process.env.REACT_APP_BACKEND_URL}/api` });

const LEVEL_COLORS = {
  beginner: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  intermediate: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  advanced: "bg-rose-500/10 text-rose-400 border-rose-500/30",
  all: "bg-violet-500/10 text-violet-400 border-violet-500/30",
};

const FORMAT_ICONS = {
  live: "Live",
  recorded: "Recorded",
  hybrid: "Hybrid",
  "self-paced": "Self-Paced",
};

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

  // Get auth token from localStorage
  const getAuthToken = () => localStorage.getItem("auth_token");
  const isLoggedIn = () => !!getAuthToken();

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    try {
      const { data } = await api.get("/courses");
      setCourses(data);
    } catch {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user's course access status
  const fetchCourseAccess = useCallback(async () => {
    if (!isLoggedIn()) return;
    try {
      const token = getAuthToken();
      const { data } = await api.get("/payments/course-access", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPurchasedCourses(data.purchased_courses || []);
      setHasSubscription(data.has_subscription || false);
    } catch (err) {
      console.log("Could not fetch course access:", err);
    }
  }, []);

  // Check if user has access to a course
  const hasAccess = (courseId) => {
    return hasSubscription || purchasedCourses.includes(courseId);
  };

  // Poll payment status after redirect
  const pollPaymentStatus = useCallback(async (sessionId, attempts = 0) => {
    const maxAttempts = 10;
    const pollInterval = 2000;

    if (attempts >= maxAttempts) {
      setCheckingPayment(false);
      toast.error("Payment verification timed out. Please check your email for confirmation.");
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
        // Clear URL params
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      } else if (data.status === "expired") {
        setCheckingPayment(false);
        toast.error("Payment session expired. Please try again.");
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      // Continue polling
      setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), pollInterval);
    } catch (error) {
      console.error("Error checking payment status:", error);
      if (attempts < maxAttempts - 1) {
        setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), pollInterval);
      } else {
        setCheckingPayment(false);
        toast.error("Error verifying payment. Please contact support.");
      }
    }
  }, [fetchCourseAccess]);

  // Check for payment return
  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (sessionId && isLoggedIn()) {
      setCheckingPayment(true);
      pollPaymentStatus(sessionId);
    }
  }, [searchParams, pollPaymentStatus]);

  useEffect(() => {
    fetchCourses();
    fetchCourseAccess();
  }, [fetchCourses, fetchCourseAccess]);

  // Handle course purchase
  const handlePurchase = async (course) => {
    if (!isLoggedIn()) {
      toast.error("Please sign in to purchase courses");
      navigate("/auth");
      return;
    }

    setPurchaseLoading(true);
    try {
      const token = getAuthToken();
      const originUrl = window.location.origin;
      
      const { data } = await api.post("/payments/create-checkout", {
        product_type: "course",
        product_id: course.id,
        origin_url: originUrl,
        payment_method: "stripe"
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        toast.error("Could not create checkout session");
      }
    } catch (err) {
      console.error("Purchase error:", err);
      toast.error(err.response?.data?.detail || "Failed to start checkout");
    } finally {
      setPurchaseLoading(false);
    }
  };

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
              <h1 className="text-4xl sm:text-5xl font-serif">Sacred Courses</h1>
              <p className="text-muted-foreground mt-1">Deep teachings and initiations for your spiritual journey</p>
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
                  {cat === "all" ? "All Categories" : cat.replace("_", " ")}
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course, index) => {
              const userHasAccess = hasAccess(course.id);
              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-all duration-300 group relative"
                  onClick={() => { setSelectedCourse(course); setActiveTab(course.rites?.length ? "rites" : "overview"); setExpandedRite(null); setExpandedRitual(null); }}
                  data-testid={`course-card-${course.id}`}
                >
                  {/* Premium/Access badges */}
                  {course.is_premium && (
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                      {userHasAccess ? (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-medium backdrop-blur-sm">
                          <Unlock className="w-2.5 h-2.5" /> Unlocked
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-medium backdrop-blur-sm">
                          <Lock className="w-2.5 h-2.5" /> Sacred Course
                        </span>
                      )}
                    </div>
                  )}

                  {course.image_url ? (
                    <div className="relative h-44 overflow-hidden">
                      <img src={course.image_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      {course.format && (
                        <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs bg-black/50 backdrop-blur-sm text-white border border-white/20">
                          {FORMAT_ICONS[course.format?.toLowerCase()] || course.format}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="h-32 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-violet-400/40" />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="text-lg font-serif mb-2 group-hover:text-violet-300 transition-colors">{course.title || course.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{course.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {course.duration && (
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration}</span>
                      )}
                      {course.lessons && (
                        <span className="flex items-center gap-1"><Play className="w-3 h-3" />{course.lessons} lessons</span>
                      )}
                      {course.instructor && (
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{course.instructor}</span>
                      )}
                    </div>
                    
                    {course.price && (
                      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                        {userHasAccess ? (
                          <span className="text-emerald-400 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Purchased
                          </span>
                        ) : (
                          <span className="text-violet-300 font-medium">${course.price}</span>
                        )}
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
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
                {selectedCourse.image_url ? (
                  <div className="relative h-48 overflow-hidden">
                    <img src={selectedCourse.image_url} alt={selectedCourse.title} className="w-full h-full object-cover" />
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
                <div className="absolute bottom-3 left-4 right-4">
                  <div className="flex gap-2 flex-wrap mb-1">
                    {selectedCourse.category && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30">
                        {selectedCourse.category.replace("_", " ")}
                      </span>
                    )}
                    {selectedCourse.level && (
                      <span className={`px-2 py-0.5 rounded-full text-xs border ${LEVEL_COLORS[selectedCourse.level?.toLowerCase()] || LEVEL_COLORS.all}`}>
                        {selectedCourse.level}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-serif text-white drop-shadow">{selectedCourse.title || selectedCourse.name}</h2>
                </div>
              </div>

              {/* Description */}
              <div className="px-5 pt-3 pb-2 flex-shrink-0">
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedCourse.description}</p>
                
                {/* Course highlights */}
                {selectedCourse.highlights && (
                  <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-violet-300 font-medium mb-2">What&apos;s Included:</p>
                    <div className="text-xs text-muted-foreground whitespace-pre-line">{selectedCourse.highlights}</div>
                  </div>
                )}
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
                      <Button
                        onClick={() => handlePurchase(selectedCourse)}
                        disabled={purchaseLoading}
                        className="bg-violet-500 hover:bg-violet-600 text-white px-6 py-2"
                        data-testid="purchase-course-btn"
                      >
                        {purchaseLoading ? (
                          <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing...</>
                        ) : (
                          <><CreditCard className="w-4 h-4 mr-2" /> Unlock Course</>
                        )}
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
              {(selectedCourse.rites?.length > 0 || selectedCourse.rituals?.length > 0 || selectedCourse.embodiment_practices?.length > 0) && (
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
                      <Flame className="w-3 h-3 inline mr-1" />Daily Practice
                    </button>
                  )}
                  {selectedCourse.forty_day_integration && (
                    <button
                      onClick={() => setActiveTab("calendar")}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeTab === "calendar" ? "bg-amber-500 text-white" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}
                      data-testid="tab-calendar"
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
                {/* Content lock for premium courses without access */}
                {selectedCourse.is_premium && !hasAccess(selectedCourse.id) && (activeTab === "rites" || activeTab === "rituals" || activeTab === "embodiment" || activeTab === "daily" || activeTab === "calendar") && (
                  <div className="p-8 text-center" data-testid="content-locked">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <Lock className="w-8 h-8 text-amber-400" />
                    </div>
                    <h3 className="text-lg font-serif mb-2">This Content is Locked</h3>
                    <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                      Purchase this sacred course to unlock the full teachings, rituals, and embodiment practices.
                    </p>
                    <Button
                      onClick={() => handlePurchase(selectedCourse)}
                      disabled={purchaseLoading}
                      className="bg-violet-500 hover:bg-violet-600"
                    >
                      {purchaseLoading ? (
                        <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing...</>
                      ) : (
                        <><CreditCard className="w-4 h-4 mr-2" /> Unlock for ${selectedCourse.price}</>
                      )}
                    </Button>
                  </div>
                )}

                {/* THE RITES TAB */}
                {activeTab === "rites" && selectedCourse.rites?.length > 0 && (hasAccess(selectedCourse.id) || !selectedCourse.is_premium) && (
                  <div className="p-4 space-y-3" data-testid="rites-tab-content">
                    {selectedCourse.rites.map((rite, i) => (
                      <div key={i} className="rounded-xl border border-violet-500/20 bg-violet-500/5 overflow-hidden">
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
                                        <li key={si} className="flex items-start gap-2 text-xs text-muted-foreground">
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
                {activeTab === "rituals" && selectedCourse.rituals?.length > 0 && (hasAccess(selectedCourse.id) || !selectedCourse.is_premium) && (
                  <div className="p-4 space-y-4" data-testid="rituals-tab-content">
                    {selectedCourse.rituals.map((ritual, i) => (
                      <div key={i} className="rounded-xl border border-amber-500/20 bg-amber-500/5 overflow-hidden">
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
                                        <li key={wi} className="text-xs text-muted-foreground flex items-center gap-2">
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
                                        <li key={si} className="flex items-start gap-2 text-xs text-muted-foreground">
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
                {activeTab === "embodiment" && selectedCourse.embodiment_practices?.length > 0 && (hasAccess(selectedCourse.id) || !selectedCourse.is_premium) && (
                  <div className="p-4 space-y-4" data-testid="embodiment-tab-content">
                    {selectedCourse.embodiment_practices.map((practice, i) => (
                      <div key={i} className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 space-y-3">
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
                              <li key={si} className="flex items-start gap-2 text-xs text-muted-foreground">
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

                {/* PREPARE & INTEGRATE TAB - always accessible */}
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
                    {selectedCourse.ceremony_preparation_guide && (
                      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <p className="font-medium text-sm text-amber-200">{selectedCourse.ceremony_preparation_guide.title}</p>
                        </div>
                        <p className="text-xs text-amber-400/70">Duration: {selectedCourse.ceremony_preparation_guide.duration}</p>
                        {selectedCourse.ceremony_preparation_guide.altar_items?.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-amber-300 mb-2">Sacred Altar Items:</p>
                            <ul className="space-y-1">
                              {selectedCourse.ceremony_preparation_guide.altar_items.map((item, i) => (
                                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                                  <span className="text-amber-400 mt-0.5">•</span>{item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {selectedCourse.ceremony_preparation_guide.preparation_steps?.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-amber-300 mb-2">Preparation Steps:</p>
                            <ol className="space-y-2">
                              {selectedCourse.ceremony_preparation_guide.preparation_steps.map((step, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">{i+1}</span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}
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
                {activeTab === "daily" && selectedCourse.daily_practice && (hasAccess(selectedCourse.id) || !selectedCourse.is_premium) && (
                  <div className="p-4 space-y-4" data-testid="daily-tab-content">
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 overflow-hidden">
                      <div className="p-4 bg-emerald-500/10 border-b border-emerald-500/20">
                        <div className="flex items-center gap-2 mb-1">
                          <Flame className="w-4 h-4 text-emerald-400" />
                          <h3 className="font-medium text-emerald-200">{selectedCourse.daily_practice.name}</h3>
                        </div>
                        <p className="text-xs text-emerald-400/70">Daily for 40 days — {selectedCourse.daily_practice.duration}</p>
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{selectedCourse.daily_practice.description}</p>
                      </div>
                      <div className="p-4">
                        <ol className="space-y-3">
                          {selectedCourse.daily_practice.steps?.map((step, i) => (
                            <li key={i} className="flex items-start gap-3 text-xs text-muted-foreground">
                              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">{i+1}</span>
                              <span className="leading-relaxed">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </div>
                )}

                {/* 40-DAY INTEGRATION CALENDAR TAB */}
                {activeTab === "calendar" && selectedCourse.forty_day_integration && (hasAccess(selectedCourse.id) || !selectedCourse.is_premium) && (
                  <div className="p-4 space-y-4" data-testid="calendar-tab-content">
                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-amber-400" />
                        <h3 className="font-medium text-sm text-amber-200">Your 40-Day Integration Journey</h3>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{selectedCourse.forty_day_integration.overview}</p>
                    </div>
                    <div className="space-y-3">
                      {selectedCourse.forty_day_integration.phases?.map((phase, i) => (
                        <div key={i} className="rounded-xl border border-white/10 bg-white/2 overflow-hidden">
                          <div className="p-3 bg-white/5 flex items-center gap-3">
                            <span className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold flex-shrink-0">{i+1}</span>
                            <div>
                              <p className="text-xs font-medium text-amber-200">{phase.days}</p>
                              <p className="text-sm font-medium">{phase.title}</p>
                            </div>
                          </div>
                          <div className="p-3 space-y-2">
                            <p className="text-xs text-muted-foreground leading-relaxed">{phase.focus}</p>
                            <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
                              <p className="text-[10px] text-emerald-400 font-medium mb-1">Daily Focus:</p>
                              <p className="text-xs text-muted-foreground">{phase.daily_focus}</p>
                            </div>
                            {phase.journaling_prompts?.length > 0 && (
                              <div className="p-2 rounded-lg bg-blue-500/5 border border-blue-500/15">
                                <p className="text-[10px] text-blue-400 font-medium mb-1">Journal Prompts:</p>
                                <ul className="space-y-1">
                                  {phase.journaling_prompts.map((prompt, pi) => (
                                    <li key={pi} className="text-xs text-muted-foreground flex items-start gap-1">
                                      <span className="text-blue-400">•</span>{prompt}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SAFETY TAB - always accessible */}
                {activeTab === "safety" && selectedCourse.safety_precautions && (
                  <div className="p-4" data-testid="safety-tab-content">
                    <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Shield className="w-4 h-4 text-red-400" />
                        <h3 className="font-medium text-sm text-red-200">Safety Precautions & Contraindications</h3>
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
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
