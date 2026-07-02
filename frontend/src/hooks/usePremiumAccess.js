import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { appLogger } from "../utils/logger";

const EMPTY_SECTIONS = {
  yoga_poses: false,
  shamanic_practices: false,
  heart_practices: false,
  elemental_practices: false,
  mindfulness_practices: false,
  meditations: false,
  water_practices: false,
  chakra_cleansing: false,
  somatic_practices: false,
  grounding_practices: false,
  masculine_embodiment: false,
  sacred_allies: false,
  angelic_alchemy: false,
  sacred_guardians: false,
  ancient_wisdom: false,
  sound_frequencies: false,
  sacred_art_therapy: false,
  energy_healing: false,
  elemental_temples: false,
  seasonal_temple: false,
  premium_mantras: false,
  premium_breathwork: false,
  rose_temple: false,
  masculine_temple: false,
  healing_portals: false,
  light_codes: false,
  crystals: false,
  tarot: false,
  runes: false,
  i_ching: false,
  free_form_movement: false,
};

const SESSION_STATUS_LIMIT = 10;

export const usePremiumAccess = ({ api, user }) => {
  const [loading, setLoading] = useState(true);
  const [purchaseLoadingId, setPurchaseLoadingId] = useState("");
  const [products, setProducts] = useState([]);
  const [entitlements, setEntitlements] = useState({
    has_subscription: false,
    has_full_app_unlock: false,
    sections: EMPTY_SECTIONS,
    purchased_unlocks: [],
  });

  const isMountedRef = useRef(true);

  const fetchPremiumState = useCallback(async () => {
    if (!isMountedRef.current) return;
    setLoading(true);
    try {
      const [productsRes, entitlementsRes] = await Promise.all([
        api.get("/payments/premium-products"),
        user ? api.get("/payments/entitlements") : Promise.resolve({ data: null }),
      ]);

      if (!isMountedRef.current) return;

      setProducts(productsRes?.data?.products || []);
      if (user && entitlementsRes?.data) {
        setEntitlements({
          has_subscription: Boolean(entitlementsRes.data.has_subscription),
          has_full_app_unlock: Boolean(entitlementsRes.data.has_full_app_unlock),
          sections: { ...EMPTY_SECTIONS, ...(entitlementsRes.data.sections || {}) },
          purchased_unlocks: entitlementsRes.data.purchased_unlocks || [],
        });
      } else {
        setEntitlements({
          has_subscription: false,
          has_full_app_unlock: false,
          sections: EMPTY_SECTIONS,
          purchased_unlocks: [],
        });
      }
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        setEntitlements({
          has_subscription: false,
          has_full_app_unlock: false,
          sections: EMPTY_SECTIONS,
          purchased_unlocks: [],
        });
      } else {
        appLogger.warn("Failed to load premium access state", error);
      }
    } finally {
      if (!isMountedRef.current) return;
      setLoading(false);
    }
  }, [api, user]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchPremiumState();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchPremiumState]);

  const isSectionUnlocked = useCallback(
    (sectionId) => {
      if (!user) return false;
      if (entitlements.has_subscription || entitlements.has_full_app_unlock) return true;
      return Boolean(entitlements.sections?.[sectionId]);
    },
    [entitlements.has_full_app_unlock, entitlements.has_subscription, entitlements.sections, user],
  );

  const findProduct = useCallback(
    (productId) => products.find((product) => product.id === productId),
    [products],
  );

  const pollCheckoutStatus = useCallback(
    async (sessionId) => {
      for (let attempt = 0; attempt < SESSION_STATUS_LIMIT; attempt += 1) {
        try {
          const { data } = await api.get(`/payments/status/${sessionId}`);
          if (data.payment_status === "paid") {
            await fetchPremiumState();
            return { paid: true };
          }
          if (data.status === "expired") {
            return { paid: false, expired: true };
          }
        } catch (error) {
          appLogger.warn("Premium checkout status poll failed", error);
        }
        await new Promise((resolve) => window.setTimeout(resolve, 2000));
      }
      return { paid: false, timeout: true };
    },
    [api, fetchPremiumState],
  );

  const startPurchase = useCallback(
    async ({ productId, returnPath }) => {
      if (!user) {
        toast.error("Please sign in first to unlock premium sections");
        return;
      }

      setPurchaseLoadingId(productId);
      try {
        const { data } = await api.post("/payments/create-checkout", {
          product_type: "premium_unlock",
          product_id: productId,
          origin_url: window.location.origin,
          return_path: returnPath,
          payment_method: "stripe",
        });

        if (data?.checkout_url) {
          window.location.href = data.checkout_url;
          return;
        }
        toast.error("Unable to start checkout.");
      } catch (error) {
        appLogger.error("Premium checkout creation failed", error);
        toast.error(error?.response?.data?.detail || "Unable to start premium checkout.");
      } finally {
        setPurchaseLoadingId("");
      }
    },
    [api, user],
  );

  const finalizeCheckoutIfPresent = useCallback(
    async ({ search, clearUrl = true }) => {
      const params = new URLSearchParams(search || "");
      const sessionId = params.get("session_id");
      if (!sessionId || !user) return;

      const result = await pollCheckoutStatus(sessionId);
      if (result.paid) {
        toast.success("Premium unlock successful — access is now active.");
      } else if (result.expired) {
        toast.error("Payment session expired.");
      } else if (result.timeout) {
        toast.error("Payment verification timed out. Please try again.");
      }

      if (clearUrl) {
        const url = new URL(window.location.href);
        url.searchParams.delete("session_id");
        window.history.replaceState({}, document.title, `${url.pathname}${url.search}`);
      }
    },
    [pollCheckoutStatus, user],
  );

  const summary = useMemo(
    () => ({
      hasAnyPremium:
        Boolean(entitlements.has_subscription) ||
        Boolean(entitlements.has_full_app_unlock) ||
        Object.values(entitlements.sections || {}).some(Boolean),
    }),
    [entitlements.has_full_app_unlock, entitlements.has_subscription, entitlements.sections],
  );

  return {
    loading,
    products,
    entitlements,
    purchaseLoadingId,
    isSectionUnlocked,
    findProduct,
    startPurchase,
    finalizeCheckoutIfPresent,
    refreshPremiumState: fetchPremiumState,
    summary,
  };
};
