import { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showReopenChip, setShowReopenChip] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    const standalone = window.navigator.standalone;
    setIsIos(Boolean(iosDevice && !standalone));

    // Check if dismissed recently
    const dismissed = localStorage.getItem('installPromptDismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      // Keep a small persistent reopen chip while waiting
      if (Date.now() - dismissedTime < 24 * 60 * 60 * 1000) {
        setShowReopenChip(true);
      }
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowReopenChip(false);
      // Show prompt after 5 seconds on the site
      setTimeout(() => setShowPrompt(true), 5000);
    };

    if (iosDevice && !standalone) {
      setTimeout(() => setShowPrompt(true), 5000);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setShowReopenChip(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    
    setShowPrompt(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowReopenChip(true);
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  };

  const handleReopen = () => {
    setShowPrompt(true);
    setShowReopenChip(false);
  };

  if (isInstalled) return null;

  if (!showPrompt && showReopenChip) {
    return (
      <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-[200]" data-testid="install-reopen-chip">
        <Button onClick={handleReopen} size="sm" className="bg-primary hover:bg-primary/90 shadow-lg" data-testid="install-reopen-chip-btn">
          <Download className="w-4 h-4 mr-2" />
          Install App
        </Button>
      </div>
    );
  }

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-4 right-4 z-[200] max-w-md mx-auto"
        data-testid="install-prompt"
      >
        <div className="bg-card/95 backdrop-blur-xl border border-primary/30 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/20">
              <Smartphone className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">Install App</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {isIos && !deferredPrompt
                  ? "On iPhone or iPad, tap Share and then Add to Home Screen for the full app feel."
                  : "Add Shamanic Elements Soul Temple 2.0 to your home screen for quick access, immersive launches, and an app-like mobile experience."}
              </p>
              <div className="flex gap-2">
                {deferredPrompt ? (
                  <Button
                    onClick={handleInstall}
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                    data-testid="install-prompt-install-btn"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Install
                  </Button>
                ) : (
                  <Button
                    onClick={() => window.location.href = '/support'}
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                    data-testid="install-prompt-guide-btn"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Open install guide
                  </Button>
                )}
                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  data-testid="install-prompt-dismiss-btn"
                >
                  Maybe Later
                </Button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
              data-testid="install-prompt-close-btn"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InstallPrompt;
