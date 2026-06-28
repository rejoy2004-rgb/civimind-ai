import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { trpc } from "./lib/trpc.ts";

// Suppress benign Vite dev server HMR/WebSocket connection errors
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    try {
      const reasonObj = event.reason;
      let reasonText = "";
      if (reasonObj) {
        if (typeof reasonObj === "string") {
          reasonText = reasonObj;
        } else {
          reasonText = [
            reasonObj.message,
            reasonObj.name,
            reasonObj.description,
            reasonObj.stack,
            String(reasonObj)
          ].filter(Boolean).join(" ");
        }
      }

      const isViteOrWS = 
        /websocket|vite|hmr|closed without opened|connection/i.test(reasonText) ||
        (reasonObj && (
          reasonObj.type === "error" || 
          (reasonObj.target && (reasonObj.target instanceof WebSocket || String(reasonObj.target).includes("WebSocket")))
        ));

      if (isViteOrWS) {
        event.preventDefault();
        event.stopPropagation();
      }
    } catch (e) {
      // Ignore errors inside the handler to prevent infinite loops
    }
  });

  window.addEventListener("error", (event) => {
    try {
      const message = event.message || "";
      const errorObj = event.error;
      let errorText = message;
      if (errorObj) {
        if (typeof errorObj === "string") {
          errorText += " " + errorObj;
        } else {
          errorText += " " + [
            errorObj.message,
            errorObj.name,
            errorObj.description,
            errorObj.stack,
            String(errorObj)
          ].filter(Boolean).join(" ");
        }
      }

      const isViteOrWS = 
        /websocket|vite|hmr|closed without opened|connection/i.test(errorText) ||
        (event.target && (event.target instanceof WebSocket || String(event.target).includes("WebSocket")));

      if (isViteOrWS) {
        event.preventDefault();
        event.stopPropagation();
      }
    } catch (e) {
      // Ignore errors inside the handler
    }
  }, true); // Use capturing phase to intercept resource loading errors like WebSocket failure
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // Stop retrying if unauthorized (code 419 / UNAUTHORIZED)
        if (error?.shape?.code === "UNAUTHORIZED" || error?.data?.code === "UNAUTHORIZED") {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "same-origin", // Required to pass cookies securely in iframe sandbox
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </trpc.Provider>
  </StrictMode>
);
