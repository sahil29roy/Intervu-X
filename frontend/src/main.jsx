import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Dynamic API redirection for production deployment
if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
  const originalFetch = window.fetch;
  window.fetch = async (input, init) => {
    let targetInput = input;
    const backendUrl = "https://intervu-x.onrender.com";

    if (typeof input === "string") {
      if (input.startsWith("/api/")) {
        targetInput = backendUrl + input;
      }
    } else if (input instanceof URL) {
      if (input.pathname.startsWith("/api/")) {
        targetInput = new URL(backendUrl + input.pathname + input.search);
      }
    } else if (input instanceof Request) {
      const urlStr = input.url;
      if (urlStr.startsWith(window.location.origin + "/api/")) {
        const newUrl = urlStr.replace(window.location.origin, backendUrl);
        targetInput = new Request(newUrl, input);
      }
    }

    return originalFetch(targetInput, init);
  };
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

