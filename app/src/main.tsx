import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

// Silence all console.log calls in development to reduce noise (warnings/errors preserved)
if (import.meta.env.DEV) {
  console.log = () => {};
}

// Initialize an agent at application startup.
const fpPromise = FingerprintJS.load({ monitoring: false });

let fingerprint: string | null = null;

export async function getFingerprint() {
  // console.log("function getFingerprint started");
  if (fingerprint) {
    // console.log("function getFingerprint finished");
    return fingerprint;
  }

  const fp = await fpPromise;
  const result = await fp.get();
  fingerprint = result.visitorId;
  // console.log("function getFingerprint finished");
  return fingerprint;
}

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
