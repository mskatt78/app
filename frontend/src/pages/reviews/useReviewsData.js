import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { appLogger } from "../../utils/logger";

const INITIAL_FORM = { rating: 5, text: "", practice_area: "" };

export const useReviewsData = ({ api, user }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [myReview, setMyReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [shareItem, setShareItem] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [reviewsRes, statsRes] = await Promise.all([
        api.get("/reviews"),
        api.get("/reviews/stats"),
      ]);
      setReviews(reviewsRes.data);
      setStats(statsRes.data);

      if (!user) {
        setMyReview(null);
        setForm(INITIAL_FORM);
        return;
      }

      try {
        const myRes = await api.get("/reviews/my-review");
        if (myRes.data) {
          setMyReview(myRes.data);
          setForm({
            rating: myRes.data.rating,
            text: myRes.data.text,
            practice_area: myRes.data.practice_area || "",
          });
        }
      } catch (error) {
        appLogger.error("Failed loading current user review:", error);
      }
    } catch (error) {
      appLogger.error("Failed to load reviews:", error);
    } finally {
      setLoading(false);
    }
  }, [api, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const submitReview = useCallback(async (event) => {
    event.preventDefault();

    if (!user) {
      toast.error("Please sign in to leave a review");
      return;
    }

    if (form.text.trim().length < 10) {
      toast.error("Review must be at least 10 characters");
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post("/reviews", {
        rating: form.rating,
        text: form.text.trim(),
        practice_area: form.practice_area || null,
      });

      setMyReview(response.data);
      setShowForm(false);
      toast.success(myReview ? "Review updated!" : "Thank you for your review!");
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  }, [api, form, loadData, myReview, user]);

  const submitReviewLabel = submitting ? "Sending..." : myReview ? "Update" : "Submit";

  return {
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
  };
};
