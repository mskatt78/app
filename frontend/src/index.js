import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

if (process.env.NODE_ENV === "production") {
  const noop = () => {};
  window.console.log = noop;
  window.console.info = noop;
  window.console.debug = noop;
  window.console.warn = noop;
  window.console.error = noop;
}

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        registration.update();

        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              installingWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        });

        let hasRefreshed = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (hasRefreshed) return;
          hasRefreshed = true;
          window.location.reload();
        });
      })
      .catch(() => {});
  });
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
