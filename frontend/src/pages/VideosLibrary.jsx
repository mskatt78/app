import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Play, Clock, Filter, X, ExternalLink, 
  Sparkles, Heart, Flame, Wind, Music, Drum, Moon, Leaf
} from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

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

const HERO_IMAGE = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80";

const CATEGORIES = [
  { id: "all", label: "All Videos", icon: Play, color: colors.accent },
  { id: "feminine", label: "Feminine Embodiment", icon: Heart, color: "#C97B84" },
  { id: "chakra", label: "Chakra Healing", icon: Sparkles, color: colors.primary },
  { id: "kundalini", label: "Kundalini", icon: Flame, color: "#C4956A" },
  { id: "drumming", label: "Shamanic Drums", icon: Drum, color: "#8B7355" },
  { id: "meditation", label: "Meditation", icon: Moon, color: "#7B68A6" },
  { id: "breathwork", label: "Breathwork", icon: Wind, color: "#5B8A9A" },
  { id: "movement", label: "Movement", icon: Leaf, color: colors.success },
  { id: "sound", label: "Sound Healing", icon: Music, color: "#6B9AC4" },
];

const LEVEL_COLORS = {
  beginner: { bg: `${colors.success}15`, text: colors.success, border: `${colors.success}30` },
  intermediate: { bg: `${colors.accent}15`, text: colors.accent, border: `${colors.accent}30` },
  advanced: { bg: `${colors.primary}15`, text: colors.primary, border: `${colors.primary}30` },
};

const VideosLibrary = ({ api }) => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [filteredVideos, setFilteredVideos] = useState([]);

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    if (activeCategory === "all") {
      setFilteredVideos(videos);
    } else {
      setFilteredVideos(videos.filter(v => v.category === activeCategory));
    }
  }, [activeCategory, videos]);

  const fetchVideos = async () => {
    try {
      const response = await api.get("/videos");
      setVideos(response.data);
      setFilteredVideos(response.data);
    } catch (error) {
      console.error("Failed to fetch videos:", error);
      toast.error("Could not load videos");
    } finally {
      setLoading(false);
    }
  };

  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? match[1] : null;
  };

  const getThumbnail = (url) => {
    const videoId = getYouTubeId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
  };

  const getCategoryInfo = (categoryId) => {
    return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0];
  };

  const getLevelColors = (level) => {
    return LEVEL_COLORS[level?.toLowerCase()] || LEVEL_COLORS.beginner;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background, fontFamily: "'Inter', sans-serif" }} data-testid="videos-library">
      {/* Hero Header */}
      <header className="relative overflow-hidden" style={{ minHeight: "40vh" }}>
        <div className="absolute inset-0">
          <img src={HERO_IMAGE} alt="" className="w-full h-full object-cover" style={{ filter: "brightness(0.8)" }} />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${colors.background}20, ${colors.background}95)` }} />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 md:px-12 pt-8 pb-16">
          <button 
            onClick={() => navigate("/menu")} 
            className="inline-flex items-center gap-2 mb-10 px-4 py-2 rounded-full transition-all duration-300 hover:scale-105"
            style={{ color: colors.textMuted, backgroundColor: `${colors.surface}90`, backdropFilter: "blur(8px)" }}
            data-testid="back-btn"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.3em] mb-4" style={{ color: colors.primary, fontWeight: 600 }}>Sacred Teachings</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl tracking-tight leading-tight mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, color: colors.textMain }}>
              Video Library
            </h1>
            <p className="text-base md:text-lg leading-relaxed" style={{ color: colors.textMuted }}>
              Curated video teachings for your spiritual journey. From feminine embodiment to shamanic drumming, discover practices that resonate with your soul.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 md:px-12 py-8">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="px-4 py-2 rounded-full text-sm transition-all duration-300 flex items-center gap-2"
                style={{ 
                  backgroundColor: isActive ? `${cat.color}15` : colors.surface, 
                  color: isActive ? cat.color : colors.textMuted, 
                  border: `1px solid ${isActive ? cat.color : colors.border}` 
                }}
                data-testid={`filter-${cat.id}`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Video Count */}
        <p className="text-center text-sm mb-8" style={{ color: colors.textMuted }}>
          {filteredVideos.length} {filteredVideos.length === 1 ? 'video' : 'videos'} {activeCategory !== 'all' && `in ${getCategoryInfo(activeCategory).label}`}
        </p>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 rounded-full border-4 animate-spin" style={{ borderColor: `${colors.primary}30`, borderTopColor: colors.primary }} />
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-center py-16">
            <Play className="w-12 h-12 mx-auto mb-4" style={{ color: `${colors.textMuted}40` }} />
            <p style={{ color: colors.textMuted }}>No videos found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredVideos.map((video, index) => {
                const thumbnail = getThumbnail(video.video_url);
                const catInfo = getCategoryInfo(video.category);
                const levelColors = getLevelColors(video.level);
                
                return (
                  <motion.article
                    key={video.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.04 }}
                    onClick={() => setSelectedVideo(video)}
                    className="group cursor-pointer"
                    data-testid={`video-card-${video.id}`}
                  >
                    <div className="rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, boxShadow: "0 8px 30px rgba(169,111,106,0.05)" }}>
                      {/* Thumbnail */}
                      <div className="relative aspect-video overflow-hidden">
                        {thumbnail ? (
                          <img 
                            src={thumbnail} 
                            alt={video.title} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => { e.target.src = `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=60`; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: colors.secondary }}>
                            <Play className="w-12 h-12" style={{ color: colors.primary }} />
                          </div>
                        )}
                        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(61,46,43,0.6) 0%, transparent 50%)" }} />
                        
                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm" style={{ backgroundColor: `${colors.surface}90` }}>
                            <Play className="w-7 h-7 ml-1" style={{ color: colors.primary }} fill={colors.primary} />
                          </div>
                        </div>

                        {/* Category Badge */}
                        <div className="absolute top-3 left-3">
                          <span className="px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm" style={{ backgroundColor: `${catInfo.color}20`, color: catInfo.color, border: `1px solid ${catInfo.color}30` }}>
                            {catInfo.label}
                          </span>
                        </div>

                        {/* Duration */}
                        {video.duration && (
                          <div className="absolute bottom-3 right-3">
                            <span className="px-2 py-1 rounded-full text-xs backdrop-blur-sm flex items-center gap-1" style={{ backgroundColor: "rgba(255,255,255,0.9)", color: colors.textMain }}>
                              <Clock className="w-3 h-3" /> {video.duration}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className="text-base font-medium mb-2 line-clamp-2 group-hover:text-primary transition-colors" style={{ fontFamily: "'Cormorant Garamond', serif", color: colors.textMain }}>
                          {video.title}
                        </h3>
                        <p className="text-sm line-clamp-2 mb-3" style={{ color: colors.textMuted }}>
                          {video.description}
                        </p>
                        <div className="flex items-center gap-2">
                          {video.level && (
                            <span className="px-2.5 py-1 rounded-full text-xs capitalize" style={{ backgroundColor: levelColors.bg, color: levelColors.text }}>
                              {video.level}
                            </span>
                          )}
                          {video.tradition && (
                            <span className="px-2.5 py-1 rounded-full text-xs" style={{ backgroundColor: `${colors.secondary}50`, color: colors.textMuted }}>
                              {video.tradition}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Video Player Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(61, 46, 43, 0.9)", backdropFilter: "blur(8px)" }}
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl rounded-3xl overflow-hidden"
              style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}` }}
              data-testid="video-player-modal"
            >
              {/* Video Player */}
              <div className="relative aspect-video bg-black">
                {getYouTubeId(selectedVideo.video_url) ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeId(selectedVideo.video_url)}?autoplay=1&rel=0`}
                    title={selectedVideo.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p style={{ color: colors.textMuted }}>Video not available</p>
                  </div>
                )}
                
                {/* Close Button */}
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  style={{ backgroundColor: `${colors.surface}90`, backdropFilter: "blur(8px)", color: colors.textMain }}
                  data-testid="close-video-modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Video Info */}
              <div className="p-6" style={{ backgroundColor: colors.surface }}>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${getCategoryInfo(selectedVideo.category).color}15`, color: getCategoryInfo(selectedVideo.category).color }}>
                        {getCategoryInfo(selectedVideo.category).label}
                      </span>
                      {selectedVideo.level && (
                        <span className="px-2.5 py-1 rounded-full text-xs capitalize" style={{ backgroundColor: getLevelColors(selectedVideo.level).bg, color: getLevelColors(selectedVideo.level).text }}>
                          {selectedVideo.level}
                        </span>
                      )}
                      {selectedVideo.duration && (
                        <span className="text-xs flex items-center gap-1" style={{ color: colors.textMuted }}>
                          <Clock className="w-3 h-3" /> {selectedVideo.duration}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl md:text-2xl" style={{ fontFamily: "'Cormorant Garamond', serif", color: colors.textMain }}>
                      {selectedVideo.title}
                    </h2>
                  </div>
                  <a
                    href={selectedVideo.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-4 py-2 rounded-full text-sm transition-all hover:scale-105"
                    style={{ backgroundColor: colors.background, color: colors.textMuted, border: `1px solid ${colors.border}` }}
                  >
                    <ExternalLink className="w-4 h-4" /> YouTube
                  </a>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: colors.textMuted }}>
                  {selectedVideo.description}
                </p>
                {selectedVideo.tradition && (
                  <p className="text-xs mt-3" style={{ color: colors.primary }}>
                    Tradition: {selectedVideo.tradition}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideosLibrary;
