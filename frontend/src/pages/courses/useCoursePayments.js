import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { getAuthToken, isLoggedIn } from "../../utils/clientStorage";

export const useCoursePayments = ({ api, navigate, searchParams }) => {
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);

  const getToken = useCallback(() => getAuthToken(), []);
  const isUserLoggedIn = useCallback(() => isLoggedIn(), []);

  const fetchCourseAccess = useCallback(async () => {
    if (!isUserLoggedIn()) return;
    try {
      const token = getToken();
      const { data } = await api.get("/payments/course-access", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPurchasedCourses(data.purchased_courses || []);
      setHasSubscription(data.has_subscription || false);
    } catch (error) {
      console.error("Failed to fetch course access:", error);
    }
  }, [api, getToken, isUserLoggedIn]);

  const hasAccess = useCallback(
    (courseId) => hasSubscription || purchasedCourses.includes(courseId),
    [hasSubscription, purchasedCourses],
  );

  const pollPaymentStatus = useCallback(async (sessionId, attempts = 0) => {
    const maxAttempts = 10;
    if (attempts >= maxAttempts) {
      setCheckingPayment(false);
      toast.error("Payment verification timed out. Please check your email.");
      return;
    }

    try {
      const token = getToken();
      const { data } = await api.get(`/payments/status/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.payment_status === "paid") {
        setCheckingPayment(false);
        toast.success("Payment successful! You now have access to the course.");
        fetchCourseAccess();
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      if (data.status === "expired") {
        setCheckingPayment(false);
        toast.error("Payment session expired.");
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), 2000);
    } catch (error) {
      console.error("Payment status polling failed:", error);
      if (attempts < 9) {
        setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), 2000);
      } else {
        setCheckingPayment(false);
        toast.error("Error verifying payment.");
      }
    }
  }, [api, fetchCourseAccess, getToken]);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (sessionId && isUserLoggedIn()) {
      setCheckingPayment(true);
      pollPaymentStatus(sessionId);
    }
  }, [searchParams, pollPaymentStatus, isUserLoggedIn]);

  const handlePurchase = useCallback(async (course) => {
    if (!isUserLoggedIn()) {
      toast.error("Please sign in to purchase courses");
      navigate("/");
      return;
    }

    setPurchaseLoading(true);
    try {
      const token = getToken();
      const { data } = await api.post(
        "/payments/create-checkout",
        {
          product_type: "course",
          product_id: course.id,
          origin_url: window.location.origin,
          payment_method: "stripe",
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        toast.error("Could not create checkout session");
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to start checkout");
    } finally {
      setPurchaseLoading(false);
    }
  }, [api, getToken, isUserLoggedIn, navigate]);

  const handleBundlePurchase = useCallback(async () => {
    if (!isUserLoggedIn()) {
      toast.error("Please sign in to purchase");
      navigate("/");
      return;
    }

    setPurchaseLoading(true);
    try {
      const token = getToken();
      const { data } = await api.post(
        "/payments/create-checkout",
        {
          product_type: "bundle",
          product_id: "sacred-rites-bundle",
          origin_url: window.location.origin,
          payment_method: "stripe",
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        toast.error("Could not create checkout session");
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to start checkout");
    } finally {
      setPurchaseLoading(false);
    }
  }, [api, getToken, isUserLoggedIn, navigate]);

  return {
    purchasedCourses,
    hasSubscription,
    purchaseLoading,
    checkingPayment,
    fetchCourseAccess,
    handlePurchase,
    handleBundlePurchase,
    hasAccess,
  };
};