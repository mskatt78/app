import { Download } from "lucide-react";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useInstallPromptState } from "./install/useInstallPromptState";
import { InstallPromptContent } from "./install/InstallPromptContent";

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
      openBrowserInstallGuide,
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
        <InstallPromptContent
          deferredPrompt={deferredPrompt}
          isInAppBrowser={isInAppBrowser}
          isIos={isIos}
          isSafari={isSafari}
          isAndroid={isAndroid}
          isChrome={isChrome}
          copiedLink={copiedLink}
          handleInstall={handleInstall}
          openChromeAttempt={openChromeAttempt}
          handleCopyLink={handleCopyLink}
          openBrowserInstallGuide={openBrowserInstallGuide}
          handleDismiss={handleDismiss}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default InstallPrompt;
