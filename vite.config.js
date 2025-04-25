import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { jsonX } from "vite-plugin-jsonx";

export default defineConfig({
  plugins: [react(), jsonX()],
  server: { port: 3000 },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
