import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, Film } from "lucide-react";

function getEmbedUrl(url) {
  if (!url) return null;
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  // Direct video — return null so we use <video> tag
  return null;
}

function isDirectVideo(url) {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}

function VideoModal({ video, onClose }) {
  if (!video) return null;
  const embedUrl = getEmbedUrl(video.video_url);
  const isDirect = isDirectVideo(video.video_url);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-serif text-white">{video.title}</h3>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="aspect-video rounded-xl overflow-hidden bg-black">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title={video.title}
            />
          ) : isDirect ? (
            <video
              src={video.video_url}
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <p>Unable to play this video format</p>
            </div>
          )}
        </div>
        {video.description && (
          <p className="text-sm text-white/60 mt-3">{video.description}</p>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function PracticeVideos({ api, category }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const url = category ? `/videos?category=${category}` : "/videos";
        const res = await api.get(url);
        setVideos(res.data || []);
      } catch {
        // No videos yet — that's fine
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [api, category]);

  if (loading) return null;
  if (videos.length === 0) return null;

  return (
    <section className="mt-10" data-testid="practice-videos-section">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <Film className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-serif">Practice Videos</h3>
          <p className="text-xs text-muted-foreground">Guided video practices for deeper learning</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => {
          const ytMatch = video.video_url?.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/);
          const thumbnail = video.thumbnail_url || (ytMatch ? `https://img.youtube.com/vi/${ytMatch[1]}/mqdefault.jpg` : null);

          return (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="group rounded-xl overflow-hidden border border-white/10 bg-card/50 hover:border-primary/30 transition-all cursor-pointer"
              onClick={() => setActiveVideo(video)}
              data-testid={`video-card-${video.id}`}
            >
              <div className="aspect-video relative bg-black/40">
                {thumbnail ? (
                  <img src={thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Film className="w-10 h-10 text-muted-foreground/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  </div>
                </div>
                {video.duration && (
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-xs text-white">
                    {video.duration}
                  </span>
                )}
              </div>
              <div className="p-3">
                <h4 className="text-sm font-medium line-clamp-1">{video.title}</h4>
                {video.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{video.description}</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {activeVideo && (
          <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}
