import { motion } from "framer-motion";
import { Eye, Share2, Star } from "lucide-react";
import { formatReviewDate, getAvatarColor } from "./reviewsConstants";
import { StarRating } from "./StarRating";

export const ReviewsGrid = ({ loading, reviews, setShareItem }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-16" data-testid="reviews-loading-state">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!reviews.length) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 text-muted-foreground" data-testid="empty-reviews">
        <Star className="w-12 h-12 mx-auto mb-4 opacity-20" />
        <p className="text-lg font-serif">Be the first to share your experience</p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="reviews-grid">
      {reviews.map((review, index) => (
        <motion.div
          key={review.review_id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04 }}
          data-testid={`review-card-${review.review_id}`}
          className="group relative p-5 rounded-2xl bg-card/60 border border-white/8 backdrop-blur-xl hover:border-white/15 transition-all"
        >
          <button
            onClick={() => setShareItem(review)}
            data-testid={`share-review-${review.review_id}`}
            className="absolute top-4 right-4 p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all"
            title="Share this review"
          >
            <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-full border flex items-center justify-center text-sm font-bold flex-shrink-0 ${getAvatarColor(review.user_name)}`}>
              {review.initials}
            </div>
            <div>
              <p className="text-sm font-medium">{review.user_name}</p>
              <p className="text-xs text-muted-foreground">{formatReviewDate(review.created_at)}</p>
            </div>
          </div>

          <StarRating value={review.rating} size="w-4 h-4" readonly />

          <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-5">
            &quot;{review.text}&quot;
          </p>

          {review.practice_area && (
            <span className="mt-3 inline-block px-2.5 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
              {review.practice_area}
            </span>
          )}

          <div className="sr-only" data-testid={`review-open-indicator-${review.review_id}`}>
            <Eye className="w-4 h-4" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};
