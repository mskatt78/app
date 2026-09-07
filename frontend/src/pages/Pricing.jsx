import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Check, Crown, Sparkles, CreditCard, Loader2,
  Star, Heart, Zap
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { appLogger } from "../utils/logger";
import {
  isPlayBillingAvailable,
  getPlayPrices,
  purchaseViaPlay,
  restorePlayPurchases,
} from "../utils/playBilling";

const Pricing = ({ user, api }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("stripe");
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [playBilling, setPlayBilling] = useState(false);
  const [playConfig, setPlayConfig] = useState(null);
  const [playPrices, setPlayPrices] = useState({});
  const [restoring, setRestoring] = useState(false);

  const displayPlans = useMemo(() => {
    const order = ["monthly", "yearly", "full_app_unlock"];
    return [...plans]
      .filter((plan) => order.includes(plan.id))
      .sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  }, [plans]);

  const fetchData = useCallback(async () => {
    // Fetch plans (public endpoint - always works)
    try {
      const plansRes = await api.get("/payments/plans");
      setPlans(plansRes.data.plans || []);
    } catch (error) {
      appLogger.error("Failed to fetch pricing plans", error);
    }

    // Determine auth state (public endpoint)
    try {
      const authRes = await api.get("/auth/status");
      setIsAuthenticated(Boolean(authRes.data?.authenticated));
    } catch (error) {
      appLogger.warn("Auth status check failed", error);
    }

    // Fetch subscription status (requires auth - may fail for unauthenticated users)
    try {
      const subRes = await api.get("/payments/subscription-status");
      setSubscription(subRes.data);
    } catch (error) {
      appLogger.warn("Subscription status fetch failed", error);
    }
    
    setLoading(false);
  }, [api]);

  useEffect(() => {
    let cancelled = false;
    const initPlayBilling = async () => {
      const available = await isPlayBillingAvailable();
      if (cancelled || !available) return;
      setPlayBilling(true);
      try {
        const { data: config } = await api.get("/playbilling/config");
        if (cancelled) return;
        setPlayConfig(config);
        const sub = config.subscription_product_id;
        const skus = [`${sub}:monthly`, `${sub}:yearly`, sub];
        if (config.lifetime_product_id) skus.push(config.lifetime_product_id);
        const prices = await getPlayPrices(skus);
        if (!cancelled) setPlayPrices(prices);
      } catch (error) {
        appLogger.warn("Play billing config fetch failed", error);
      }
    };
    initPlayBilling();
    return () => {
      cancelled = true;
    };
  }, [api]);

  const playSkuForPlan = useCallback((planId) => {
    if (!playConfig) return null;
    if (planId === "full_app_unlock") return playConfig.lifetime_product_id || null;
    const sub = playConfig.subscription_product_id;
    const basePlanSku = `${sub}:${planId}`;
    return playPrices[basePlanSku] ? basePlanSku : sub;
  }, [playConfig, playPrices]);

  const playPriceForPlan = useCallback((planId) => {
    const sku = playSkuForPlan(planId);
    return sku ? playPrices[sku]?.formatted || null : null;
  }, [playSkuForPlan, playPrices]);

  const handlePlaySubscribe = async (planId) => {
    const isLifetime = planId === "full_app_unlock";
    if (isLifetime && !playConfig?.lifetime_product_id) {
      toast.info("Lifetime access inside the Android app is coming soon — you can purchase it on our website meanwhile.");
      return;
    }
    const sku = playSkuForPlan(planId);
    if (!sku) {
      toast.error("Google Play product unavailable. Please try again later.");
      return;
    }
    setProcessingPlan(planId);
    try {
      const { response, purchaseToken } = await purchaseViaPlay(sku);
      if (!purchaseToken) {
        await response.complete("fail");
        throw new Error("Missing purchase token");
      }
      try {
        await api.post("/playbilling/verify", {
          product_id: isLifetime ? playConfig.lifetime_product_id : playConfig.subscription_product_id,
          purchase_token: purchaseToken,
          kind: isLifetime ? "onetime" : "subscription",
        });
        await response.complete("success");
        toast.success("Purchase confirmed — welcome to your membership");
        fetchData();
      } catch (verifyError) {
        await response.complete("fail");
        throw verifyError;
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        appLogger.error("Play billing purchase failed", error);
        toast.error(error?.response?.data?.detail || "Purchase could not be completed. Please try again.");
      }
    } finally {
      setProcessingPlan(null);
    }
  };

  const handleRestorePurchases = async () => {
    if (restoring) return;
    setRestoring(true);
    try {
      const result = await restorePlayPurchases(api, playConfig);
      if (result.restored > 0) {
        toast.success("Your purchases have been restored");
        fetchData();
      } else if (result.found === 0) {
        toast.info("No previous Google Play purchases found for this account");
      } else {
        toast.error("Could not restore purchases. Please try again.");
      }
    } finally {
      setRestoring(false);
    }
  };

  const checkPaymentStatus = useCallback(async (sessionId) => {
    try {
      const response = await api.get(`/payments/status/${sessionId}`);
      if (response.data.payment_status === "paid") {
        toast.success("Payment successful! Welcome to your membership.");
        fetchData(); // Refresh subscription status
      }
    } catch (error) {
      appLogger.warn("Payment status check failed", error);
    }
  }, [api, fetchData]);

  const capturePayPalOrder = useCallback(async (orderId) => {
    try {
      const response = await api.post(`/payments/paypal/capture/${orderId}`);
      if (response.data.payment_status === "paid") {
        toast.success("PayPal payment successful! Welcome to your membership.");
        fetchData();
      } else {
        toast.error("Payment not completed. Please try again.");
      }
    } catch (error) {
      appLogger.error("PayPal capture failed", error);
      toast.error("Failed to complete PayPal payment.");
    }
  }, [api, fetchData]);

  useEffect(() => {
    fetchData();
    
    // Check for return from payment
    const sessionId = searchParams.get("session_id");
    const isPayPal = searchParams.get("paypal");
    const token = searchParams.get("token"); // PayPal returns token param
    
    if (sessionId) {
      checkPaymentStatus(sessionId);
    } else if (isPayPal && token) {
      // Handle PayPal return - need to capture the order
      capturePayPalOrder(token);
    }
  }, [capturePayPalOrder, checkPaymentStatus, fetchData, searchParams]);

  const handleSubscribe = async (planId) => {
    if (processingPlan !== null) return;
    if (isAuthenticated === false) {
      toast.error("Please sign in first to begin your membership");
      navigate("/");
      return;
    }
    if (playBilling) {
      await handlePlaySubscribe(planId);
      return;
    }
    setProcessingPlan(planId);
    try {
      const isLifetime = planId === "full_app_unlock";
      const response = await api.post("/payments/create-checkout", {
        product_type: isLifetime ? "premium_unlock" : "subscription",
        product_id: isLifetime ? "full_app_unlock" : undefined,
        plan_id: isLifetime ? undefined : planId,
        origin_url: window.location.origin,
        return_path: "/pricing",
        payment_method: selectedPaymentMethod
      });
      
      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
        return;
      }
      throw new Error("No checkout URL returned");
    } catch (error) {
      appLogger.error("Checkout error", error);
      const status = error?.response?.status;
      const errorMsg = status === 401
        ? "Please sign in first to begin your membership"
        : error.response?.data?.detail || "Failed to start checkout. Please try again.";
      toast.error(errorMsg);
      if (status === 401) navigate("/");
      setProcessingPlan(null);
    }
  };

  const planStyles = {
    monthly: {
      card: "border-cyan-500/40 bg-gradient-to-b from-cyan-500/10 to-transparent",
      icon: <Sparkles className="w-6 h-6 text-cyan-300" />,
      button: "bg-cyan-600 hover:bg-cyan-500 text-white",
    },
    yearly: {
      card: "border-emerald-500/40 bg-gradient-to-b from-emerald-500/10 to-transparent",
      icon: <Star className="w-6 h-6 text-emerald-300" />,
      button: "bg-emerald-600 hover:bg-emerald-500 text-white",
    },
    full_app_unlock: {
      card: "border-primary/50 bg-gradient-to-b from-primary/10 to-transparent",
      icon: <Crown className="w-6 h-6 text-primary" />,
      button: "bg-primary hover:bg-primary/90",
    },
  };

  return (
    <div className="min-h-screen bg-background" data-testid="pricing-page">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 rounded-full hover:bg-white/5 transition-colors"
            data-testid="back-btn"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Sacred Investment</p>
            <h1 className="text-xl font-serif">Sacred <span className="italic text-primary">Access</span></h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-12">
        {/* Current Status */}
        {subscription?.is_subscribed && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30"
          >
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-serif">Active Membership</h2>
            </div>
            <p className="text-muted-foreground">
              You have an active <span className="text-primary font-medium">{subscription.plan}</span> membership.
              {subscription.expires_at && (
                <span> Expires: {new Date(subscription.expires_at).toLocaleDateString()}</span>
              )}
            </p>
          </motion.div>
        )}

        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-serif">
            Choose Your <span className="italic text-primary">Path</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            One place for membership and lifetime access. Choose what fits your sacred journey.
          </p>
          {isAuthenticated === false && (
            <p className="text-sm text-amber-300/90" data-testid="pricing-signin-hint">
              You'll need to sign in before starting checkout —{" "}
              <button onClick={() => navigate("/")} className="underline underline-offset-2 hover:text-amber-200" data-testid="pricing-signin-link">
                sign in here
              </button>
            </p>
          )}
        </div>

        {/* Plans Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {displayPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`relative overflow-hidden h-full ${(planStyles[plan.id] || planStyles.full_app_unlock).card}`}
                >
                  {plan.savings && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-green-500 text-white">{plan.savings}</Badge>
                    </div>
                  )}
                  
                  <CardHeader className="pb-4 pt-12">
                    <div className="flex items-center gap-2 mb-2">
                      {(planStyles[plan.id] || planStyles.full_app_unlock).icon}
                      <CardTitle className="text-xl font-serif">{plan.name}</CardTitle>
                    </div>
                    <div className="flex items-baseline gap-1">
                      {playBilling && playPriceForPlan(plan.id) ? (
                        <span className="text-4xl font-bold" data-testid={`plan-price-${plan.id}`}>{playPriceForPlan(plan.id)}</span>
                      ) : (
                        <span className="text-4xl font-bold" data-testid={`plan-price-${plan.id}`}>
                          <span className="text-lg font-medium text-muted-foreground mr-1">AUD</span>${plan.price}
                        </span>
                      )}
                      <span className="text-muted-foreground">{plan.interval === "lifetime" ? "one-time" : `/${plan.interval}`}</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features?.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                          <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={processingPlan !== null || (plan.id !== "full_app_unlock" && subscription?.is_subscribed)}
                      className={`w-full ${(planStyles[plan.id] || planStyles.full_app_unlock).button}`}
                      data-testid={`subscribe-${plan.id}`}
                    >
                      {processingPlan === plan.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : plan.id !== "full_app_unlock" && subscription?.is_subscribed ? (
                        "Already Subscribed"
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          {plan.id === "full_app_unlock" ? "Get Lifetime Access" : "Subscribe Now"}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
 
        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 pt-12">
          <div className="text-center p-6 rounded-2xl bg-white/5">
            <Star className="w-10 h-10 text-primary mx-auto mb-4" />
            <h3 className="font-medium mb-2">60+ Yoga Poses</h3>
            <p className="text-sm text-muted-foreground">Complete library with element associations and instructions</p>
          </div>
          <div className="text-center p-6 rounded-2xl bg-white/5">
            <Heart className="w-10 h-10 text-rose-400 mx-auto mb-4" />
            <h3 className="font-medium mb-2">Shamanic Practices</h3>
            <p className="text-sm text-muted-foreground">16 ceremonies including fire, cord cutting, and vision quest</p>
          </div>
          <div className="text-center p-6 rounded-2xl bg-white/5">
            <Zap className="w-10 h-10 text-yellow-400 mx-auto mb-4" />
            <h3 className="font-medium mb-2">Oracle Readings</h3>
            <p className="text-sm text-muted-foreground">Personalized readings and spiritual guidance</p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="text-center pt-8 border-t border-white/10">
          {playBilling ? (
            <div className="space-y-4" data-testid="play-billing-section">
              <p className="text-sm text-muted-foreground">
                Purchases in the Android app are billed securely through <span className="text-foreground font-medium">Google Play</span>.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRestorePurchases}
                disabled={restoring}
                data-testid="play-restore-purchases-btn"
              >
                {restoring ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Restoring...
                  </>
                ) : (
                  "Restore purchases"
                )}
              </Button>
            </div>
          ) : (
            <>
          <p className="text-sm text-muted-foreground mb-4">Choose your payment method</p>
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={() => setSelectedPaymentMethod("stripe")}
              className={`px-6 py-3 rounded-xl border-2 transition-all ${
                selectedPaymentMethod === "stripe"
                  ? "border-[#635BFF] bg-[#635BFF]/10"
                  : "border-white/10 bg-white/5 hover:border-white/30"
              }`}
              data-testid="payment-stripe"
            >
              <span className="font-bold text-[#635BFF]">stripe</span>
            </button>
            <button
              onClick={() => setSelectedPaymentMethod("paypal")}
              className={`px-6 py-3 rounded-xl border-2 transition-all ${
                selectedPaymentMethod === "paypal"
                  ? "border-[#003087] bg-[#003087]/10"
                  : "border-white/10 bg-white/5 hover:border-white/30"
              }`}
              data-testid="payment-paypal"
            >
              <span className="font-bold text-[#003087]">Pay</span>
              <span className="font-bold text-[#009CDE]">Pal</span>
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            {selectedPaymentMethod === "stripe" 
              ? "Credit/Debit cards accepted via Stripe" 
              : "Pay securely with your PayPal account"}
          </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Pricing;
