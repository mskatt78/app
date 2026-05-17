import { motion } from "framer-motion";
import { BookOpen, CheckCircle2, ChevronRight, Clock, Lock, Scroll, Unlock } from "lucide-react";

export const CourseCard = ({
  course,
  index,
  userHasAccess,
  courseImage,
  levelColors,
  onSelect,
}) => {
  const integrity = course.content_integrity || {};
  const integrityLabel = integrity.verified
    ? `Verified references (${integrity.references_count || 0})`
    : "Curated content";

  return (
    <motion.div
      key={course.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-all duration-300 group relative"
      onClick={onSelect}
      data-testid={`course-card-${course.id}`}
    >
      {course.is_premium && (
        <div className="absolute top-3 left-3 z-10">
          {userHasAccess ? (
            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-medium backdrop-blur-sm">
              <Unlock className="w-2.5 h-2.5" /> Unlocked
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-medium backdrop-blur-sm">
              <Lock className="w-2.5 h-2.5" /> Premium
            </span>
          )}
        </div>
      )}

      {courseImage ? (
        <div className="relative h-44 overflow-hidden">
          <img src={courseImage} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          {course.level && (
            <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs border ${levelColors[course.level?.toLowerCase()] || levelColors.all}`}>
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
          {course.rites?.length > 0 && (
            <span className="flex items-center gap-1"><Scroll className="w-3 h-3" />{course.rites.length} rites</span>
          )}
        </div>

        <p
          className="mt-2 text-[11px] text-cyan-300/90"
          data-testid={`course-integrity-${course.id}`}
        >
          {integrityLabel}
        </p>

        {course.price && (
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
            {userHasAccess ? (
              <span className="text-emerald-400 font-medium flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Purchased</span>
            ) : (
              <span className="text-violet-300 font-medium">${course.price}</span>
            )}
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
      </div>
    </motion.div>
  );
};
