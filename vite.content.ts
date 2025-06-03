// vite.content.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  define: {
    "process.env": {}, // ✅ Fixes "process is not defined"
  },
  build: {
    outDir: "dist/content",
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, "src/contentScript.tsx"),
      name: "ContentScript",
      formats: ["iife"],
      fileName: () => "contentScript.js",
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true, // ✅ needed when using `lib` with iife
      },
    },
  },
});

// vite build --config vite.content.ts
