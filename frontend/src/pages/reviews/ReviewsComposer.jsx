import { motion } from "framer-motion";
import { Send, Star } from "lucide-react";
import { PRACTICE_AREAS } from "./reviewsConstants";
import { StarRating } from "./StarRating";

export const ReviewsComposer = ({
  user,
  showForm,
  setShowForm,
  myReview,
  form,
  setForm,
  submitReview,
  submitting,
  submitReviewLabel,
  navigate,
}) => {
  if (!user) {
    return (
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-3">Sign in to share your experience</p>
        <button
          onClick={() => navigate("/menu")}
          className="px-6 py-2.5 rounded-full border border-primary/30 text-primary text-sm hover:bg-primary/10 transition-colors"
          data-testid="reviews-sign-in-button"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (!showForm) {
    return (
      <button
        data-testid="write-review-btn"
        onClick={() => setShowForm(true)}
        className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
      >
        <Star className="w-4 h-4" />
        {myReview ? "Edit My Review" : "Write a Review"}
      </button>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={submitReview}
      data-testid="review-form"
      className="w-full max-w-xl bg-card/80 border border-white/10 rounded-2xl p-6 space-y-5 backdrop-blur-xl"
    >
      <h3 className="font-serif text-lg">{myReview ? "Update Your Review" : "Share Your Experience"}</h3>

      <div>
        <p className="text-sm text-muted-foreground mb-2">Your Rating</p>
        <StarRating value={form.rating} onChange={(value) => setForm({ ...form, rating: value })} size="w-8 h-8" />
      </div>

      <div>
        <p className="text-sm text-muted-foreground mb-2">Practice Area (optional)</p>
        <select
          value={form.practice_area}
          onChange={(event) => setForm({ ...form, practice_area: event.target.value })}
          data-testid="practice-area-select"
          className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
        >
          <option value="">— Select a practice —</option>
          {PRACTICE_AREAS.map((practiceArea) => <option key={practiceArea} value={practiceArea}>{practiceArea}</option>)}
        </select>
      </div>

      <div>
        <p className="text-sm text-muted-foreground mb-2">Your Review</p>
        <textarea
          value={form.text}
          onChange={(event) => setForm({ ...form, text: event.target.value })}
          placeholder="Share how this practice has touched your soul..."
          rows={4}
          maxLength={1000}
          data-testid="review-text-input"
          className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-primary/50"
        />
        <p className="text-xs text-muted-foreground text-right mt-1">{form.text.length}/1000</p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm hover:bg-white/5 transition-colors"
          data-testid="reviews-cancel-form-button"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          data-testid="submit-review-btn"
          className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          {submitReviewLabel}
        </button>
      </div>
    </motion.form>
  );
};
