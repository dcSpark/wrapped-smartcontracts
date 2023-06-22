import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { wasm } from "@rollup/plugin-wasm";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: "es2020",
  },
  optimizeDeps: {
    // 👈 optimizedeps
    esbuildOptions: {
      target: "esnext",
      // Node.js global to browser globalThis
      define: {
        global: "globalThis",
      },
      supported: {
        bigint: true,
      },
    },
  },
  plugins: [react(), wasm()],
});
