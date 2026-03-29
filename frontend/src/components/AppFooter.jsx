import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Heart } from "lucide-react";
import { Dialog, DialogContent } from "./ui/dialog";
import { FullDisclaimer } from "./HealthDisclaimer";

const AppFooter = () => {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const navigate = useNavigate();
  
  return (
    <>
      <footer className="mt-auto border-t border-white/5 bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-primary" />
              <span>Shamanic Elements Soul Temple 2.0</span>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
              <button 
                onClick={() => setShowDisclaimer(true)}
                className="hover:text-primary transition-colors flex items-center gap-1"
                data-testid="footer-health-disclaimer-btn"
              >
                <Shield className="w-3 h-3" />
                Health Disclaimer
              </button>
              <span className="text-white/20">|</span>
              <button 
                onClick={() => navigate('/support')}
                className="hover:text-primary transition-colors"
                data-testid="footer-support-btn"
              >
                Support Center
              </button>
              <span className="text-white/20">|</span>
              <button 
                onClick={() => navigate('/privacy')}
                className="hover:text-primary transition-colors"
                data-testid="footer-privacy-btn"
              >
                Privacy Policy
              </button>
            </div>
            
            <div className="text-xs text-center md:text-right">
              <p>© {new Date().getFullYear()} All rights reserved</p>
              <p className="text-white/30 mt-1">For educational purposes only</p>
            </div>
          </div>
          
          {/* Mini Disclaimer */}
          <div className="mt-4 pt-4 border-t border-white/5 text-xs text-center text-muted-foreground/60">
            <p>
              This app is not intended to diagnose, treat, cure, or prevent any disease. 
              Always consult a healthcare professional before beginning any new wellness practice.
            </p>
          </div>
        </div>
      </footer>

      {/* Full Disclaimer Modal */}
      <Dialog open={showDisclaimer} onOpenChange={setShowDisclaimer}>
        <DialogContent className="bg-card border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
          <FullDisclaimer />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AppFooter;
