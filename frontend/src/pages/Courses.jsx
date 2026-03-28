import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, Clock, Star, Play, ChevronRight, Loader2, Heart, ChevronDown, Flame, Wind, Sparkles, Leaf, Scroll, Lock, Calendar, Shield, CreditCard, CheckCircle2, Unlock, X } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import axios from "axios";

const api = axios.create({ baseURL: `${process.env.REACT_APP_BACKEND_URL}/api` });

// Design system colors
const colors = {
  background: "#FDFBF7",
  surface: "#FFFFFF",
  primary: "#A96F6A",
  primaryHover: "#8A5652",
  secondary: "#E8D8CE",
  accent: "#D4AF37",
  textMain: "#3D2E2B",
  textMuted: "#7A706D",
  border: "#EAE1D9",
  success: "#6B8E73",
};

// Course images from design guidelines
const COURSE_IMAGES = {
  "munay-ki": "https://images.unsplash.com/photo-1738058235723-b8f91a40f638?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA4Mzl8MHwxfHNlYXJjaHwzfHx3b21lbiUyMHNwaXJpdHVhbCUyMHJldHJlYXQlMjBuYXR1cmV8ZW58MHx8fHwxNzc0NjQ5OTkzfDA&ixlib=rb-4.1.0&q=85",
  "nusta-karpay": "https://images.pexels.com/photos/13354024/pexels-photo-13354024.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  "13th-rite-womb": "https://images.pexels.com/photos/11435367/pexels-photo-11435367.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
};

const HERO_BG = "https://images.unsplash.com/photo-1752924477629-d6f5f6e6c40b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwxfHxnb2RkZXNzJTIwZmVtaW5pbmUlMjBiZWF1dGlmdWwlMjBmbG93ZXJzfGVufDB8fHx8MTc3NDY1MDA0Mnww&ixlib=rb-4.1.0&q=85";

export default function Courses() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState("rites");
  const [expandedRite, setExpandedRite] = useState(null);
  const [expandedRitual, setExpandedRitual] = useState(null);
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);

  const getAuthToken = () => localStorage.getItem("auth_token");
  const isLoggedIn = () => !!getAuthToken();

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
        toast.success("Payment successful! Welcome to your sacred journey.");
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
    } catch {
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

  useEffect(() => {
    fetchCourses();
    fetchCourseAccess();
  }, [fetchCourses, fetchCourseAccess]);

  const handlePurchase = async (course) => {
    if (!isLoggedIn()) {
      toast.error("Please sign in to begin your sacred journey");
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
      toast.error("Please sign in to begin your sacred journey");
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

  const allCoursesUnlocked = courses.length > 0 && courses.every(c => hasAccess(c.id));

  const getCourseImage = (course) => COURSE_IMAGES[course.id] || course.image_url;

  const tabs = [
    { id: "rites", label: "The Rites", icon: Scroll, check: (c) => c.rites?.length > 0 },
    { id: "rituals", label: "Rituals", icon: Flame, check: (c) => c.rituals?.length > 0 },
    { id: "embodiment", label: "Embodiment", icon: Heart, check: (c) => c.embodiment_practices?.length > 0 },
    { id: "prepare", label: "Prepare", icon: Leaf, check: (c) => c.preparation || c.ceremony_preparation_guide },
    { id: "daily", label: "Daily Practice", icon: Sparkles, check: (c) => c.daily_practice },
    { id: "calendar", label: "40-Day Journey", icon: Calendar, check: (c) => c.forty_day_integration },
    { id: "safety", label: "Safety", icon: Shield, check: (c) => c.safety_precautions },
  ];

  const activeTabs = selectedCourse ? tabs.filter(t => t.check(selectedCourse)) : [];
  const isContentLocked = (tabId) => selectedCourse?.is_premium && !hasAccess(selectedCourse.id) && ["rites", "rituals", "embodiment", "daily", "calendar"].includes(tabId);

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background, fontFamily: "'Inter', sans-serif" }} data-testid="courses-page">
      {/* Payment verification overlay */}
      {checkingPayment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ backgroundColor: "rgba(61, 46, 43, 0.6)", backdropFilter: "blur(8px)" }}>
          <div className="text-center p-10 rounded-3xl" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: colors.primary }} />
            <h3 className="text-xl mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: colors.textMain }}>Verifying Your Sacred Purchase...</h3>
            <p className="text-sm" style={{ color: colors.textMuted }}>Please wait while we confirm your initiation.</p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <header className="relative overflow-hidden" style={{ minHeight: "50vh" }}>
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="" className="w-full h-full object-cover" style={{ filter: "brightness(0.85)" }} />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${colors.background}20, ${colors.background}95)` }} />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 md:px-12 pt-8 pb-20">
          <button 
            onClick={() => navigate("/")} 
            className="inline-flex items-center gap-2 mb-12 px-4 py-2 rounded-full transition-all duration-300 hover:scale-105"
            style={{ color: colors.textMuted, backgroundColor: `${colors.surface}90`, backdropFilter: "blur(8px)" }}
            data-testid="courses-back-btn"
          >
            <ArrowLeft className="w-4 h-4" /> Return Home
          </button>
          
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.3em] mb-4" style={{ color: colors.primary, fontWeight: 600 }}>Sacred Initiations</p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl tracking-tight leading-tight mb-6" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, color: colors.textMain }}>
              The Sacred Rites
            </h1>
            <p className="text-lg md:text-xl leading-relaxed" style={{ color: colors.textMuted, maxWidth: "540px" }}>
              Ancient lineage transmissions for deep feminine healing. Each course is a portal to transformation, received with reverence and integrated over 40 sacred days.
            </p>
          </div>
        </div>
      </header>

      {/* Courses Grid */}
      <main className="max-w-6xl mx-auto px-6 md:px-12 py-16 md:py-24">
        {/* Bundle Offer - Only show if not all courses are unlocked */}
        {!loading && courses.length > 0 && !allCoursesUnlocked && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mb-16 p-8 md:p-10 rounded-3xl relative overflow-hidden"
            style={{ 
              background: `linear-gradient(135deg, ${colors.accent}15, ${colors.primary}10)`,
              border: `2px solid ${colors.accent}30`
            }}
            data-testid="bundle-offer"
          >
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${colors.accent}40, transparent)`, transform: "translate(30%, -30%)" }} />
            <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex-1">
                <span className="inline-block px-4 py-1.5 rounded-full text-xs uppercase tracking-[0.2em] font-semibold mb-4" style={{ backgroundColor: `${colors.accent}20`, color: colors.accent }}>
                  Save $124
                </span>
                <h2 className="text-3xl md:text-4xl mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", color: colors.textMain }}>
                  All Sacred Rites Bundle
                </h2>
                <p className="text-base leading-relaxed mb-4" style={{ color: colors.textMuted, maxWidth: "500px" }}>
                  Receive all three sacred initiations: Munay Ki, Nusta Karpay, and the 13th Rite of the Womb. Complete your feminine healing journey with lifetime access to every teaching.
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1 rounded-full text-xs" style={{ backgroundColor: colors.surface, color: colors.textMuted }}>Munay Ki ($197)</span>
                  <span className="px-3 py-1 rounded-full text-xs" style={{ backgroundColor: colors.surface, color: colors.textMuted }}>Nusta Karpay ($177)</span>
                  <span className="px-3 py-1 rounded-full text-xs" style={{ backgroundColor: colors.surface, color: colors.textMuted }}>13th Rite ($147)</span>
                </div>
              </div>
              <div className="text-center lg:text-right">
                <p className="text-xs uppercase tracking-[0.2em] mb-1" style={{ color: colors.textMuted }}>Bundle Price</p>
                <div className="flex items-baseline gap-2 mb-1 justify-center lg:justify-end">
                  <span className="text-4xl" style={{ fontFamily: "'Playfair Display', serif", color: colors.accent }}>$397</span>
                  <span className="text-lg line-through" style={{ color: colors.textMuted }}>$521</span>
                </div>
                <Button
                  onClick={handleBundlePurchase}
                  disabled={purchaseLoading}
                  className="mt-4 px-8 py-4 rounded-full font-medium tracking-wide transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: colors.accent, color: "white" }}
                  data-testid="bundle-purchase-btn"
                >
                  {purchaseLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing...</>
                  ) : (
                    <><CreditCard className="w-4 h-4 mr-2" /> Unlock All Three</>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin" style={{ color: colors.primary }} />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: `${colors.textMuted}40` }} />
            <h2 className="text-3xl mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", color: colors.textMain }}>Courses Coming Soon</h2>
            <p style={{ color: colors.textMuted }}>Sacred teachings are being prepared.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {courses.map((course, index) => {
              const userHasAccess = hasAccess(course.id);
              return (
                <motion.article
                  key={course.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  onClick={() => { setSelectedCourse(course); setActiveTab(course.rites?.length ? "rites" : "prepare"); setExpandedRite(null); setExpandedRitual(null); }}
                  className="cursor-pointer group flex flex-col h-full rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-3"
                  style={{ 
                    backgroundColor: colors.surface, 
                    border: `1px solid ${colors.border}`,
                    boxShadow: "0 8px 30px rgba(169,111,106,0.05)"
                  }}
                  data-testid={`course-card-${course.id}`}
                >
                  {/* Image */}
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img 
                      src={getCourseImage(course)} 
                      alt={course.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(61,46,43,0.7) 0%, transparent 50%)" }} />
                    
                    {/* Premium Badge */}
                    <div className="absolute top-4 left-4">
                      {userHasAccess ? (
                        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs uppercase tracking-widest font-semibold" 
                          style={{ backgroundColor: `${colors.success}20`, color: colors.success, border: `1px solid ${colors.success}30`, backdropFilter: "blur(8px)" }}>
                          <Unlock className="w-3 h-3" /> Unlocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs uppercase tracking-widest font-semibold"
                          style={{ backgroundColor: `${colors.secondary}80`, color: colors.primary, border: `1px solid ${colors.primary}15`, backdropFilter: "blur(8px)" }}>
                          <Lock className="w-3 h-3" /> Sacred
                        </span>
                      )}
                    </div>

                    {/* Title overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-2xl md:text-3xl text-white leading-snug" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}>
                        {course.title?.split("—")[0]?.trim() || course.title}
                      </h3>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6 md:p-8 flex flex-col">
                    <p className="text-sm leading-relaxed mb-6 flex-1" style={{ color: colors.textMuted }}>
                      {course.description?.substring(0, 140)}...
                    </p>
                    
                    <div className="flex items-center justify-between pt-4" style={{ borderTop: `1px solid ${colors.border}` }}>
                      <div className="flex items-center gap-4 text-xs" style={{ color: colors.textMuted }}>
                        {course.duration && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {course.duration}</span>}
                        {course.rites?.length > 0 && <span className="flex items-center gap-1"><Scroll className="w-3.5 h-3.5" /> {course.rites.length} rites</span>}
                      </div>
                      {course.price && (
                        <span className="text-lg font-medium" style={{ fontFamily: "'Playfair Display', serif", color: colors.primary }}>
                          ${course.price}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.article>
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            style={{ backgroundColor: "rgba(61, 46, 43, 0.5)", backdropFilter: "blur(4px)" }}
            onClick={() => { setSelectedCourse(null); setActiveTab("rites"); setExpandedRite(null); setExpandedRitual(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl overflow-hidden my-8"
              style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}`, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
              data-testid="course-detail-modal"
            >
              {/* Modal Header with Image */}
              <div className="relative flex-shrink-0">
                <div className="relative h-64 md:h-80 overflow-hidden">
                  <img src={getCourseImage(selectedCourse)} alt={selectedCourse.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${colors.background} 0%, ${colors.background}80 30%, transparent 60%)` }} />
                </div>
                
                {/* Close button */}
                <button
                  onClick={() => { setSelectedCourse(null); setActiveTab("rites"); setExpandedRite(null); setExpandedRitual(null); }}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  style={{ backgroundColor: `${colors.surface}90`, backdropFilter: "blur(8px)", color: colors.textMain }}
                  data-testid="close-course-modal"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Title and Description */}
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                  <p className="text-xs uppercase tracking-[0.25em] mb-3" style={{ color: colors.primary, fontWeight: 600 }}>
                    {selectedCourse.category?.replace("_", " ") || "Sacred Rite"}
                  </p>
                  <h2 className="text-3xl md:text-4xl tracking-tight leading-snug mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, color: colors.textMain }}>
                    {selectedCourse.title}
                  </h2>
                </div>
              </div>

              {/* Description & Purchase Section */}
              <div className="px-8 md:px-12 pb-6 flex-shrink-0" style={{ backgroundColor: colors.background }}>
                <p className="text-base leading-relaxed mb-6" style={{ color: colors.textMuted }}>
                  {selectedCourse.description}
                </p>

                {/* Highlights */}
                {selectedCourse.highlights && (
                  <div className="p-6 rounded-2xl mb-6" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
                    <p className="text-xs uppercase tracking-[0.2em] mb-3" style={{ color: colors.primary, fontWeight: 600 }}>What&apos;s Included</p>
                    <div className="text-sm leading-relaxed whitespace-pre-line" style={{ color: colors.textMuted }}>{selectedCourse.highlights}</div>
                  </div>
                )}

                {/* Purchase CTA for non-purchasers */}
                {selectedCourse.is_premium && selectedCourse.price && !hasAccess(selectedCourse.id) && (
                  <div className="p-6 md:p-8 rounded-2xl" style={{ background: `linear-gradient(135deg, ${colors.secondary}40, ${colors.primary}10)`, border: `1px solid ${colors.primary}20` }}>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] mb-1" style={{ color: colors.textMuted }}>One-time initiation</p>
                        <p className="text-4xl" style={{ fontFamily: "'Playfair Display', serif", color: colors.primary }}>${selectedCourse.price}</p>
                      </div>
                      <Button
                        onClick={() => handlePurchase(selectedCourse)}
                        disabled={purchaseLoading}
                        className="w-full md:w-auto px-8 py-4 rounded-full font-medium tracking-wide transition-all duration-300 hover:scale-105"
                        style={{ backgroundColor: colors.primary, color: "white" }}
                        data-testid="purchase-course-btn"
                      >
                        {purchaseLoading ? (
                          <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing...</>
                        ) : (
                          <><CreditCard className="w-4 h-4 mr-2" /> Begin Your Initiation</>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs mt-4" style={{ color: colors.textMuted }}>Secure payment via Stripe. Lifetime access to all teachings.</p>
                  </div>
                )}

                {/* Purchased indicator */}
                {selectedCourse.is_premium && hasAccess(selectedCourse.id) && (
                  <div className="p-5 rounded-2xl flex items-center gap-4" style={{ backgroundColor: `${colors.success}10`, border: `1px solid ${colors.success}25` }}>
                    <CheckCircle2 className="w-6 h-6" style={{ color: colors.success }} />
                    <div>
                      <p className="font-medium" style={{ color: colors.success }}>You have access to this sacred teaching</p>
                      <p className="text-sm" style={{ color: colors.textMuted }}>Explore all rites, rituals, and practices below</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Tabs */}
              {activeTabs.length > 0 && (
                <div className="px-8 md:px-12 flex-shrink-0 overflow-x-auto" style={{ backgroundColor: colors.background, borderBottom: `1px solid ${colors.border}` }}>
                  <div className="flex space-x-8 min-w-max">
                    {activeTabs.map(tab => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      const locked = isContentLocked(tab.id);
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className="relative py-4 px-1 whitespace-nowrap transition-colors duration-300 flex items-center gap-2"
                          style={{ 
                            color: isActive ? colors.primary : colors.textMuted,
                            borderBottom: isActive ? `2px solid ${colors.primary}` : "2px solid transparent",
                            fontWeight: isActive ? 500 : 400
                          }}
                          data-testid={`tab-${tab.id}`}
                        >
                          <Icon className="w-4 h-4" />
                          {tab.label}
                          {locked && <Lock className="w-3 h-3 ml-1" style={{ color: colors.accent }} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto" style={{ backgroundColor: colors.surface }}>
                {/* Locked Content Message */}
                {isContentLocked(activeTab) && (
                  <div className="p-12 text-center" data-testid="content-locked">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.accent}15` }}>
                      <Lock className="w-10 h-10" style={{ color: colors.accent }} />
                    </div>
                    <h3 className="text-2xl mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", color: colors.textMain }}>This Teaching is Sacred</h3>
                    <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: colors.textMuted }}>
                      Purchase this initiation to unlock the complete rites, rituals, and embodiment practices.
                    </p>
                    <Button
                      onClick={() => handlePurchase(selectedCourse)}
                      disabled={purchaseLoading}
                      className="px-8 py-4 rounded-full font-medium tracking-wide"
                      style={{ backgroundColor: colors.primary, color: "white" }}
                    >
                      {purchaseLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CreditCard className="w-4 h-4 mr-2" /> Unlock for ${selectedCourse.price}</>}
                    </Button>
                  </div>
                )}

                {/* THE RITES TAB */}
                {activeTab === "rites" && selectedCourse.rites?.length > 0 && !isContentLocked("rites") && (
                  <div className="p-8 md:p-12 space-y-4" data-testid="rites-tab-content">
                    {selectedCourse.rites.map((rite, i) => (
                      <div key={i} className="rounded-2xl overflow-hidden" style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}` }}>
                        <button
                          onClick={() => setExpandedRite(expandedRite === i ? null : i)}
                          className="w-full flex items-start justify-between p-6 text-left transition-colors duration-300 hover:bg-opacity-50"
                          style={{ backgroundColor: expandedRite === i ? `${colors.secondary}30` : "transparent" }}
                          data-testid={`rite-${i}`}
                        >
                          <div className="flex items-start gap-4 flex-1">
                            <span className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0"
                              style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}>
                              {rite.number || i + 1}
                            </span>
                            <div>
                              <p className="font-medium text-lg" style={{ fontFamily: "'Cormorant Garamond', serif", color: colors.textMain }}>{rite.name}</p>
                              {rite.type && <p className="text-xs mt-1" style={{ color: colors.textMuted }}>{rite.type}</p>}
                            </div>
                          </div>
                          <ChevronDown className={`w-5 h-5 flex-shrink-0 mt-2 transition-transform duration-300 ${expandedRite === i ? "rotate-180" : ""}`} style={{ color: colors.textMuted }} />
                        </button>
                        <AnimatePresence>
                          {expandedRite === i && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                              <div className="px-6 pb-6 space-y-4" style={{ borderTop: `1px solid ${colors.border}` }}>
                                <p className="text-sm leading-relaxed pt-4 whitespace-pre-line" style={{ color: colors.textMuted }}>{rite.description}</p>
                                {rite.what_it_heals && (
                                  <div className="p-4 rounded-xl" style={{ backgroundColor: `${colors.primary}08` }}>
                                    <p className="text-xs uppercase tracking-wider mb-2" style={{ color: colors.primary, fontWeight: 600 }}>What It Heals</p>
                                    <p className="text-sm" style={{ color: colors.textMuted }}>{rite.what_it_heals}</p>
                                  </div>
                                )}
                                {rite.embodiment_practice && (
                                  <div className="p-4 rounded-xl" style={{ backgroundColor: `${colors.secondary}30`, border: `1px solid ${colors.border}` }}>
                                    <p className="text-xs uppercase tracking-wider mb-3" style={{ color: colors.primary, fontWeight: 600 }}>
                                      <Sparkles className="w-3 h-3 inline mr-1" />Embodiment: {rite.embodiment_practice.name}
                                    </p>
                                    <ol className="space-y-2">
                                      {rite.embodiment_practice.steps?.map((step, si) => (
                                        <li key={si} className="flex items-start gap-3 text-sm" style={{ color: colors.textMuted }}>
                                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5"
                                            style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}>{si + 1}</span>
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
                {activeTab === "rituals" && selectedCourse.rituals?.length > 0 && !isContentLocked("rituals") && (
                  <div className="p-8 md:p-12 space-y-4" data-testid="rituals-tab-content">
                    {selectedCourse.rituals.map((ritual, i) => (
                      <div key={i} className="rounded-2xl overflow-hidden" style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}` }}>
                        <button
                          onClick={() => setExpandedRitual(expandedRitual === i ? null : i)}
                          className="w-full flex items-start justify-between p-6 text-left transition-colors"
                          style={{ backgroundColor: expandedRitual === i ? `${colors.accent}10` : "transparent" }}
                          data-testid={`ritual-${i}`}
                        >
                          <div className="flex-1">
                            <p className="font-medium text-lg" style={{ fontFamily: "'Cormorant Garamond', serif", color: colors.textMain }}>{ritual.name}</p>
                            <div className="flex gap-4 mt-2">
                              {ritual.timing && <p className="text-xs" style={{ color: colors.textMuted }}>{ritual.timing}</p>}
                              {ritual.duration && <p className="text-xs" style={{ color: colors.accent }}>{ritual.duration}</p>}
                            </div>
                          </div>
                          <ChevronDown className={`w-5 h-5 flex-shrink-0 mt-1 transition-transform duration-300 ${expandedRitual === i ? "rotate-180" : ""}`} style={{ color: colors.textMuted }} />
                        </button>
                        <AnimatePresence>
                          {expandedRitual === i && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                              <div className="px-6 pb-6 space-y-4" style={{ borderTop: `1px solid ${colors.border}` }}>
                                <p className="text-sm pt-4 leading-relaxed" style={{ color: colors.textMuted }}>{ritual.description}</p>
                                {ritual.what_you_need?.length > 0 && (
                                  <div className="p-4 rounded-xl" style={{ backgroundColor: `${colors.accent}08` }}>
                                    <p className="text-xs uppercase tracking-wider mb-2" style={{ color: colors.accent, fontWeight: 600 }}>You will need:</p>
                                    <ul className="space-y-1">
                                      {ritual.what_you_need.map((item, wi) => (
                                        <li key={wi} className="text-sm flex items-center gap-2" style={{ color: colors.textMuted }}>
                                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.accent }} />{item}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {ritual.steps?.length > 0 && (
                                  <div>
                                    <p className="text-xs uppercase tracking-wider mb-3" style={{ color: colors.primary, fontWeight: 600 }}>Steps:</p>
                                    <ol className="space-y-2">
                                      {ritual.steps.map((step, si) => (
                                        <li key={si} className="flex items-start gap-3 text-sm" style={{ color: colors.textMuted }}>
                                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5"
                                            style={{ backgroundColor: `${colors.accent}15`, color: colors.accent }}>{si + 1}</span>
                                          <span>{step}</span>
                                        </li>
                                      ))}
                                    </ol>
                                  </div>
                                )}
                                {ritual.closing && (
                                  <div className="p-4 rounded-xl" style={{ backgroundColor: `${colors.secondary}30` }}>
                                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: colors.primary, fontWeight: 600 }}>Closing:</p>
                                    <p className="text-sm" style={{ color: colors.textMuted }}>{ritual.closing}</p>
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
                {activeTab === "embodiment" && selectedCourse.embodiment_practices?.length > 0 && !isContentLocked("embodiment") && (
                  <div className="p-8 md:p-12 space-y-4" data-testid="embodiment-tab-content">
                    {selectedCourse.embodiment_practices.map((practice, i) => (
                      <div key={i} className="p-6 rounded-2xl space-y-4" style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}` }}>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium text-lg" style={{ fontFamily: "'Cormorant Garamond', serif", color: colors.textMain }}>{practice.name}</p>
                            <div className="flex gap-3 mt-2">
                              {practice.type && <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: `${colors.primary}10`, color: colors.primary }}>{practice.type}</span>}
                              {practice.duration && <span className="text-xs" style={{ color: colors.textMuted }}>{practice.duration}</span>}
                            </div>
                          </div>
                          <Heart className="w-5 h-5 flex-shrink-0" style={{ color: colors.primary }} />
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: colors.textMuted }}>{practice.description}</p>
                        {practice.steps?.length > 0 && (
                          <ol className="space-y-2">
                            {practice.steps.map((step, si) => (
                              <li key={si} className="flex items-start gap-3 text-sm" style={{ color: colors.textMuted }}>
                                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5"
                                  style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}>{si + 1}</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* PREPARE TAB - Always accessible */}
                {activeTab === "prepare" && (
                  <div className="p-8 md:p-12 space-y-6" data-testid="prepare-tab-content">
                    {selectedCourse.preparation && (
                      <div className="p-6 rounded-2xl" style={{ backgroundColor: `${colors.success}08`, border: `1px solid ${colors.success}20` }}>
                        <div className="flex items-center gap-2 mb-4">
                          <Leaf className="w-5 h-5" style={{ color: colors.success }} />
                          <p className="font-medium" style={{ fontFamily: "'Cormorant Garamond', serif", color: colors.textMain }}>Preparing to Receive</p>
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: colors.textMuted }}>{selectedCourse.preparation}</p>
                      </div>
                    )}
                    {selectedCourse.ceremony_preparation_guide && (
                      <div className="p-6 rounded-2xl space-y-4" style={{ backgroundColor: `${colors.accent}08`, border: `1px solid ${colors.accent}20` }}>
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5" style={{ color: colors.accent }} />
                          <p className="font-medium" style={{ fontFamily: "'Cormorant Garamond', serif", color: colors.textMain }}>{selectedCourse.ceremony_preparation_guide.title}</p>
                        </div>
                        <p className="text-xs" style={{ color: colors.accent }}>Duration: {selectedCourse.ceremony_preparation_guide.duration}</p>
                        {selectedCourse.ceremony_preparation_guide.altar_items?.length > 0 && (
                          <div>
                            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: colors.accent, fontWeight: 600 }}>Sacred Altar Items:</p>
                            <ul className="space-y-1">
                              {selectedCourse.ceremony_preparation_guide.altar_items.map((item, i) => (
                                <li key={i} className="text-sm flex items-start gap-2" style={{ color: colors.textMuted }}>
                                  <span style={{ color: colors.accent }}>•</span>{item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {selectedCourse.ceremony_preparation_guide.preparation_steps?.length > 0 && (
                          <div>
                            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: colors.accent, fontWeight: 600 }}>Preparation Steps:</p>
                            <ol className="space-y-2">
                              {selectedCourse.ceremony_preparation_guide.preparation_steps.map((step, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm" style={{ color: colors.textMuted }}>
                                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5"
                                    style={{ backgroundColor: `${colors.accent}15`, color: colors.accent }}>{i+1}</span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </div>
                    )}
                    {selectedCourse.integration_guidance && (
                      <div className="p-6 rounded-2xl" style={{ backgroundColor: `${colors.primary}08`, border: `1px solid ${colors.primary}20` }}>
                        <div className="flex items-center gap-2 mb-4">
                          <Wind className="w-5 h-5" style={{ color: colors.primary }} />
                          <p className="font-medium" style={{ fontFamily: "'Cormorant Garamond', serif", color: colors.textMain }}>Integration Guidance</p>
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: colors.textMuted }}>{selectedCourse.integration_guidance}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* DAILY PRACTICE TAB */}
                {activeTab === "daily" && selectedCourse.daily_practice && !isContentLocked("daily") && (
                  <div className="p-8 md:p-12" data-testid="daily-tab-content">
                    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: colors.background, border: `1px solid ${colors.success}30` }}>
                      <div className="p-6" style={{ backgroundColor: `${colors.success}10`, borderBottom: `1px solid ${colors.success}20` }}>
                        <div className="flex items-center gap-2 mb-2">
                          <Flame className="w-5 h-5" style={{ color: colors.success }} />
                          <h3 className="font-medium" style={{ fontFamily: "'Cormorant Garamond', serif", color: colors.textMain }}>{selectedCourse.daily_practice.name}</h3>
                        </div>
                        <p className="text-xs" style={{ color: colors.success }}>Daily for 40 days — {selectedCourse.daily_practice.duration}</p>
                        <p className="text-sm mt-3 leading-relaxed" style={{ color: colors.textMuted }}>{selectedCourse.daily_practice.description}</p>
                      </div>
                      <div className="p-6">
                        <ol className="space-y-3">
                          {selectedCourse.daily_practice.steps?.map((step, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm" style={{ color: colors.textMuted }}>
                              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5"
                                style={{ backgroundColor: `${colors.success}15`, color: colors.success }}>{i+1}</span>
                              <span className="leading-relaxed">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </div>
                )}

                {/* 40-DAY INTEGRATION CALENDAR TAB */}
                {activeTab === "calendar" && selectedCourse.forty_day_integration && !isContentLocked("calendar") && (
                  <div className="p-8 md:p-12 space-y-6" data-testid="calendar-tab-content">
                    <div className="p-6 rounded-2xl" style={{ backgroundColor: `${colors.accent}08`, border: `1px solid ${colors.accent}20` }}>
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-5 h-5" style={{ color: colors.accent }} />
                        <h3 className="font-medium" style={{ fontFamily: "'Cormorant Garamond', serif", color: colors.textMain }}>Your 40-Day Integration Journey</h3>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: colors.textMuted }}>{selectedCourse.forty_day_integration.overview}</p>
                    </div>
                    <div className="space-y-4">
                      {selectedCourse.forty_day_integration.phases?.map((phase, i) => (
                        <div key={i} className="rounded-2xl overflow-hidden" style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}` }}>
                          <div className="p-4 flex items-center gap-4" style={{ backgroundColor: `${colors.secondary}30` }}>
                            <span className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0"
                              style={{ backgroundColor: `${colors.accent}15`, color: colors.accent }}>{i+1}</span>
                            <div>
                              <p className="text-xs" style={{ color: colors.accent }}>{phase.days}</p>
                              <p className="font-medium" style={{ fontFamily: "'Cormorant Garamond', serif", color: colors.textMain }}>{phase.title}</p>
                            </div>
                          </div>
                          <div className="p-4 space-y-3">
                            <p className="text-sm leading-relaxed" style={{ color: colors.textMuted }}>{phase.focus}</p>
                            <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.success}05`, border: `1px solid ${colors.success}15` }}>
                              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: colors.success, fontWeight: 600 }}>Daily Focus:</p>
                              <p className="text-sm" style={{ color: colors.textMuted }}>{phase.daily_focus}</p>
                            </div>
                            {phase.journaling_prompts?.length > 0 && (
                              <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.primary}05`, border: `1px solid ${colors.primary}15` }}>
                                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: colors.primary, fontWeight: 600 }}>Journal Prompts:</p>
                                <ul className="space-y-1">
                                  {phase.journaling_prompts.map((prompt, pi) => (
                                    <li key={pi} className="text-sm flex items-start gap-1" style={{ color: colors.textMuted }}>
                                      <span style={{ color: colors.primary }}>•</span>{prompt}
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

                {/* SAFETY TAB - Always accessible */}
                {activeTab === "safety" && selectedCourse.safety_precautions && (
                  <div className="p-8 md:p-12" data-testid="safety-tab-content">
                    <div className="p-6 rounded-2xl" style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA" }}>
                      <div className="flex items-center gap-2 mb-4">
                        <Shield className="w-5 h-5" style={{ color: "#DC2626" }} />
                        <h3 className="font-medium" style={{ fontFamily: "'Cormorant Garamond', serif", color: colors.textMain }}>Safety Precautions & Contraindications</h3>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: colors.textMuted }}>{selectedCourse.safety_precautions}</p>
                    </div>
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
