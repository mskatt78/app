import { useState, useEffect } from "react";
import { Check, Copy, Download, X, Smartphone } from "lucide-react";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showReopenChip, setShowReopenChip] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const dismissKey = "installPromptDismissed";

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches
      || window.navigator.standalone === true;

    // Check if already installed
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const userAgent = window.navigator.userAgent.toLowerCase();
    const iPadOsDesktopUA = window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1;
    const iosDevice = /iphone|ipad|ipod/.test(userAgent) || iPadOsDesktopUA;
    const safariBrowser = /safari/.test(userAgent) && !/crios|fxios|edgios|opr\//.test(userAgent);
    setIsIos(Boolean(iosDevice && !isStandalone));
    setIsSafari(Boolean(iosDevice && safariBrowser));

    // Dismissed users keep a small reopen chip until installed
    const dismissed = localStorage.getItem(dismissKey) === "1";
    if (dismissed) {
      setShowReopenChip(true);
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!dismissed) {
        setShowReopenChip(false);
        // Show prompt after a short delay
        setTimeout(() => setShowPrompt(true), 2400);
      }
    };

    if (iosDevice && !isStandalone && !dismissed) {
      setTimeout(() => setShowPrompt(true), 2200);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Listen for successful install
    const handleInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setShowReopenChip(false);
      setDeferredPrompt(null);
      localStorage.removeItem(dismissKey);
    };

    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
      localStorage.removeItem(dismissKey);
    }
    
    setShowPrompt(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowReopenChip(true);
    localStorage.setItem(dismissKey, "1");
  };

  const handleReopen = () => {
    setShowPrompt(true);
    setShowReopenChip(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 1600);
    } catch {
      // silent fallback
    }
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
                  ? isSafari
                    ? "On iPhone/iPad Safari: tap Share, then Add to Home Screen."
                    : "On iPhone/iPad, open this app in Safari first, then tap Share → Add to Home Screen."
                  : "Add Shamanic Elements Soul Temple 2.0 to your home screen for quick access, immersive launches, and an app-like mobile experience."}
              </p>

              {isIos && !deferredPrompt && (
                <ol className="text-xs text-muted-foreground space-y-1 mb-3 list-decimal list-inside" data-testid="ios-install-steps">
                  <li>Open in Safari.</li>
                  <li>Tap the Share icon.</li>
                  <li>Choose Add to Home Screen.</li>
                </ol>
              )}

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
                ) : isIos && !isSafari ? (
                  <Button
                    onClick={handleCopyLink}
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                    data-testid="install-prompt-copy-link-btn"
                  >
                    {copiedLink ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copiedLink ? "Copied" : "Copy app link"}
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
