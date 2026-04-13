import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Star, Send, Sparkles, MessageCircle, Share2 } from "lucide-react";
import { toast } from "sonner";
import ShareModal from "../components/ShareModal";

const PRACTICE_AREAS = [
  "Yoga", "Meditation", "Breathwork", "Oracle Readings", "Rune Readings",
  "I Ching", "Crystals", "Shamanic Practices", "Light Codes", "Somatic Movement",
  "Gene Keys", "Human Design", "Water Practices", "Rose Temple", "Elemental Temples",
];

const AVATAR_COLORS = [
  "bg-rose-500/30 text-rose-300 border-rose-500/30",
  "bg-violet-500/30 text-violet-300 border-violet-500/30",
  "bg-amber-500/30 text-amber-300 border-amber-500/30",
  "bg-teal-500/30 text-teal-300 border-teal-500/30",
  "bg-blue-500/30 text-blue-300 border-blue-500/30",
  "bg-emerald-500/30 text-emerald-300 border-emerald-500/30",
  "bg-pink-500/30 text-pink-300 border-pink-500/30",
  "bg-indigo-500/30 text-indigo-300 border-indigo-500/30",
];

const getAvatarColor = (name = "") => {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
};

const StarRating = ({ value, onChange, size = "w-6 h-6", readonly = false }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        disabled={readonly}
        onClick={() => onChange && onChange(star)}
        data-testid={`star-${star}`}
        className={`${size} transition-transform ${!readonly ? "hover:scale-110 cursor-pointer" : "cursor-default"}`}
      >
        <Star
          className={`${size} ${star <= value ? "fill-amber-400 text-amber-400" : "text-white/20"}`}
        />
      </button>
    ))}
  </div>
);

const Reviews = ({ user, api }) => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [myReview, setMyReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [shareItem, setShareItem] = useState(null);

  const [form, setForm] = useState({ rating: 5, text: "", practice_area: "" });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [reviewsRes, statsRes] = await Promise.all([
        api.get("/reviews"),
        api.get("/reviews/stats"),
      ]);
      setReviews(reviewsRes.data);
      setStats(statsRes.data);

      if (user) {
        try {
          const myRes = await api.get("/reviews/my-review");
          if (myRes.data) {
            setMyReview(myRes.data);
            setForm({ rating: myRes.data.rating, text: myRes.data.text, practice_area: myRes.data.practice_area || "" });
          }
        } catch {
          // User has no existing personal review yet.
        }
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  }, [api, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error("Please sign in to leave a review"); return; }
    if (form.text.trim().length < 10) { toast.error("Review must be at least 10 characters"); return; }

    setSubmitting(true);
    try {
      const res = await api.post("/reviews", {
        rating: form.rating,
        text: form.text.trim(),
        practice_area: form.practice_area || null,
      });
      setMyReview(res.data);
      setShowForm(false);
      toast.success(myReview ? "Review updated!" : "Thank you for your review!");
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
    } catch { return ""; }
  };

  const renderStars = (n) => "★".repeat(n) + "☆".repeat(5 - n);

  return (
    <div className="min-h-screen bg-background" data-testid="reviews-page">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button data-testid="back-btn" onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/5 transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Community</p>
              <h1 className="text-xl font-serif">Temple <span className="italic text-primary">Reviews</span></h1>
            </div>
          </div>
          <MessageCircle className="w-6 h-6 text-primary/40" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-10">

        {/* Hero / Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center pt-4">
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-serif mb-2">Sacred Community <span className="italic text-primary">Voices</span></h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            Hear from seekers who have walked through these sacred temples. Their words carry the medicine of lived experience.
          </p>

          {stats && stats.total > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="mt-8 inline-flex flex-col items-center gap-2 px-8 py-5 rounded-2xl bg-amber-500/10 border border-amber-500/20"
              data-testid="stats-block"
            >
              <div className="text-5xl font-bold text-amber-400">{stats.average}</div>
              <StarRating value={Math.round(stats.average)} size="w-5 h-5" readonly />
              <p className="text-sm text-muted-foreground">{stats.total} {stats.total === 1 ? "review" : "reviews"}</p>
            </motion.div>
          )}
        </motion.div>

        {/* Write Review Button / Form */}
        <div className="flex justify-center">
          {user ? (
            !showForm ? (
              <button
                data-testid="write-review-btn"
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
              >
                <Star className="w-4 h-4" />
                {myReview ? "Edit My Review" : "Write a Review"}
              </button>
            ) : (
              <motion.form
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={submitReview}
                data-testid="review-form"
                className="w-full max-w-xl bg-card/80 border border-white/10 rounded-2xl p-6 space-y-5 backdrop-blur-xl"
              >
                <h3 className="font-serif text-lg">{myReview ? "Update Your Review" : "Share Your Experience"}</h3>

                {/* Star Rating */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Your Rating</p>
                  <StarRating value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} size="w-8 h-8" />
                </div>

                {/* Practice Area */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Practice Area (optional)</p>
                  <select
                    value={form.practice_area}
                    onChange={(e) => setForm({ ...form, practice_area: e.target.value })}
                    data-testid="practice-area-select"
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
                  >
                    <option value="">— Select a practice —</option>
                    {PRACTICE_AREAS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                {/* Review Text */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Your Review</p>
                  <textarea
                    value={form.text}
                    onChange={(e) => setForm({ ...form, text: e.target.value })}
                    placeholder="Share how this practice has touched your soul..."
                    rows={4}
                    maxLength={1000}
                    data-testid="review-text-input"
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-primary/50"
                  />
                  <p className="text-xs text-muted-foreground text-right mt-1">{form.text.length}/1000</p>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm hover:bg-white/5 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} data-testid="submit-review-btn"
                    className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50">
                    <Send className="w-4 h-4" />
                    {submitting ? "Sending..." : myReview ? "Update" : "Submit"}
                  </button>
                </div>
              </motion.form>
            )
          ) : (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">Sign in to share your experience</p>
              <button
                onClick={() => navigate("/menu")}
                className="px-6 py-2.5 rounded-full border border-primary/30 text-primary text-sm hover:bg-primary/10 transition-colors"
              >
                Sign In
              </button>
            </div>
          )}
        </div>

        {/* Review Cards */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-16 text-muted-foreground"
            data-testid="empty-reviews"
          >
            <Star className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-serif">Be the first to share your experience</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="reviews-grid">
            {reviews.map((review, i) => (
              <motion.div
                key={review.review_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                data-testid={`review-card-${review.review_id}`}
                className="group relative p-5 rounded-2xl bg-card/60 border border-white/8 backdrop-blur-xl hover:border-white/15 transition-all"
              >
                {/* Share button */}
                <button
                  onClick={() => setShareItem(review)}
                  data-testid={`share-review-${review.review_id}`}
                  className="absolute top-4 right-4 p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all"
                  title="Share this review"
                >
                  <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
                </button>

                {/* Avatar + Name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full border flex items-center justify-center text-sm font-bold flex-shrink-0 ${getAvatarColor(review.user_name)}`}>
                    {review.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{review.user_name}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(review.created_at)}</p>
                  </div>
                </div>

                {/* Stars */}
                <StarRating value={review.rating} size="w-4 h-4" readonly />

                {/* Text */}
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-5">
                  "{review.text}"
                </p>

                {/* Practice Area Tag */}
                {review.practice_area && (
                  <span className="mt-3 inline-block px-2.5 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
                    {review.practice_area}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Share Modal */}
      {shareItem && (
        <ShareModal
          isOpen={!!shareItem}
          onClose={() => setShareItem(null)}
          title="Shamanic Elements Soul Temple 2.0"
          description={`"${shareItem.text.slice(0, 120)}${shareItem.text.length > 120 ? "..." : ""}" — ${shareItem.user_name} ${renderStars(shareItem.rating)}`}
          url={window.location.origin + "/reviews"}
        />
      )}
    </div>
  );
};

export default Reviews;
