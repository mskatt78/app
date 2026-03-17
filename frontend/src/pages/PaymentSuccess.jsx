import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Loader2, XCircle, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";

const PaymentSuccess = ({ user, api }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("checking"); // checking, success, failed
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (sessionId) {
      pollPaymentStatus(sessionId);
    } else {
      setStatus("failed");
    }
  }, [searchParams]);

  const pollPaymentStatus = async (sessionId) => {
    const maxAttempts = 10;
    const pollInterval = 2000;

    if (attempts >= maxAttempts) {
      setStatus("failed");
      return;
    }

    try {
      const response = await api.get(`/payments/status/${sessionId}`);
      setPaymentDetails(response.data);

      if (response.data.payment_status === "paid") {
        setStatus("success");
        return;
      } else if (response.data.status === "expired") {
        setStatus("failed");
        return;
      }

      // Continue polling
      setAttempts(prev => prev + 1);
      setTimeout(() => pollPaymentStatus(sessionId), pollInterval);
    } catch (error) {
      console.error("Payment status check failed:", error);
      setAttempts(prev => prev + 1);
      setTimeout(() => pollPaymentStatus(sessionId), pollInterval);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center"
      >
        {status === "checking" && (
          <div className="space-y-6">
            <Loader2 className="w-16 h-16 mx-auto animate-spin text-primary" />
            <h1 className="text-2xl font-serif">Processing Payment...</h1>
            <p className="text-muted-foreground">Please wait while we confirm your payment.</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <CheckCircle className="w-20 h-20 mx-auto text-green-500" />
            </motion.div>
            <h1 className="text-3xl font-serif">Payment Successful!</h1>
            <p className="text-muted-foreground">
              Thank you for your purchase. Your access has been activated.
            </p>
            {paymentDetails && (
              <div className="p-4 rounded-xl bg-white/5 text-left">
                <p className="text-sm text-muted-foreground">Amount paid</p>
                <p className="text-2xl font-bold">${paymentDetails.amount?.toFixed(2)} {paymentDetails.currency?.toUpperCase()}</p>
              </div>
            )}
            <Button 
              onClick={() => navigate("/dashboard")} 
              className="w-full"
              data-testid="continue-btn"
            >
              Continue to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {status === "failed" && (
          <div className="space-y-6">
            <XCircle className="w-20 h-20 mx-auto text-red-500" />
            <h1 className="text-2xl font-serif">Payment Issue</h1>
            <p className="text-muted-foreground">
              We couldn't confirm your payment. Please check your email for confirmation or try again.
            </p>
            <div className="flex gap-4">
              <Button 
                variant="outline"
                onClick={() => navigate("/pricing")} 
                className="flex-1"
              >
                Try Again
              </Button>
              <Button 
                onClick={() => navigate("/dashboard")} 
                className="flex-1"
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
