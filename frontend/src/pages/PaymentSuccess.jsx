import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Loader2, XCircle, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { appLogger } from "../utils/logger";

const PaymentSuccess = ({ user, api }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("checking"); // checking, success, failed
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (sessionId) {
      let isCancelled = false;
      let timeoutId;

      const pollPaymentStatus = async (attempt = 0) => {
        const maxAttempts = 10;
        const pollInterval = 2000;

        if (isCancelled) return;

        if (attempt >= maxAttempts) {
          setStatus("failed");
          return;
        }

        try {
          const response = await api.get(`/payments/status/${sessionId}`);
          if (isCancelled) return;
          setPaymentDetails(response.data);

          if (response.data.payment_status === "paid") {
            setStatus("success");
            return;
          }

          if (response.data.status === "expired") {
            setStatus("failed");
            return;
          }

          timeoutId = setTimeout(() => pollPaymentStatus(attempt + 1), pollInterval);
        } catch (error) {
          appLogger.error("Payment status check failed:", error);
          timeoutId = setTimeout(() => pollPaymentStatus(attempt + 1), pollInterval);
        }
      };

      pollPaymentStatus();

      return () => {
        isCancelled = true;
        if (timeoutId) clearTimeout(timeoutId);
      };
    } else {
      setStatus("failed");
    }
    return undefined;
  }, [api, searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6" data-testid="payment-success-page">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center"
        data-testid="payment-success-card"
      >
        {status === "checking" && (
          <div className="space-y-6" data-testid="payment-success-checking-state">
            <Loader2 className="w-16 h-16 mx-auto animate-spin text-primary" data-testid="payment-success-checking-spinner" />
            <h1 className="text-2xl font-serif" data-testid="payment-success-checking-title">Processing Payment...</h1>
            <p className="text-muted-foreground" data-testid="payment-success-checking-description">Please wait while we confirm your payment.</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6" data-testid="payment-success-paid-state">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <CheckCircle className="w-20 h-20 mx-auto text-green-500" data-testid="payment-success-icon" />
            </motion.div>
            <h1 className="text-3xl font-serif" data-testid="payment-success-title">Payment Successful!</h1>
            <p className="text-muted-foreground" data-testid="payment-success-description">
              Thank you for your purchase. Your access has been activated.
            </p>
            {paymentDetails && (
              <div className="p-4 rounded-xl bg-white/5 text-left" data-testid="payment-success-amount-card">
                <p className="text-sm text-muted-foreground" data-testid="payment-success-amount-label">Amount paid</p>
                <p className="text-2xl font-bold" data-testid="payment-success-amount-value">${paymentDetails.amount?.toFixed(2)} {paymentDetails.currency?.toUpperCase()}</p>
              </div>
            )}
            <Button 
              onClick={() => navigate("/dashboard")} 
              className="w-full"
              data-testid="payment-success-continue-button"
            >
              Continue to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {status === "failed" && (
          <div className="space-y-6" data-testid="payment-success-failed-state">
            <XCircle className="w-20 h-20 mx-auto text-red-500" data-testid="payment-success-failed-icon" />
            <h1 className="text-2xl font-serif" data-testid="payment-success-failed-title">Payment Issue</h1>
            <p className="text-muted-foreground" data-testid="payment-success-failed-description">
              We couldn&apos;t confirm your payment. Please check your email for confirmation or try again.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4" data-testid="payment-success-failed-actions">
              <Button 
                variant="outline"
                onClick={() => navigate("/pricing")} 
                className="flex-1"
                data-testid="payment-success-try-again-button"
              >
                Try Again
              </Button>
              <Button 
                onClick={() => navigate("/dashboard")} 
                className="flex-1"
                data-testid="payment-success-dashboard-button"
              >
                Dashboard
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
