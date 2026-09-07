import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Crown, Sparkles, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { appLogger } from "../../utils/logger";

const PLAN_LABELS = {
  monthly: "Monthly Membership",
  yearly: "Yearly Membership",
};

export const SettingsSubscriptionCard = ({ api, navigate }) => {
  const [subscription, setSubscription] = useState(null);
  const [hasFullUnlock, setHasFullUnlock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  const load = useCallback(async () => {
    try {
      const [subRes, entRes] = await Promise.allSettled([
        api.get("/payments/subscription-status"),
        api.get("/payments/entitlements"),
      ]);
      if (subRes.status === "fulfilled") setSubscription(subRes.value.data);
      if (entRes.status === "fulfilled") setHasFullUnlock(Boolean(entRes.value.data?.has_full_app_unlock));
    } catch (error) {
      appLogger.warn("Subscription card load failed", error);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const { data } = await api.post("/payments/subscription/cancel");
      toast.success(data?.message || "Membership cancelled");
      setConfirmingCancel(false);
      await load();
    } catch (error) {
      appLogger.error("Cancel membership failed", error);
      toast.error(error?.response?.data?.detail || "Unable to cancel membership");
    } finally {
      setCancelling(false);
    }
  };

  const isSubscribed = Boolean(subscription?.is_subscribed);
  const isCancelled = subscription?.status === "cancelled";
  const expiresDate = subscription?.expires_at
    ? new Date(subscription.expires_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="p-6 rounded-2xl bg-card/50 border border-white/5"
      data-testid="settings-subscription-card"
    >
      <h2 className="text-xl font-serif mb-6 flex items-center gap-2">
        <Crown className="w-5 h-5 text-primary" />
        Membership
      </h2>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading membership...
        </div>
      ) : hasFullUnlock ? (
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/30" data-testid="settings-lifetime-status">
          <p className="font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> Lifetime Access
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            You own everything, forever. No billing, no renewals.
          </p>
        </div>
      ) : isSubscribed ? (
        <div className="space-y-4" data-testid="settings-active-subscription">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
            <div>
              <p className="font-medium" data-testid="settings-subscription-plan">
                {PLAN_LABELS[subscription.plan] || subscription.plan || "Membership"}
              </p>
              <p className="text-sm text-muted-foreground" data-testid="settings-subscription-renewal">
                {isCancelled
                  ? `Cancelled — access until ${expiresDate || "period end"}`
                  : `Active — renews ${expiresDate || "at period end"}`}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs border ${
                isCancelled
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              }`}
              data-testid="settings-subscription-status-badge"
            >
              {isCancelled ? "Cancelled" : "Active"}
            </span>
          </div>

          {!isCancelled && (
            confirmingCancel ? (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 space-y-3" data-testid="settings-cancel-confirm">
                <p className="text-sm">
                  Cancel your membership? You'll keep full access until {expiresDate || "the end of your paid period"} — after that, premium content locks again.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleCancel}
                    disabled={cancelling}
                    data-testid="settings-cancel-confirm-btn"
                  >
                    {cancelling ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Cancelling...</> : "Yes, cancel membership"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setConfirmingCancel(false)} data-testid="settings-cancel-keep-btn">
                    Keep my membership
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="text-muted-foreground hover:text-destructive hover:border-destructive/40"
                onClick={() => setConfirmingCancel(true)}
                data-testid="settings-cancel-membership-btn"
              >
                Cancel membership
              </Button>
            )
          )}
        </div>
      ) : (
        <div className="space-y-3" data-testid="settings-no-subscription">
          <p className="text-sm text-muted-foreground">No active membership. Unlock the full temple whenever you're ready.</p>
          <Button size="sm" onClick={() => navigate("/pricing")} data-testid="settings-view-plans-btn">
            View plans
          </Button>
        </div>
      )}
    </motion.div>
  );
};
