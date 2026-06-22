import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Play, Clock, Filter, X, ExternalLink, 
  Sparkles, Heart, Flame, Wind, Music, Drum, Moon, Leaf,
  Feather, Palette, Droplets, PenTool
} from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { appLogger } from "../utils/logger";

const HERO_IMAGE = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80";

const CATEGORIES = [
  { id: "all", label: "All Videos", icon: Play, color: "#C9A86C" },
  { id: "feminine", label: "Feminine Embodiment", icon: Heart, color: "#C97B84" },
  { id: "chakra", label: "Chakra Healing", icon: Sparkles, color: "#A96F6A" },
  { id: "kundalini", label: "Kundalini", icon: Flame, color: "#C4956A" },
  { id: "drumming", label: "Shamanic Drums", icon: Drum, color: "#8B7355" },
  { id: "meditation", label: "Meditation", icon: Moon, color: "#7B68A6" },
  { id: "breathwork", label: "Breathwork", icon: Wind, color: "#5B8A9A" },
  { id: "movement", label: "Movement", icon: Leaf, color: "#6B8E73" },
  { id: "sound", label: "Sound Healing", icon: Music, color: "#6B9AC4" },
  { id: "angel_guidance", label: "Angel Guidance", icon: Feather, color: "#D4AF37" },
  { id: "colour_therapy", label: "Colour Therapy", icon: Palette, color: "#9B59B6" },
  { id: "aromatherapy", label: "Aromatherapy", icon: Droplets, color: "#27AE60" },
  { id: "art_therapy", label: "Art Therapy", icon: PenTool, color: "#E74C3C" },
];

const LEVEL_COLORS = {
  beginner: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30" },
  intermediate: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30" },
  advanced: { bg: "bg-rose-500/15", text: "text-rose-400", border: "border-rose-500/30" },
};

const VideosLibrary = ({ api }) => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [filteredVideos, setFilteredVideos] = useState([]);

  const fetchVideos = useCallback(async () => {
    try {
      const response = await api.get("/videos");
      setVideos(response.data);
      setFilteredVideos(response.data);
    } catch (error) {
      appLogger.error("Failed to fetch videos:", error);
      toast.error("Could not load videos");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  useEffect(() => {
    if (activeCategory === "all") {
      setFilteredVideos(videos);
    } else {
      setFilteredVideos(videos.filter(v => v.category === activeCategory));
    }
  }, [activeCategory, videos]);

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
    <div className="min-h-screen bg-background" data-testid="videos-library">
      {/* Hero Header */}
      <header className="relative overflow-hidden" style={{ minHeight: "40vh" }}>
        <div className="absolute inset-0">
          <img src={HERO_IMAGE} alt="" className="w-full h-full object-cover" style={{ filter: "brightness(0.4)" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 md:px-12 pt-8 pb-16">
          <button 
            onClick={() => navigate("/menu")} 
            className="inline-flex items-center gap-2 mb-10 px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 text-muted-foreground bg-card/80 backdrop-blur-sm border border-white/10"
            data-testid="back-btn"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.3em] mb-4 text-primary font-semibold">Sacred Teachings</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl tracking-tight leading-tight mb-4 font-serif text-foreground">
              Video Library
            </h1>
            <p className="text-base md:text-lg leading-relaxed text-muted-foreground">
              Video teachings for your spiritual journey. From feminine embodiment to shamanic drumming, discover practices that resonate with your soul.
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
                className={`px-4 py-2 rounded-full text-sm transition-all duration-300 flex items-center gap-2 border ${
                  isActive ? 'border-white/30' : 'border-white/10 bg-card hover:bg-white/5'
                }`}
                style={{ 
                  backgroundColor: isActive ? `${cat.color}20` : undefined, 
                  color: isActive ? cat.color : undefined
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
        <p className="text-center text-sm mb-8 text-muted-foreground">
          {filteredVideos.length} {filteredVideos.length === 1 ? 'video' : 'videos'} {activeCategory !== 'all' && `in ${getCategoryInfo(activeCategory).label}`}
        </p>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 rounded-full border-4 animate-spin border-primary/30 border-t-primary" />
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-center py-16">
            <Play className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
            <p className="text-muted-foreground">No videos found in this category.</p>
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
                    <div className="rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 bg-card border border-white/10 hover:border-white/20 shadow-lg shadow-black/20">
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
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <Play className="w-12 h-12 text-primary" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        
                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm bg-white/20">
                            <Play className="w-7 h-7 ml-1 text-white" fill="white" />
                          </div>
                        </div>

                        {/* Category Badge */}
                        <div className="absolute top-3 left-3">
                          <span 
                            className="px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border"
                            style={{ backgroundColor: `${catInfo.color}30`, color: catInfo.color, borderColor: `${catInfo.color}40` }}
                          >
                            {catInfo.label}
                          </span>
                        </div>

                        {/* Duration */}
                        {video.duration && (
                          <div className="absolute bottom-3 right-3">
                            <span className="px-2 py-1 rounded-full text-xs backdrop-blur-sm flex items-center gap-1 bg-black/60 text-white">
                              <Clock className="w-3 h-3" /> {video.duration}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className="text-base font-medium mb-2 line-clamp-2 group-hover:text-primary transition-colors font-serif text-foreground">
                          {video.title}
                        </h3>
                        <p className="text-sm line-clamp-2 mb-3 text-muted-foreground">
                          {video.description}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {video.level && (
                            <span className={`px-2.5 py-1 rounded-full text-xs capitalize ${levelColors.bg} ${levelColors.text}`}>
                              {video.level}
                            </span>
                          )}
                          {video.tradition && (
                            <span className="px-2.5 py-1 rounded-full text-xs bg-white/5 text-muted-foreground">
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl rounded-2xl overflow-hidden bg-card border border-white/10"
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
                    <p className="text-muted-foreground">Video not available</p>
                  </div>
                )}
                
                {/* Close Button */}
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 bg-black/60 backdrop-blur-sm text-white"
                  data-testid="close-video-modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Video Info */}
              <div className="p-6 bg-card">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: `${getCategoryInfo(selectedVideo.category).color}20`, color: getCategoryInfo(selectedVideo.category).color }}
                      >
                        {getCategoryInfo(selectedVideo.category).label}
                      </span>
                      {selectedVideo.level && (
                        <span className={`px-2.5 py-1 rounded-full text-xs capitalize ${getLevelColors(selectedVideo.level).bg} ${getLevelColors(selectedVideo.level).text}`}>
                          {selectedVideo.level}
                        </span>
                      )}
                      {selectedVideo.duration && (
                        <span className="text-xs flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-3 h-3" /> {selectedVideo.duration}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl md:text-2xl font-serif text-foreground">
                      {selectedVideo.title}
                    </h2>
                  </div>
                  <a
                    href={selectedVideo.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-4 py-2 rounded-full text-sm transition-all hover:scale-105 bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10"
                  >
                    <ExternalLink className="w-4 h-4" /> YouTube
                  </a>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {selectedVideo.description}
                </p>
                {selectedVideo.tradition && (
                  <p className="text-xs mt-3 text-primary">
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
