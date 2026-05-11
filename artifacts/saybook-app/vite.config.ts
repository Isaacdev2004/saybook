import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const workspaceRoot = path.resolve(import.meta.dirname, "../..");

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, workspaceRoot, "");
  const rawPort = env.VITE_DEV_PORT || "5173";
  const port = Number(rawPort);

  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid VITE_DEV_PORT value: "${rawPort}"`);
  }

  const apiPort = env.API_PORT || env.PORT || "5000";
  const devApiTarget = env.VITE_DEV_API_URL || `http://127.0.0.1:${apiPort}`;
  const basePath = env.BASE_PATH || "/";
  const apiProxyTimeoutMs = Number(env.VITE_DEV_API_TIMEOUT_MS || "600000");
  const apiProxy = {
    target: devApiTarget,
    changeOrigin: true,
    timeout: apiProxyTimeoutMs,
    proxyTimeout: apiProxyTimeoutMs,
  };

  return {
    envDir: workspaceRoot,
    base: basePath,
    plugins: [
      react(),
      tailwindcss(),
      runtimeErrorOverlay(),
      ...(process.env.NODE_ENV !== "production" &&
      process.env.REPL_ID !== undefined
        ? [
            await import("@replit/vite-plugin-cartographer").then((m) =>
              m.cartographer({
                root: path.resolve(import.meta.dirname, ".."),
              }),
            ),
            await import("@replit/vite-plugin-dev-banner").then((m) =>
              m.devBanner(),
            ),
          ]
        : []),
    ],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
        "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
      },
      dedupe: ["react", "react-dom"],
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      port,
      strictPort: true,
      host: "0.0.0.0",
      allowedHosts: true,
      fs: {
        strict: true,
      },
      proxy: {
        "/api": apiProxy,
      },
    },
    preview: {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
      proxy: {
        "/api": apiProxy,
      },
    },
  };
});
