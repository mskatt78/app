import { Check, Copy, Download, ExternalLink, TriangleAlert, X, Smartphone } from "lucide-react";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useInstallPromptState } from "./install/useInstallPromptState";

const InstallPrompt = () => {
  const {
    state: {
      deferredPrompt,
      showPrompt,
      showReopenChip,
      isInstalled,
      isIos,
      isAndroid,
      isSafari,
      isChrome,
      isInAppBrowser,
      copiedLink,
    },
    actions: {
      handleInstall,
      handleDismiss,
      handleReopen,
      openChromeAttempt,
      handleCopyLink,
    },
  } = useInstallPromptState();

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
                {isInAppBrowser
                  ? "Install often fails inside Instagram/Facebook/Messenger browsers. Open this link in Safari or Chrome first."
                  : isIos && !deferredPrompt
                  ? isSafari
                    ? "On iPhone/iPad Safari: tap Share, then Add to Home Screen."
                    : "On iPhone/iPad, open this app in Safari first, then tap Share → Add to Home Screen."
                  : isAndroid && !deferredPrompt
                    ? isChrome
                      ? "On Android Chrome: tap menu (⋮) then Install app / Add to Home screen."
                      : "On Android, open this link in Chrome for the most reliable install flow."
                  : "Add Shamanic Elements Soul Temple 2.0 to your home screen for quick access, immersive launches, and an app-like mobile experience."}
              </p>

              {isInAppBrowser && (
                <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-2.5 mb-3" data-testid="install-prompt-inapp-warning">
                  <p className="text-xs text-amber-200 flex items-center gap-2">
                    <TriangleAlert className="w-3.5 h-3.5" />
                    In-app browsers block install prompts on many phones.
                  </p>
                </div>
              )}

              {isIos && !deferredPrompt && (
                <ol className="text-xs text-muted-foreground space-y-1 mb-3 list-decimal list-inside" data-testid="ios-install-steps">
                  <li>Open in Safari.</li>
                  <li>Tap the Share icon.</li>
                  <li>Choose Add to Home Screen.</li>
                </ol>
              )}

              {isAndroid && !deferredPrompt && (
                <ol className="text-xs text-muted-foreground space-y-1 mb-3 list-decimal list-inside" data-testid="android-install-steps-inline">
                  <li>Open this page in Chrome.</li>
                  <li>Tap menu (⋮).</li>
                  <li>Choose Install app or Add to Home screen.</li>
                </ol>
              )}

              <div className="flex flex-wrap gap-2">
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
                ) : isAndroid && !isChrome ? (
                  <Button
                    onClick={openChromeAttempt}
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                    data-testid="install-prompt-open-chrome-btn"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in Chrome
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
                  onClick={handleCopyLink}
                  size="sm"
                  variant="outline"
                  className="border-white/20"
                  data-testid="install-prompt-copy-link-secondary-btn"
                >
                  {copiedLink ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copiedLink ? "Copied" : "Copy link"}
                </Button>
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
