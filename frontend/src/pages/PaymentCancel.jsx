import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { XCircle, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6" data-testid="payment-cancel-page">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center space-y-6"
        data-testid="payment-cancel-card"
      >
        <XCircle className="w-20 h-20 mx-auto text-muted-foreground" data-testid="payment-cancel-icon" />
        <h1 className="text-2xl font-serif" data-testid="payment-cancel-title">Payment Cancelled</h1>
        <p className="text-muted-foreground" data-testid="payment-cancel-description">
          Your payment was cancelled. No charges have been made to your account.
        </p>
        <div className="flex gap-4" data-testid="payment-cancel-actions">
          <Button 
            variant="outline"
            onClick={() => navigate("/pricing")} 
            className="flex-1"
            data-testid="payment-cancel-back-pricing-button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pricing
          </Button>
          <Button 
            onClick={() => navigate("/dashboard")} 
            className="flex-1"
            data-testid="payment-cancel-dashboard-button"
          >
            Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentCancel;
