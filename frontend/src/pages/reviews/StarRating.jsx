import { Star } from "lucide-react";

export const StarRating = ({ value, onChange, size = "w-6 h-6", readonly = false }) => (
  <div className="flex gap-1" data-testid="reviews-star-rating">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        disabled={readonly}
        onClick={() => onChange && onChange(star)}
        data-testid={`star-${star}`}
        className={`${size} transition-transform ${!readonly ? "hover:scale-110 cursor-pointer" : "cursor-default"}`}
      >
        <Star className={`${size} ${star <= value ? "fill-amber-400 text-amber-400" : "text-white/20"}`} />
      </button>
    ))}
  </div>
);
