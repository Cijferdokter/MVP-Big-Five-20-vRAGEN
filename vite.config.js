import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// BELANGRIJK: pas 'base' aan naar de naam van je GitHub-repo.
// Deze is ingesteld op de repo MVP-Big-Five-20-vRAGEN.
// GitHub Pages serveert de site op https://cijferdokter.github.io/MVP-Big-Five-20-vRAGEN/,
// en zonder de juiste base laden de bestanden niet.
export default defineConfig({
  plugins: [react()],
  base: "/MVP-Big-Five-20-vRAGEN/",
});
