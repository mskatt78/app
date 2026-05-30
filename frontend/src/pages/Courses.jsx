import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import ShareToCircle from "../components/ShareToCircle";
import GuidedPracticeOverlay from "../components/GuidedPracticeOverlay";
import { COURSE_IMAGES, LEVEL_COLORS, FORMAT_ICONS } from "./courses/courseConstants";
import { isLoggedIn } from "../utils/clientStorage";
import { CourseCard } from "../components/courses/CourseCard";
import { CoursesFilters } from "./courses/CoursesFilters";
import { CoursesBundleOffer } from "./courses/CoursesBundleOffer";
import { CoursesModalShell } from "./courses/CoursesModalShell";
import { useCoursePayments } from "./courses/useCoursePayments";
import { appLogger } from "../utils/logger";

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
      appLogger.error("Failed loading courses", error);
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
        <CoursesFilters
          levels={levels}
          filterLevel={filterLevel}
          setFilterLevel={setFilterLevel}
          categories={categories}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
        />

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
            <CoursesBundleOffer
              allCoursesUnlocked={allCoursesUnlocked}
              courses={courses}
              handleBundlePurchase={handleBundlePurchase}
              purchaseLoading={purchaseLoading}
            />

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

      <AnimatePresence>
        {selectedCourse && (
          <CoursesModalShell
            selectedCourse={selectedCourse}
            getCourseImage={getCourseImage}
            setSelectedCourse={setSelectedCourse}
            setActiveTab={setActiveTab}
            setExpandedRite={setExpandedRite}
            setExpandedRitual={setExpandedRitual}
            setShowShare={setShowShare}
            hasAccess={hasAccess}
            purchaseLoading={purchaseLoading}
            handlePurchase={handlePurchase}
            activeTab={activeTab}
            expandedRite={expandedRite}
            expandedRitual={expandedRitual}
            setShowGuided={setShowGuided}
          />
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
