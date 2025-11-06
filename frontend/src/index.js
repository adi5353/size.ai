import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";
import "@/i18n/config"; // Initialize i18n
import * as serviceWorkerRegistration from '@/utils/serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Register service worker for PWA functionality
serviceWorkerRegistration.register({
  onSuccess: () => {
    console.log('[PWA] Content cached for offline use');
  },
  onUpdate: (registration) => {
    console.log('[PWA] New version available');
    serviceWorkerRegistration.promptForUpdate(registration);
  },
});
