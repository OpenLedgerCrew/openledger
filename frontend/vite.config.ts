import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Overridable so a local dev server can point at a remotely-tunneled backend
// (e.g. VITE_BACKEND_URL=https://xxxx.ngrok-free.dev npm run dev).
const backendTarget = process.env.VITE_BACKEND_URL || "https://openledger-79ty.onrender.com/";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  // Required for @stellar/stellar-sdk (used by the donation flow) to resolve Node's
  // Buffer/global in a browser bundle.
  define: {
    global: "globalThis",
  },
  resolve: {
    alias: {
      buffer: "buffer",
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: backendTarget,
        changeOrigin: true,
        // Bypasses ngrok's free-tier browser-warning interstitial, which would
        // otherwise return an HTML page instead of JSON through the proxy.
        headers: { "ngrok-skip-browser-warning": "true" },
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
  },
});