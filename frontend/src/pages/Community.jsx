import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Heart, MessageCircle, Feather, Flame, Droplets, Wind, Mountain, Sparkles, Loader2, Send, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import axios from "axios";

const api = axios.create({ baseURL: `${process.env.REACT_APP_BACKEND_URL}/api` });

const ELEMENT_COLORS = {
  earth: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400" },
  water: { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400" },
  fire: { bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-400" },
  air: { bg: "bg-sky-500/10", border: "border-sky-500/20", text: "text-sky-400" },
  spirit: { bg: "bg-violet-500/10", border: "border-violet-500/20", text: "text-violet-400" },
};

const POST_TYPES = {
  journey: { label: "Journey", icon: Sparkles },
  insight: { label: "Insight", icon: Feather },
  gratitude: { label: "Gratitude", icon: Heart },
  question: { label: "Question", icon: MessageCircle },
};

export default function Community() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [selectedPost, setSelectedPost] = useState(null);
  const [replyAuthor, setReplyAuthor] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data } = await api.get("/community/posts");
      setPosts(data);
    } catch {
      toast.error("Failed to load community posts");
    } finally {
      setLoading(false);
    }
  };

  const filtered = filterType === "all" ? posts : posts.filter(p => p.type?.toLowerCase() === filterType);
  const getColors = (el) => ELEMENT_COLORS[el?.toLowerCase()] || ELEMENT_COLORS.spirit;

  const handleLike = async (e, post) => {
    e.stopPropagation();
    try {
      await api.post(`/community/posts/${post.id}/like`);
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes: (p.likes || 0) + 1 } : p));
      if (selectedPost?.id === post.id) setSelectedPost(prev => ({ ...prev, likes: (prev.likes || 0) + 1 }));
    } catch { toast.error("Could not like post"); }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) { toast.error("Please write something before posting"); return; }
    setReplyLoading(true);
    try {
      const { data } = await api.post(`/community/posts/${selectedPost.id}/replies`, {
        author_name: replyAuthor.trim() || "Sacred Seeker",
        content: replyContent.trim(),
      });
      const updatedComments = [...(selectedPost.comments || []), data];
      setSelectedPost(prev => ({ ...prev, comments: updatedComments }));
      setPosts(prev => prev.map(p => p.id === selectedPost.id ? { ...p, comments: updatedComments } : p));
      setReplyContent("");
      setReplyAuthor("");
      toast.success("Your reflection has been shared");
    } catch { toast.error("Could not post reply"); }
    finally { setReplyLoading(false); }
  };

  const openPost = (post) => {
    setSelectedPost(post);
    setShowReplies(false);
    setReplyContent("");
    setReplyAuthor("");
  };

  return (
    <div className="min-h-screen bg-background" data-testid="community-page">
      {/* Header */}
      <header className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-rose-950/30 to-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mb-4 text-muted-foreground" data-testid="community-back-btn">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-rose-500/10">
              <Heart className="w-8 h-8 text-rose-400" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-serif">Sacred Circle</h1>
              <p className="text-muted-foreground mt-1">Shared journeys, wisdom, and gratitude from our community</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Type Filters */}
        <div className="flex gap-2 flex-wrap mb-8">
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 py-2 rounded-full text-sm transition-all ${
              filterType === "all" ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" : "bg-white/5 text-muted-foreground hover:bg-white/10"
            }`}
          >
            All
          </button>
          {Object.entries(POST_TYPES).map(([key, { label, icon: Icon }]) => (
            <button
              key={key}
              onClick={() => setFilterType(key)}
              className={`px-4 py-2 rounded-full text-sm flex items-center gap-1.5 transition-all ${
                filterType === key ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" : "bg-white/5 text-muted-foreground hover:bg-white/10"
              }`}
              data-testid={`filter-type-${key}`}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-rose-400" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h2 className="text-2xl font-serif mb-2">Sacred Circle Awakening</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              The community space is being prepared. Soon you'll find shared journeys, insights, and gratitude from fellow practitioners.
            </p>
            <p className="text-sm text-muted-foreground/60">
              Admins can add community posts through the CMS dashboard.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filtered.map((post, index) => {
              const colors = getColors(post.element);
              const typeInfo = POST_TYPES[post.type?.toLowerCase()] || POST_TYPES.journey;
              const TypeIcon = typeInfo.icon;
              
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-6 rounded-2xl border backdrop-blur-xl ${colors.border} bg-white/[0.02] cursor-pointer hover:bg-white/[0.04] transition-all`}
                  onClick={() => openPost(post)}
                  data-testid={`community-post-${post.id}`}
                >
                  <div className="flex items-start gap-4">
                    {post.image_url && (
                      <img src={post.image_url} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" loading="lazy" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs ${colors.bg} ${colors.text} flex items-center gap-1`}>
                          <TypeIcon className="w-3 h-3" /> {typeInfo.label}
                        </span>
                        {post.element && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs bg-white/5 text-muted-foreground">
                            {post.element}
                          </span>
                        )}
                        {post.author_name && (
                          <span className="text-xs text-muted-foreground ml-auto">{post.author_name}</span>
                        )}
                      </div>
                      {post.title && <h3 className="text-lg font-serif mb-1">{post.title}</h3>}
                      <p className="text-sm text-muted-foreground line-clamp-3">{post.content}</p>
                      {post.tags && (
                        <div className="flex gap-1.5 mt-3 flex-wrap">
                          {(typeof post.tags === 'string' ? post.tags.split(',') : post.tags).map(tag => (
                            <span key={tag} className="px-2 py-0.5 rounded-full bg-white/5 text-xs text-muted-foreground">
                              {typeof tag === 'string' ? tag.trim() : tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {/* Like + comments row */}
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
                        <button
                          onClick={(e) => handleLike(e, post)}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-rose-400 transition-colors"
                          data-testid={`like-btn-${post.id}`}
                        >
                          <Heart className="w-3.5 h-3.5" /> {post.likes || 0}
                        </button>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MessageCircle className="w-3.5 h-3.5" /> {post.comments?.length || 0} {post.comments?.length === 1 ? "reply" : "replies"}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Post Detail Modal */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedPost(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl bg-card border border-white/10 p-6"
              data-testid="community-post-detail"
            >
              {selectedPost.image_url && (
                <img src={selectedPost.image_url} alt="" className="w-full h-48 rounded-xl object-cover mb-4" />
              )}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {selectedPost.type && (
                  <span className="px-3 py-1 rounded-full text-xs bg-rose-500/10 text-rose-300">
                    {selectedPost.type}
                  </span>
                )}
                {selectedPost.element && (
                  <span className="px-3 py-1 rounded-full text-xs bg-white/5">{selectedPost.element}</span>
                )}
              </div>
              {selectedPost.title && <h2 className="text-2xl font-serif mb-2">{selectedPost.title}</h2>}
              {selectedPost.author_name && (
                <p className="text-sm text-muted-foreground mb-4">Shared by {selectedPost.author_name}</p>
              )}
              <div className="text-muted-foreground whitespace-pre-line leading-relaxed mb-4">{selectedPost.content}</div>

              {/* Like row */}
              <div className="flex items-center gap-4 pb-4 border-b border-white/10">
                <button
                  onClick={(e) => handleLike(e, selectedPost)}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-rose-400 transition-colors"
                  data-testid="modal-like-btn"
                >
                  <Heart className="w-4 h-4" /> {selectedPost.likes || 0} {selectedPost.likes === 1 ? "blessing" : "blessings"}
                </button>
                <button
                  onClick={() => setShowReplies(!showReplies)}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-violet-400 transition-colors"
                  data-testid="toggle-replies-btn"
                >
                  <MessageCircle className="w-4 h-4" /> {selectedPost.comments?.length || 0} {selectedPost.comments?.length === 1 ? "reply" : "replies"}
                  {showReplies ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Replies section */}
              <AnimatePresence>
                {showReplies && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="py-4 space-y-3" data-testid="replies-section">
                      {selectedPost.comments?.length > 0 ? (
                        selectedPost.comments.map((comment, i) => (
                          <div key={comment.id || i} className="p-3 rounded-xl bg-violet-500/5 border border-violet-500/10" data-testid={`reply-${i}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-violet-300">{comment.author_name || "Sacred Seeker"}</span>
                              {comment.created_at && (
                                <span className="text-[10px] text-muted-foreground ml-auto">
                                  {new Date(comment.created_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">{comment.content}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground/60 text-center py-2">Be the first to share a reflection</p>
                      )}

                      {/* Reply form */}
                      <div className="mt-4 space-y-2" data-testid="reply-form">
                        <input
                          type="text"
                          placeholder="Your name (optional)"
                          value={replyAuthor}
                          onChange={e => setReplyAuthor(e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500/50 text-foreground placeholder:text-muted-foreground/50"
                          data-testid="reply-author-input"
                        />
                        <div className="flex gap-2">
                          <textarea
                            placeholder="Share your reflection..."
                            value={replyContent}
                            onChange={e => setReplyContent(e.target.value)}
                            rows={2}
                            className="flex-1 px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500/50 text-foreground placeholder:text-muted-foreground/50 resize-none"
                            data-testid="reply-content-input"
                          />
                          <Button
                            size="sm"
                            onClick={handleReply}
                            disabled={replyLoading || !replyContent.trim()}
                            className="bg-violet-500 hover:bg-violet-600 self-end"
                            data-testid="reply-submit-btn"
                          >
                            {replyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button variant="ghost" onClick={() => setSelectedPost(null)} className="w-full mt-4">
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
