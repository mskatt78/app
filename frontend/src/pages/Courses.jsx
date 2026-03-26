import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, Clock, Star, Users, Play, ChevronRight, ExternalLink, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
};

export default function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [filterLevel, setFilterLevel] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data } = await api.get("/courses");
      setCourses(data);
    } catch {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-all duration-300 group"
                onClick={() => setSelectedCourse(course)}
                data-testid={`course-card-${course.id}`}
              >
                {course.image_url ? (
                  <div className="relative h-44 overflow-hidden">
                    <img src={course.image_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    {course.format && (
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs bg-black/50 backdrop-blur-sm text-white border border-white/20">
                        {FORMAT_ICONS[course.format?.toLowerCase()] || course.format}
                      </span>
                    )}
                    {course.level && (
                      <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs border ${LEVEL_COLORS[course.level?.toLowerCase()] || LEVEL_COLORS.all}`}>
                        {course.level}
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
                      <span className="text-violet-300 font-medium">{course.price}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
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
            onClick={() => setSelectedCourse(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-card border border-white/10"
              data-testid="course-detail-modal"
            >
              {selectedCourse.image_url && (
                <div className="relative h-56 overflow-hidden rounded-t-2xl">
                  <img src={selectedCourse.image_url} alt={selectedCourse.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                </div>
              )}
              <div className="p-6">
                <div className="flex gap-2 mb-3 flex-wrap">
                  {selectedCourse.level && (
                    <span className={`px-3 py-1 rounded-full text-xs border ${LEVEL_COLORS[selectedCourse.level?.toLowerCase()] || LEVEL_COLORS.all}`}>
                      {selectedCourse.level}
                    </span>
                  )}
                  {selectedCourse.format && (
                    <span className="px-3 py-1 rounded-full text-xs bg-white/5 text-muted-foreground">
                      {selectedCourse.format}
                    </span>
                  )}
                  {selectedCourse.category && (
                    <span className="px-3 py-1 rounded-full text-xs bg-violet-500/10 text-violet-300">
                      {selectedCourse.category}
                    </span>
                  )}
                </div>
                
                <h2 className="text-2xl font-serif mb-3">{selectedCourse.title || selectedCourse.name}</h2>
                <p className="text-muted-foreground mb-4">{selectedCourse.description}</p>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                  {selectedCourse.instructor && <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {selectedCourse.instructor}</span>}
                  {selectedCourse.duration && <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {selectedCourse.duration}</span>}
                  {selectedCourse.lessons && <span className="flex items-center gap-1"><Play className="w-4 h-4" /> {selectedCourse.lessons} lessons</span>}
                </div>

                {selectedCourse.highlights && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">What You'll Learn</h3>
                    <div className="text-sm text-muted-foreground whitespace-pre-line">{selectedCourse.highlights}</div>
                  </div>
                )}

                {selectedCourse.price && (
                  <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-violet-300 text-xl font-medium">{selectedCourse.price}</span>
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

                {selectedCourse.video_url && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Preview</h3>
                    <div className="aspect-video rounded-xl overflow-hidden bg-black">
                      <iframe
                        src={selectedCourse.video_url.replace("watch?v=", "embed/")}
                        className="w-full h-full"
                        allowFullScreen
                        title="Course preview"
                      />
                    </div>
                  </div>
                )}

                <Button variant="ghost" onClick={() => setSelectedCourse(null)} className="w-full mt-2">
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
