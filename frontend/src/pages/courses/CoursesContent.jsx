import { BookOpen, Loader2 } from "lucide-react";
import { CourseCard } from "../../components/courses/CourseCard";
import { COURSE_IMAGES, LEVEL_COLORS } from "./courseConstants";
import { CoursesBundleOffer } from "./CoursesBundleOffer";
import { CoursesFilters } from "./CoursesFilters";

const resolveCourseImage = (course) => COURSE_IMAGES[course.id] || course.image_url;

export const CoursesContent = ({
  loading,
  courses,
  filteredCourses,
  categories,
  levels,
  filterLevel,
  setFilterLevel,
  filterCategory,
  setFilterCategory,
  allCoursesUnlocked,
  handleBundlePurchase,
  purchaseLoading,
  hasAccess,
  onSelectCourse,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20" data-testid="courses-loading-state">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
    );
  }

  if (!courses.length) {
    return (
      <div className="text-center py-20" data-testid="courses-empty-state">
        <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
        <h2 className="text-2xl font-serif mb-2">Courses Coming Soon</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Sacred teachings are being prepared. Check back soon for live and recorded courses on breathwork, meditation, shamanic practices, and more.
        </p>
      </div>
    );
  }

  return (
    <>
      <CoursesFilters
        levels={levels}
        filterLevel={filterLevel}
        setFilterLevel={setFilterLevel}
        categories={categories}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
      />

      <CoursesBundleOffer
        allCoursesUnlocked={allCoursesUnlocked}
        courses={courses}
        handleBundlePurchase={handleBundlePurchase}
        purchaseLoading={purchaseLoading}
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="courses-grid">
        {filteredCourses.map((course, index) => {
          const userHasAccess = hasAccess(course.id);
          const courseImage = resolveCourseImage(course);

          return (
            <CourseCard
              key={course.id}
              course={course}
              index={index}
              userHasAccess={userHasAccess}
              courseImage={courseImage}
              levelColors={LEVEL_COLORS}
              onSelect={() => onSelectCourse(course)}
            />
          );
        })}
      </div>
    </>
  );
};
