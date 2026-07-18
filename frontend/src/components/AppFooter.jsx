import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Heart, Facebook, Youtube } from "lucide-react";
import { Dialog, DialogContent } from "./ui/dialog";
import { FullDisclaimer } from "./HealthDisclaimer";

const AppFooter = () => {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const navigate = useNavigate();
  const FACEBOOK_URL = "https://www.facebook.com/share/1BPwWAwwrt/";
  const YOUTUBE_URL = "https://youtube.com/@skywatersacredembodiments9791?si=Oe0YSu-jhsfb9xdL";
  const TIKTOK_URL = "https://www.tiktok.com/@skywatersacredembodiment?_r=1&_t=ZS-97bHi2iASOa";
  
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
              <span className="text-white/20">|</span>
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors flex items-center gap-1"
                data-testid="footer-facebook-link"
              >
                <Facebook className="w-3 h-3" />
                Facebook
              </a>
              <span className="text-white/20">|</span>
              <a
                href={YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors flex items-center gap-1"
                data-testid="footer-youtube-link"
              >
                <Youtube className="w-3 h-3" />
                YouTube
              </a>
              <span className="text-white/20">|</span>
              <a
                href={TIKTOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors flex items-center gap-1"
                data-testid="footer-tiktok-link"
              >
                <span className="w-3 h-3 inline-flex items-center justify-center text-[10px] font-bold">♪</span>
                TikTok
              </a>
              <span className="text-white/20">|</span>
              <button
                onClick={() => navigate('/terms')}
                className="hover:text-primary transition-colors"
                data-testid="footer-terms-btn"
              >
                Terms
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
