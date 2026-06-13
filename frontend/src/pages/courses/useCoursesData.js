import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { appLogger } from "../../utils/logger";

export const useCoursesData = ({ api, fetchCourseAccess }) => {
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
  }, [api]);

  useEffect(() => {
    fetchCourses();
    fetchCourseAccess();
  }, [fetchCourseAccess, fetchCourses]);

  const categories = useMemo(() => ["all", ...new Set(courses.map((course) => course.category).filter(Boolean))], [courses]);
  const levels = ["all", "beginner", "intermediate", "advanced"];

  const filteredCourses = useMemo(
    () => courses.filter((course) => {
      if (filterLevel !== "all" && course.level?.toLowerCase() !== filterLevel) {
        return false;
      }
      if (filterCategory !== "all" && course.category !== filterCategory) {
        return false;
      }
      return true;
    }),
    [courses, filterCategory, filterLevel],
  );

  const selectCourse = (course) => {
    setSelectedCourse(course);
    setActiveTab(course.rites?.length ? "rites" : "overview");
    setExpandedRite(null);
    setExpandedRitual(null);
  };

  return {
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
  };
};
