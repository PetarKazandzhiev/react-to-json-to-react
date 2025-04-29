import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { jsonX } from "vite-plugin-jsonx";

export default defineConfig({
  define: {
    // make __DEV__ available in the browser build
    __DEV__: JSON.stringify("dev" !== "production"),
  },
  plugins: [react(), jsonX()],
  server: {
    port: 3000,
  },
  resolve: {
    // make sure .web.js/.web.jsx modules win over plain .js/.jsx
    extensions: [
      ".web.tsx",
      ".web.ts",
      ".web.jsx",
      ".web.js",
      ".ts",
      ".tsx",
      ".js",
      ".jsx",
    ],
    alias: [
      // your existing alias for @ → /src
      { find: "@", replacement: "/src" },

      // alias all react-native imports to react-native-web
      { find: /^react-native$/, replacement: "react-native-web" },

      // alias the PropRegistry shim which uses Flow syntax
      {
        find: "react-native/Libraries/Renderer/shims/ReactNativePropRegistry",
        replacement: "react-native-web/dist/exports/StyleSheet",
      },
    ],
  },
  optimizeDeps: {
    include: [
      // ensure react-native-web gets pre‐bundled
      "react-native-web",
    ],
  },
});
