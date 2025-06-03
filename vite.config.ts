import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "src/popup/index.html"),
        contentScript: resolve(__dirname, "src/contentScript.tsx"),
      },
      output: {
        entryFileNames: "assets/[name].js",
      },
    },
    outDir: "dist",
    emptyOutDir: true,
  },
});
