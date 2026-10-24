import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" keeps asset paths relative, so dist/ can be hosted from any
// sub-path (GitHub Pages project sites included).
export default defineConfig({
  base: "./",
  plugins: [react()],
});
