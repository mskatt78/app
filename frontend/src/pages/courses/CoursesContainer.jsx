import { AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import GuidedPracticeOverlay from "../../components/GuidedPracticeOverlay";
import ShareToCircle from "../../components/ShareToCircle";
import { COURSE_IMAGES } from "./courseConstants";
import { CoursesContent } from "./CoursesContent";
import { CoursesHeader } from "./CoursesHeader";
import { CoursesModalShell } from "./CoursesModalShell";
import { useCoursePayments } from "./useCoursePayments";
import { useCoursesData } from "./useCoursesData";

const api = axios.create({ baseURL: `${process.env.REACT_APP_BACKEND_URL}/api` });

const CoursesContainer = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    purchaseLoading,
    checkingPayment,
    fetchCourseAccess,
    handlePurchase,
    handleBundlePurchase,
    hasAccess,
  } = useCoursePayments({ api, navigate, searchParams });

  const {
    courses,
    loading,
    selectedCourse,
    filterLevel,
    filterCategory,
    activeTab,
    expandedRite,
    expandedRitual,
    showShare,
    showGuided,
    categories,
    levels,
    filteredCourses,
    setFilterLevel,
    setFilterCategory,
    setSelectedCourse,
    setActiveTab,
    setExpandedRite,
    setExpandedRitual,
    setShowShare,
    setShowGuided,
    selectCourse,
  } = useCoursesData({ api, fetchCourseAccess });

  const allCoursesUnlocked = courses.length > 0 && courses.every((course) => hasAccess(course.id));
  const resolveCourseImage = (course) => COURSE_IMAGES[course.id] || course.image_url;

  return (
    <div className="min-h-screen bg-background" data-testid="courses-page">
      {checkingPayment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm" data-testid="courses-checking-payment-overlay">
          <div className="text-center p-8 rounded-2xl bg-card border border-white/10">
            <div className="w-12 h-12 animate-spin rounded-full border-2 border-violet-400 border-t-transparent mx-auto mb-4" />
            <h3 className="text-xl font-serif mb-2">Verifying Payment...</h3>
            <p className="text-muted-foreground text-sm">Please wait while we confirm your purchase.</p>
          </div>
        </div>
      )}

      <CoursesHeader navigate={navigate} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <CoursesContent
          loading={loading}
          courses={courses}
          filteredCourses={filteredCourses}
          categories={categories}
          levels={levels}
          filterLevel={filterLevel}
          setFilterLevel={setFilterLevel}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          allCoursesUnlocked={allCoursesUnlocked}
          handleBundlePurchase={handleBundlePurchase}
          purchaseLoading={purchaseLoading}
          hasAccess={hasAccess}
          onSelectCourse={selectCourse}
        />
      </main>

      <AnimatePresence>
        {selectedCourse && (
          <CoursesModalShell
            selectedCourse={selectedCourse}
            getCourseImage={resolveCourseImage}
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
    </div>
  );
};

export default CoursesContainer;
