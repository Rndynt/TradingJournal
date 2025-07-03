// vite.config.mjs
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// Di ESM, __dirname bisa didapat dari import.meta.url
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(async () => {
  // 1) Inisialisasi array plugin
  const plugins = [
    react(),
    runtimeErrorOverlay(),
  ];

  // 2) Hanya load Cartographer di dev Replit
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
  ) {
    const { cartographer } = await import("@replit/vite-plugin-cartographer");
    plugins.push(cartographer());
  }

  return {
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client", "src"),
        "@shared": path.resolve(__dirname, "shared"),
        "@assets": path.resolve(__dirname, "attached_assets"),
      },
    },
    root: path.resolve(__dirname, "client"),
    build: {
      // output static ke dist/public
      outDir: path.resolve(__dirname, "dist/public"),
      emptyOutDir: true,
      target: "esnext",        // biar top-level await & import.meta jalan
      rollupOptions: {
        // LightningCSS pakai native .node di runtime
        external: ["lightningcss", /^lightningcss-.*/],
        output: {
          format: "esm",       // pastikan modul ESM agar import.meta tersedia
        },
      },
    },
    server: {
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
  };
});
