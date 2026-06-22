import { useEffect, useState } from "react";
import { getLocalItem, removeLocalItem, setLocalItem } from "../../utils/clientStorage";
import { appLogger } from "../../utils/logger";

const DISMISS_KEY = "installPromptDismissed";

export const useInstallPromptState = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showReopenChip, setShowReopenChip] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [isChrome, setIsChrome] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches
      || window.navigator.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const userAgent = window.navigator.userAgent.toLowerCase();
    const iPadOsDesktopUA = window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1;
    const iosDevice = /iphone|ipad|ipod/.test(userAgent) || iPadOsDesktopUA;
    const androidDevice = /android/.test(userAgent);
    const safariBrowser = /safari/.test(userAgent) && !/crios|fxios|edgios|opr\//.test(userAgent);
    const chromeBrowser = /chrome/.test(userAgent) && !/edg|opr|samsungbrowser/.test(userAgent);
    const inAppBrowser = /fban|fbav|instagram|line|micromessenger|twitter|snapchat|tiktok|linkedin|messenger|wv\)/.test(userAgent);

    setIsIos(Boolean(iosDevice && !isStandalone));
    setIsAndroid(Boolean(androidDevice && !isStandalone));
    setIsSafari(Boolean(iosDevice && safariBrowser));
    setIsChrome(Boolean(androidDevice && chromeBrowser));
    setIsInAppBrowser(Boolean(inAppBrowser));

    const dismissed = getLocalItem(DISMISS_KEY) === "1";
    if (dismissed) {
      setShowReopenChip(true);
    }

    const handleBeforeInstall = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      if (!dismissed) {
        setShowReopenChip(false);
        window.setTimeout(() => setShowPrompt(true), 2400);
      }
    };

    if ((iosDevice || androidDevice || inAppBrowser) && !isStandalone && !dismissed) {
      window.setTimeout(() => setShowPrompt(true), 2200);
    }

    const handleInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setShowReopenChip(false);
      setDeferredPrompt(null);
      removeLocalItem(DISMISS_KEY);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);

    const openInstallPrompt = () => {
      if (isStandalone || isInstalled) return;
      setShowPrompt(true);
      setShowReopenChip(false);
    };

    window.addEventListener("pwa-install-open", openInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
      window.removeEventListener("pwa-install-open", openInstallPrompt);
    };
  }, [isInstalled]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
      removeLocalItem(DISMISS_KEY);
    }
    setShowPrompt(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowReopenChip(true);
    setLocalItem(DISMISS_KEY, "1");
  };

  const handleReopen = () => {
    setShowPrompt(true);
    setShowReopenChip(false);
  };

  const openChromeAttempt = () => {
    const target = `${window.location.origin}${window.location.pathname}${window.location.search}`;
    if (!isAndroid) {
      window.location.href = "/support";
      return;
    }
    try {
      const hostAndPath = `${window.location.host}${window.location.pathname}${window.location.search}`;
      window.location.href = `intent://${hostAndPath}#Intent;scheme=https;package=com.android.chrome;end`;
      window.setTimeout(() => { window.location.href = target; }, 900);
    } catch (error) {
      appLogger.warn("Open in Chrome intent failed, using fallback URL", error);
      window.location.href = target;
    }
  };

  const openBrowserInstallGuide = () => {
    if (isIos && !isSafari) {
      handleCopyLink();
      return;
    }

    if (isAndroid && !isChrome) {
      openChromeAttempt();
      return;
    }

    window.location.href = "/support";
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 1600);
    } catch (error) {
      appLogger.warn("Copy install link failed", error);
    }
  };

  return {
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
  };
};
