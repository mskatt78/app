import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { getAuthToken, isLoggedIn } from "../../utils/clientStorage";
import { appLogger } from "../../utils/logger";

export const useCoursePayments = ({ api, navigate, searchParams }) => {
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const pollTimeoutRef = useRef(null);

  const fetchCourseAccess = useCallback(async () => {
    if (!isLoggedIn()) return;
    try {
      const token = getAuthToken();
      const { data } = await api.get("/payments/course-access", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPurchasedCourses(data.purchased_courses || []);
      setHasSubscription(data.has_subscription || false);
    } catch (error) {
      appLogger.warn("Failed to fetch course access", error);
    }
  }, [api, setHasSubscription, setPurchasedCourses]);

  const hasAccess = (courseId) => hasSubscription || purchasedCourses.includes(courseId);

  const pollPaymentStatus = useCallback(async (sessionId) => {
    const maxAttempts = 10;

    for (let attempts = 0; attempts < maxAttempts; attempts += 1) {
      try {
        const token = getAuthToken();
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
      } catch (error) {
        appLogger.warn("Payment status polling failed", error);
        if (attempts === maxAttempts - 1) {
          setCheckingPayment(false);
          toast.error("Error verifying payment.");
          return;
        }
      }

      await new Promise((resolve) => {
        pollTimeoutRef.current = window.setTimeout(resolve, 2000);
      });
    }

    setCheckingPayment(false);
    toast.error("Payment verification timed out. Please check your email.");
  }, [api, fetchCourseAccess]);

  const paymentSessionId = useMemo(() => searchParams.get("session_id"), [searchParams]);

  useEffect(() => {
    if (paymentSessionId && isLoggedIn()) {
      setCheckingPayment(true);
      pollPaymentStatus(paymentSessionId);
    }
  }, [paymentSessionId, pollPaymentStatus, setCheckingPayment]);

  useEffect(() => () => {
    if (pollTimeoutRef.current) {
      window.clearTimeout(pollTimeoutRef.current);
    }
  }, []);

  const handlePurchase = async (course) => {
    if (!isLoggedIn()) {
      toast.error("Please sign in to purchase courses");
      navigate("/");
      return;
    }

    setPurchaseLoading(true);
    try {
      const token = getAuthToken();
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
  };

  const handleBundlePurchase = async () => {
    if (!isLoggedIn()) {
      toast.error("Please sign in to purchase");
      navigate("/");
      return;
    }

    setPurchaseLoading(true);
    try {
      const token = getAuthToken();
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
  };

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