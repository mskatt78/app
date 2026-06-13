import { useNavigate } from "react-router-dom";
import ShareModal from "../../components/ShareModal";
import { renderStarsText } from "./reviewsConstants";
import { ReviewsComposer } from "./ReviewsComposer";
import { ReviewsGrid } from "./ReviewsGrid";
import { ReviewsHeader } from "./ReviewsHeader";
import { ReviewsHeroStats } from "./ReviewsHeroStats";
import { useReviewsData } from "./useReviewsData";

const ReviewsContainer = ({ user, api }) => {
  const navigate = useNavigate();
  const {
    reviews,
    stats,
    myReview,
    loading,
    submitting,
    showForm,
    shareItem,
    form,
    submitReviewLabel,
    setForm,
    setShowForm,
    setShareItem,
    submitReview,
  } = useReviewsData({ api, user });

  return (
    <div className="min-h-screen bg-background" data-testid="reviews-page">
      <ReviewsHeader navigate={navigate} />

      <main className="max-w-5xl mx-auto p-6 space-y-10">
        <ReviewsHeroStats stats={stats} />

        <div className="flex justify-center" data-testid="reviews-composer-section">
          <ReviewsComposer
            user={user}
            showForm={showForm}
            setShowForm={setShowForm}
            myReview={myReview}
            form={form}
            setForm={setForm}
            submitReview={submitReview}
            submitting={submitting}
            submitReviewLabel={submitReviewLabel}
            navigate={navigate}
          />
        </div>

        <ReviewsGrid loading={loading} reviews={reviews} setShareItem={setShareItem} />
      </main>

      {shareItem && (
        <ShareModal
          isOpen={!!shareItem}
          onClose={() => setShareItem(null)}
          title="Shamanic Elements Soul Temple 2.0"
          description={`"${shareItem.text.slice(0, 120)}${shareItem.text.length > 120 ? "..." : ""}" — ${shareItem.user_name} ${renderStarsText(shareItem.rating)}`}
          url={window.location.origin + "/reviews"}
        />
      )}
    </div>
  );
};

export default ReviewsContainer;
