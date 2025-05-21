import { defineConfig, PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from 'url';

// runtimeErrorOverlay might be Replit-specific or dev-only.
// Dynamically import it only if needed and available.
// import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// Handle __dirname and __filename safely
let currentDirname;
try {
  // This will work in ESM contexts like Vite's own execution
  currentDirname = path.dirname(fileURLToPath(import.meta.url));
} catch (e) {
  // Fallback for contexts where import.meta.url is not available or problematic
  currentDirname = process.cwd(); // Assumes vite.config.ts is at project root for path resolution
}

export default defineConfig(async ({ command, mode }) => {
  const plugins: PluginOption[] = [react()];

  // Add Replit-specific plugins only if REPL_ID is set and in development
  if (process.env.REPL_ID && mode === 'development') {
    try {
      const runtimeErrorOverlay = await import('@replit/vite-plugin-runtime-error-modal');
      plugins.push(runtimeErrorOverlay.default()); // .default() if it's a default export
    } catch (e) {
      console.warn('Failed to load @replit/vite-plugin-runtime-error-modal:', e);
    }

    try {
      const cartographerPlugin = await import('@replit/vite-plugin-cartographer');
      plugins.push(cartographerPlugin.cartographer());
    } catch (e) {
      console.warn('Failed to load @replit/vite-plugin-cartographer:', e);
    }
  }

  return {
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(currentDirname, "client", "src"),
        "@shared": path.resolve(currentDirname, "shared"),
        "@assets": path.resolve(currentDirname, "attached_assets"),
      },
    },
    root: path.resolve(currentDirname, "client"), // Set the root to the client directory
    server: {
      fs: {
        strict: false,
      },
    },
    build: {
      outDir: path.resolve(currentDirname, "dist/public"), // Output to dist/public at project root
      emptyOutDir: true,
    },
  };
});
