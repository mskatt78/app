import { useState, useEffect, useCallback } from "react";
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
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";

const Pricing = ({ user, api }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("stripe");
  const [pricingMode, setPricingMode] = useState("one-time");

  const fetchData = useCallback(async () => {
    // Fetch plans (public endpoint - always works)
    try {
      const plansRes = await api.get("/payments/plans");
      setPlans(plansRes.data.plans || []);
    } catch (error) {
      appLogger.error("Failed to fetch pricing plans", error);
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
    setProcessingPlan(planId);
    try {
      const response = await api.post("/payments/create-checkout", {
        product_type: "subscription",
        plan_id: planId,
        origin_url: window.location.origin,
        payment_method: selectedPaymentMethod
      });
      
      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      }
    } catch (error) {
      appLogger.error("Checkout error", error);
      const errorMsg = error.response?.data?.detail || "Failed to start checkout. Please try again.";
      toast.error(errorMsg);
      setProcessingPlan(null);
    }
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
            <h1 className="text-xl font-serif">Membership <span className="italic text-primary">Plans</span></h1>
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
            Unlock Your <span className="italic text-primary">Full Potential</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join our sacred community and gain unlimited access to all yoga poses, shamanic practices, 
            guided meditations, and transformative content.
          </p>
          <div className="flex items-center justify-center" data-testid="pricing-mode-tabs-wrap">
            <Tabs value={pricingMode} onValueChange={setPricingMode}>
              <TabsList className="bg-white/5 border border-white/10" data-testid="pricing-mode-tabs">
                <TabsTrigger value="one-time" data-testid="pricing-mode-one-time">One-time</TabsTrigger>
                <TabsTrigger value="monthly" data-testid="pricing-mode-monthly">Monthly (preview)</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          {pricingMode === "monthly" && (
            <p className="text-xs text-muted-foreground" data-testid="pricing-monthly-placeholder-note">
              Monthly/recurring options are shown as a UI preview. Current checkout remains one-time or existing membership plans.
            </p>
          )}
        </div>

        {/* Plans Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`relative overflow-hidden h-full ${
                    plan.id === "yearly" 
                      ? "border-primary/50 bg-gradient-to-b from-primary/10 to-transparent" 
                      : "border-white/10 bg-card/50"
                  }`}
                >
                  {plan.savings && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-green-500 text-white">{plan.savings}</Badge>
                    </div>
                  )}
                  
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      {plan.id === "yearly" ? (
                        <Crown className="w-6 h-6 text-primary" />
                      ) : (
                        <Sparkles className="w-6 h-6 text-primary" />
                      )}
                      <CardTitle className="text-xl font-serif">{plan.name}</CardTitle>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/{plan.interval}</span>
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
                      disabled={processingPlan !== null || subscription?.is_subscribed}
                      className={`w-full ${
                        plan.id === "yearly" 
                          ? "bg-primary hover:bg-primary/90" 
                          : "bg-white/10 hover:bg-white/20"
                      }`}
                      data-testid={`subscribe-${plan.id}`}
                    >
                      {processingPlan === plan.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : subscription?.is_subscribed ? (
                        "Already Subscribed"
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Subscribe Now
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
            <h3 className="font-medium mb-2">AI Oracle</h3>
            <p className="text-sm text-muted-foreground">Personalized readings and spiritual guidance</p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="text-center pt-8 border-t border-white/10">
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
        </div>
      </main>
    </div>
  );
};

export default Pricing;
